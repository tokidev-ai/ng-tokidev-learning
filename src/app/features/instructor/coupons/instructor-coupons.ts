import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { LemonSqueezyService } from '../../../core/services/lemon-squeezy.service';
import { Coupon } from '../../../core/models/payment.model';
import { 
  LucideTicket, 
  LucidePlus, 
  LucideCopy, 
  LucideCheck, 
  LucideTrash2, 
  LucidePower, 
  LucideX, 
  LucideLoader2, 
  LucideTag,
  LucideCalendar
} from '@lucide/angular';

@Component({
  selector: 'app-instructor-coupons',
  imports: [
    ReactiveFormsModule,
    LucideTicket,
    LucidePlus,
    LucideCopy,
    LucideCheck,
    LucideTrash2,
    LucidePower,
    LucideX,
    LucideLoader2,
    LucideTag,
    LucideCalendar
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './instructor-coupons.html'
})
export class InstructorCouponsComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);
  protected readonly lemonSqueezyService = inject(LemonSqueezyService);

  private unsubscribeCoupons?: () => void;

  // Estado del Modal y Cupones
  protected readonly isCouponModalOpen = signal<boolean>(false);
  protected readonly isSubmittingCoupon = signal<boolean>(false);
  protected readonly couponSuccessMsg = signal<string>('');
  protected readonly couponErrorMsg = signal<string>('');
  protected readonly copiedCouponId = signal<string | null>(null);

  protected readonly couponForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
    discountType: ['PERCENTAGE' as 'PERCENTAGE' | 'FIXED', [Validators.required]],
    discountValue: [20, [Validators.required, Validators.min(1)]],
    courseId: [''],
    description: [''],
    maxUses: [null as number | null, [Validators.min(1)]],
    expiresAt: ['']
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.id) {
      this.unsubscribeCoupons = this.lemonSqueezyService.listenToInstructorCoupons(user.id);
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribeCoupons) {
      this.unsubscribeCoupons();
    }
  }

  protected readonly myCourses = computed(() => {
    const user = this.authService.currentUser();
    const all = this.courseService.coursesCatalog();
    if (!user) return [];
    if (user.role === 'ADMIN') return all;
    return all.filter(c => c.instructorId === user.id);
  });

  protected readonly instructorCoupons = computed(() => {
    return this.lemonSqueezyService.instructorCoupons();
  });

  protected readonly activeCouponsCount = computed(() => {
    return this.instructorCoupons().filter(c => c.isActive).length;
  });

  protected readonly totalCouponsUsed = computed(() => {
    return this.instructorCoupons().reduce((sum, c) => sum + (c.usedCount || 0), 0);
  });

  openCreateCouponModal(): void {
    this.couponSuccessMsg.set('');
    this.couponErrorMsg.set('');
    this.couponForm.reset({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      courseId: '',
      description: '',
      maxUses: null,
      expiresAt: ''
    });
    this.isCouponModalOpen.set(true);
  }

  closeCreateCouponModal(): void {
    this.isCouponModalOpen.set(false);
  }

  async submitCreateCoupon(): Promise<void> {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();
    if (!user) return;

    this.isSubmittingCoupon.set(true);
    this.couponErrorMsg.set('');
    this.couponSuccessMsg.set('');

    try {
      const val = this.couponForm.getRawValue();
      const codeClean = (val.code || '').trim().toUpperCase();

      // Validar código duplicado
      const existing = this.lemonSqueezyService.availableCoupons().find(c => c.code.toUpperCase() === codeClean);
      if (existing) {
        this.couponErrorMsg.set(`El código "${codeClean}" ya existe. Por favor usa un código diferente.`);
        this.isSubmittingCoupon.set(false);
        return;
      }

      const expiryDate = val.expiresAt ? new Date(val.expiresAt) : null;

      await this.lemonSqueezyService.createCoupon({
        code: codeClean,
        discountType: val.discountType || 'PERCENTAGE',
        discountValue: Number(val.discountValue) || 10,
        courseId: val.courseId || null,
        instructorId: user.id,
        description: val.description || '',
        maxUses: val.maxUses ? Number(val.maxUses) : undefined,
        expiresAt: expiryDate
      });

      this.couponSuccessMsg.set('¡Cupón creado exitosamente!');
      setTimeout(() => {
        this.closeCreateCouponModal();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      this.couponErrorMsg.set(err.message || 'Error al crear el cupón.');
    } finally {
      this.isSubmittingCoupon.set(false);
    }
  }

  async toggleCoupon(coupon: Coupon): Promise<void> {
    try {
      await this.lemonSqueezyService.toggleCouponStatus(coupon.id, !coupon.isActive);
    } catch (err) {
      console.error(err);
    }
  }

  async deleteCoupon(coupon: Coupon): Promise<void> {
    if (confirm(`¿Estás seguro de eliminar el cupón "${coupon.code}"?`)) {
      try {
        await this.lemonSqueezyService.deleteCoupon(coupon.id);
      } catch (err) {
        console.error(err);
      }
    }
  }

  copyCouponCode(code: string, id: string): void {
    navigator.clipboard.writeText(code);
    this.copiedCouponId.set(id);
    setTimeout(() => {
      this.copiedCouponId.set(null);
    }, 2000);
  }

  getCourseTitle(courseId?: string | null): string {
    if (!courseId) return 'Todos mis cursos';
    const c = this.myCourses().find(course => course.id === courseId);
    return c ? c.title : 'Curso específico';
  }

  formatExpiry(expiresAt: any): string {
    if (!expiresAt) return 'Sin expiración';
    try {
      const date = typeof expiresAt?.toDate === 'function' ? expiresAt.toDate() : new Date(expiresAt);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'Sin expiración';
    }
  }
}
