import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { db } from '../firebase/firebase';
import { collection, doc, setDoc, updateDoc, increment, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import { CourseService } from './course.service';
import { 
  Order, 
  PaymentSplit, 
  LemonSqueezyCheckoutOptions,
  Coupon,
  InstructorWallet
} from '../models/payment.model';

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Setup: (options: { eventHandler: (event: { event: string; data?: any }) => void }) => void;
      Url: {
        Open: (url: string) => void;
        Close: () => void;
      };
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class LemonSqueezyService {
  private readonly courseService = inject(CourseService);
  private readonly router = inject(Router);

  // Estados reactivos con Signals
  readonly isScriptLoading = signal<boolean>(false);
  readonly isCheckoutProcessing = signal<boolean>(false);
  readonly lastOrder = signal<Order | null>(null);
  readonly orders = signal<Order[]>([]);
  readonly currentWallet = signal<InstructorWallet | null>(null);

  constructor() {
    this.listenToAllOrders();
  }

  /**
   * Escucha todas las órdenes en tiempo real desde Firestore
   */
  private listenToAllOrders(): void {
    const ordersCol = collection(db, 'orders');
    onSnapshot(ordersCol, (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      // Ordenar por fecha descendente
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      this.orders.set(list);
    }, (err) => {
      console.warn('No se pudieron escuchar las órdenes en tiempo real:', err);
    });
  }

  /**
   * Escucha la billetera de un instructor específico en tiempo real
   */
  listenToInstructorWallet(instructorId: string): () => void {
    if (!instructorId) return () => {};
    const walletDoc = doc(db, 'instructor_wallets', instructorId);
    return onSnapshot(walletDoc, (snap) => {
      if (snap.exists()) {
        this.currentWallet.set({ id: snap.id, ...snap.data() } as any);
      } else {
        this.currentWallet.set({
          id: instructorId,
          instructorId,
          instructorName: 'Instructor TokiDev',
          totalEarned: 0,
          availableBalance: 0,
          pendingPayout: 0,
          totalPaidOut: 0,
          updatedAt: Timestamp.now()
        });
      }
    });
  }

  // Cupones activos predeterminados (compatibles con Firestore)
  readonly availableCoupons = signal<Coupon[]>([
    {
      id: 'c-50',
      code: 'TOKIDEV50',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      description: '50% de descuento especial',
      isActive: true
    },
    {
      id: 'c-100',
      code: 'TOKIDEV100',
      discountType: 'PERCENTAGE',
      discountValue: 100,
      description: '100% Beca completa (Gratis)',
      isActive: true
    },
    {
      id: 'c-admin',
      code: 'SUPERADMIN',
      discountType: 'PERCENTAGE',
      discountValue: 100,
      description: 'Acceso total de SuperAdmin',
      isActive: true
    },
    {
      id: 'c-10usd',
      code: 'PROMO10',
      discountType: 'FIXED',
      discountValue: 10,
      description: '$10 USD de descuento directo',
      isActive: true
    }
  ]);

  private isSdkInitialized = false;

  /**
   * Valida un código de cupón y calcula el monto descontado y el precio final
   */
  validateCoupon(code: string, originalPrice: number, courseId?: string): {
    valid: boolean;
    discountAmount: number;
    finalPrice: number;
    message: string;
    coupon?: Coupon;
  } {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        message: 'Por favor ingresa un código de descuento.'
      };
    }

    const coupon = this.availableCoupons().find(c => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        message: 'Código de descuento inválido o expirado.'
      };
    }

    if (coupon.courseId && courseId && coupon.courseId !== courseId) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        message: 'Este código no aplica para este curso específico.'
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Number(((originalPrice * coupon.discountValue) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(originalPrice, coupon.discountValue);
    }

    const finalPrice = Math.max(0, Number((originalPrice - discountAmount).toFixed(2)));

    return {
      valid: true,
      discountAmount,
      finalPrice,
      message: `¡Cupón ${coupon.code} aplicado! ${coupon.description || ''}`,
      coupon
    };
  }

  /**
   * Calcula el desglose financiero exacto de la venta (Comisión Lemon Squeezy + Reparto TokiDev / Docente).
   * Fórmula estándar Lemon Squeezy: 5% + $0.50 USD por transacción.
   *
   * @param grossPrice Precio bruto del curso en USD
   * @param platformFeePercentage Porcentaje para la plataforma (por defecto 30%)
   */
  calculateSplit(grossPrice: number, platformFeePercentage: number = 30): PaymentSplit {
    const validPrice = Math.max(0, Number(grossPrice) || 0);

    if (validPrice === 0) {
      return {
        grossAmount: 0,
        currency: 'USD',
        gatewayFee: 0,
        netAmount: 0,
        platformFeePercentage,
        platformFeeAmount: 0,
        instructorEarnings: 0
      };
    }

    // Comisión de Lemon Squeezy: 5% + $0.50 USD
    const feePercentage = validPrice * 0.05;
    const fixedFee = 0.50;
    const rawGatewayFee = feePercentage + fixedFee;
    const gatewayFee = Math.min(validPrice, Number(rawGatewayFee.toFixed(2)));

    // Monto neto restante
    const netAmount = Number((validPrice - gatewayFee).toFixed(2));

    // Reparto
    const platformShareRatio = platformFeePercentage / 100;
    const platformFeeAmount = Number((netAmount * platformShareRatio).toFixed(2));
    const instructorEarnings = Number((netAmount - platformFeeAmount).toFixed(2));

    return {
      grossAmount: validPrice,
      currency: 'USD',
      gatewayFee,
      netAmount,
      platformFeePercentage,
      platformFeeAmount,
      instructorEarnings
    };
  }

  /**
   * Carga dinámica del SDK de Lemon Squeezy (lemon.js) para mostrar el checkout embebido
   */
  async loadScript(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (this.isSdkInitialized && window.LemonSqueezy) return;

    this.isScriptLoading.set(true);

    return new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById('lemon-squeezy-sdk');
      if (existingScript) {
        this.isSdkInitialized = true;
        this.isScriptLoading.set(false);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'lemon-squeezy-sdk';
      script.src = 'https://assets.lemonsqueezy.com/lemon.js';
      script.defer = true;
      script.onload = () => {
        if (window.createLemonSqueezy) {
          window.createLemonSqueezy();
        }
        this.isSdkInitialized = true;
        this.isScriptLoading.set(false);
        resolve();
      };
      script.onerror = (err) => {
        this.isScriptLoading.set(false);
        reject(new Error('No se pudo cargar el SDK de Lemon Squeezy: ' + err));
      };

      document.head.appendChild(script);
    });
  }

  private readonly defaultCheckoutUrl = 'https://tokidev-learning.lemonsqueezy.com/checkout/buy/b049350d-03fb-4b5f-840a-b6976eb2b9bd';

  /**
   * Abre la pasarela oficial de Lemon Squeezy (Overlay embebido o Checkout URL)
   */
  async openCheckout(options: LemonSqueezyCheckoutOptions, customCheckoutUrl?: string): Promise<void> {
    this.isCheckoutProcessing.set(true);

    try {
      await this.loadScript();

      // Configurar el escucha de eventos de Lemon Squeezy
      if (window.LemonSqueezy) {
        window.LemonSqueezy.Setup({
          eventHandler: async (eventData: { event: string; data?: any }) => {
            console.log('[LemonSqueezy Event]', eventData);
            if (eventData.event === 'PaymentSuccess' || eventData.event === 'CheckoutSuccess') {
              const orderId = eventData.data?.order?.id || `LS-LIVE-${Date.now()}`;
              await this.recordSuccessfulOrder(options, String(orderId));
              if (options.learningPathId) {
                const slug = this.courseService.getPathSlug(options.learningPathId) || options.learningPathId;
                this.courseService.selectPath(options.learningPathId);
                this.router.navigate(['/classroom', slug]);
              }
            }
          }
        });
      }

      const checkoutUrl = customCheckoutUrl || this.defaultCheckoutUrl;

      // Adjuntar datos del estudiante y cupón al checkout oficial
      let finalUrl = checkoutUrl;
      const separator = finalUrl.includes('?') ? '&' : '?';
      
      const params = new URLSearchParams();
      if (options.studentEmail) params.append('checkout[email]', options.studentEmail);
      if (options.studentName) params.append('checkout[name]', options.studentName);
      if (options.discountCode) params.append('checkout[discount_code]', options.discountCode);
      
      // Pasar metadatos custom para seguimiento
      params.append('checkout[custom][studentId]', options.studentId);
      params.append('checkout[custom][courseId]', options.courseId);
      params.append('checkout[custom][instructorId]', options.instructorId);
      params.append('checkout[custom][learningPathId]', options.learningPathId);

      finalUrl = `${finalUrl}${separator}${params.toString()}`;

      // Abrir Overlay oficial de Lemon.js
      if (window.LemonSqueezy?.Url?.Open) {
        window.LemonSqueezy.Url.Open(finalUrl);
      } else {
        window.open(finalUrl, '_blank');
      }
    } finally {
      this.isCheckoutProcessing.set(false);
    }
  }

  /**
   * Registra una orden procesada y acredita las ganancias al docente en Firestore
   */
  async recordSuccessfulOrder(options: LemonSqueezyCheckoutOptions, gatewayOrderId?: string): Promise<Order> {
    this.isCheckoutProcessing.set(true);

    try {
      const split = this.calculateSplit(options.customPrice || 0);
      const orderRef = doc(collection(db, 'orders'));
      const orderId = orderRef.id;

      const orderData: Order = {
        id: orderId,
        studentId: options.studentId,
        studentName: options.studentName,
        studentEmail: options.studentEmail,
        courseId: options.courseId,
        courseTitle: options.courseTitle,
        instructorId: options.instructorId || 'platform',
        instructorName: options.instructorName || 'TokiDev Team',
        split,
        paymentGateway: 'LEMON_SQUEEZY',
        gatewayOrderId: gatewayOrderId || `LS-${Date.now()}`,
        status: 'PAID',
        createdAt: Timestamp.now(),
        paidAt: Timestamp.now()
      };

      // 1. Guardar la orden en la colección 'orders'
      await setDoc(orderRef, {
        ...orderData,
        createdAt: serverTimestamp(),
        paidAt: serverTimestamp()
      });

      // 2. Acreditar saldo en la billetera del docente 'instructor_wallets' si aplica
      if (options.instructorId && options.instructorId !== 'platform') {
        const walletRef = doc(db, 'instructor_wallets', options.instructorId);
        await setDoc(walletRef, {
          instructorId: options.instructorId,
          instructorName: options.instructorName,
          totalEarned: increment(split.instructorEarnings),
          availableBalance: increment(split.instructorEarnings),
          pendingPayout: increment(0),
          totalPaidOut: increment(0),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // 3. Matricular al estudiante en el curso
      if (options.learningPathId) {
        await this.courseService.enrollInPath(options.learningPathId);
      }

      this.lastOrder.set(orderData);
      return orderData;
    } finally {
      this.isCheckoutProcessing.set(false);
    }
  }
}
