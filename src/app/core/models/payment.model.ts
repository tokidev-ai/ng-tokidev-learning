import { Timestamp } from 'firebase/firestore';

export type PaymentGatewayType = 'LEMON_SQUEEZY' | 'MANUAL_QR' | 'STRIPE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type PayoutStatus = 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED';

/**
 * Desglose financiero de una venta
 */
export interface PaymentSplit {
  grossAmount: number;         // Monto bruto pagado por el estudiante (ej. $20.00 USD)
  currency: 'USD' | 'BOB';
  gatewayFee: number;          // Comisión de Lemon Squeezy (5% + $0.50 USD)
  netAmount: number;           // Monto neto tras restar la pasarela (grossAmount - gatewayFee)
  platformFeePercentage: number; // Porcentaje de la plataforma (ej. 30%)
  platformFeeAmount: number;   // Monto que gana la plataforma TokiDev (30% de netAmount)
  instructorEarnings: number;  // Monto que gana el profesor (70% de netAmount)
}

/**
 * Registro de una orden de compra en la colección 'orders'
 */
export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  split: PaymentSplit;
  paymentGateway: PaymentGatewayType;
  gatewayOrderId?: string;
  gatewayCustomerId?: string;
  status: PaymentStatus;
  checkoutUrl?: string;
  createdAt: Timestamp;
  paidAt?: Timestamp;
}

/**
 * Billetera acumulada del docente en la colección 'instructor_wallets'
 */
export interface InstructorWallet {
  id?: string;
  instructorId: string;
  instructorName: string;
  totalEarned: number;          // Total histórico ganado en USD
  availableBalance: number;     // Saldo actual disponible para retiro
  pendingPayout: number;        // Saldo bloqueado en solicitudes de retiro pendientes
  totalPaidOut: number;         // Total ya liquidado/transferido al profesor
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    documentId: string;
    accountType: 'CAJA_AHORRO' | 'CUENTA_CORRIENTE';
    qrImageUrl?: string;
    paypalEmail?: string;
    binancePayId?: string;
  };
  updatedAt: Timestamp;
}

/**
 * Solicitud de retiro de fondos en 'payout_requests'
 */
export interface PayoutRequest {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  amount: number;
  currency: 'USD' | 'BOB';
  status: PayoutStatus;
  destinationMethod: 'BANK_BOLIVIA' | 'QR_BOLIVIA' | 'PAYPAL' | 'BINANCE' | 'WISE';
  destinationDetails: Record<string, string>;
  receiptUrl?: string;          // Comprobante de pago subido por el admin
  adminNotes?: string;
  requestedAt: Timestamp;
  processedAt?: Timestamp;
}

/**
 * Modelo de Códigos de Descuento y Cupones Promocionales
 */
export interface Coupon {
  id: string;
  code: string;               // Ej: 'TOKIDEV50'
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;      // 50 (50%) o 10 ($10 USD)
  courseId?: string | null;   // Si es null aplica a todos los cursos
  description?: string;
  maxUses?: number;
  usedCount?: number;
  isActive: boolean;
  expiresAt?: Timestamp | null;
}

/**
 * Opciones para abrir el Checkout de Lemon Squeezy
 */
export interface LemonSqueezyCheckoutOptions {
  variantId?: string;           // ID del producto/variante en Lemon Squeezy (si aplica)
  customPrice?: number;         // Precio en USD
  courseId: string;
  courseTitle: string;
  learningPathId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  instructorId: string;
  instructorName: string;
  discountCode?: string;
  discountAmount?: number;
  redirectUrl?: string;
}
