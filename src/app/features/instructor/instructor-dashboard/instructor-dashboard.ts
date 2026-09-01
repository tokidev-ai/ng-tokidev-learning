import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { LemonSqueezyService } from '../../../core/services/lemon-squeezy.service';
import { Course } from '../../../core/models/course.model';
import { 
  LucideUsers, 
  LucideDollarSign, 
  LucidePlus, 
  LucideTrendingUp, 
  LucideLayers,
  LucideArrowUpRight,
  LucideWallet,
  LucideReceipt,
  LucideCheckCircle2,
  LucideLoader2
} from '@lucide/angular';

@Component({
  selector: 'app-instructor-dashboard',
  imports: [
    RouterLink, 
    LucideUsers, 
    LucideDollarSign, 
    LucidePlus, 
    LucideTrendingUp, 
    LucideLayers,
    LucideArrowUpRight,
    LucideWallet,
    LucideReceipt,
    LucideCheckCircle2,
    LucideLoader2
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './instructor-dashboard.html'
})
export class InstructorDashboardComponent implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);
  protected readonly lemonSqueezyService = inject(LemonSqueezyService);

  private unsubscribeWallet?: () => void;
  protected readonly isSimulatingSale = signal(false);
  protected readonly simulationMessage = signal<string>('');

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.id) {
      this.unsubscribeWallet = this.lemonSqueezyService.listenToInstructorWallet(user.id);
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribeWallet) {
      this.unsubscribeWallet();
    }
  }

  protected readonly myCourses = computed(() => {
    const user = this.authService.currentUser();
    const all = this.courseService.coursesCatalog();
    if (!user) return [];
    if (user.role === 'ADMIN') return all;
    return all.filter(c => c.instructorId === user.id);
  });

  protected readonly myOrders = computed(() => {
    const user = this.authService.currentUser();
    const allOrders = this.lemonSqueezyService.orders();
    if (!user) return [];
    if (user.role === 'ADMIN') return allOrders;
    return allOrders.filter(o => o.instructorId === user.id || o.instructorId === 'platform');
  });

  protected readonly totalStudentsCount = computed(() => {
    return this.myCourses().reduce((sum, c) => sum + (c.studentsCount || 0), 0);
  });

  protected readonly totalGrossSum = computed(() => {
    return this.myOrders().reduce((sum, o) => sum + (o.split?.grossAmount || 0), 0);
  });

  protected readonly totalInstructorEarnings = computed(() => {
    return this.myOrders().reduce((sum, o) => sum + (o.split?.instructorEarnings || 0), 0);
  });

  protected readonly totalPlatformFees = computed(() => {
    return this.myOrders().reduce((sum, o) => sum + (o.split?.platformFeeAmount || 0), 0);
  });

  protected readonly totalGatewayFees = computed(() => {
    return this.myOrders().reduce((sum, o) => sum + (o.split?.gatewayFee || 0), 0);
  });

  protected readonly totalEarningsFormatted = computed(() => {
    return '$' + this.totalInstructorEarnings().toFixed(2) + ' USD';
  });

  protected readonly paidCoursesCount = computed(() => {
    return this.myCourses().filter(c => c.price > 0).length;
  });

  protected readonly freeCoursesCount = computed(() => {
    return this.myCourses().filter(c => !c.price || c.price === 0).length;
  });

  protected readonly averageRating = computed(() => {
    const reviewedCourses = this.myCourses().filter(c => (c.reviewsCount || 0) > 0);
    if (reviewedCourses.length === 0) return '0.0';
    const sum = reviewedCourses.reduce((acc, c) => acc + (c.rating || 0), 0);
    return (sum / reviewedCourses.length).toFixed(1);
  });

  async simulateTestSale(course?: Course): Promise<void> {
    const user = this.authService.currentUser();
    const targetCourse = course || this.myCourses()[0] || {
      id: 'course-demo-1',
      title: 'Curso de Prueba TokiDev',
      learningPathId: 'path-demo',
      price: 12.00,
      instructorId: user?.id || 'instructor-demo',
      instructorName: user?.name || 'Instructor TokiDev'
    };

    this.isSimulatingSale.set(true);
    this.simulationMessage.set('');

    try {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      await this.lemonSqueezyService.recordSuccessfulOrder({
        courseId: targetCourse.id,
        courseTitle: targetCourse.title,
        learningPathId: (targetCourse as any).learningPathId || targetCourse.id,
        customPrice: targetCourse.price || 12.00,
        studentId: `student-${randomId}`,
        studentName: `Alumno Simulado #${randomId}`,
        studentEmail: `alumno${randomId}@tokidev.io`,
        instructorId: targetCourse.instructorId || user?.id || 'platform',
        instructorName: targetCourse.instructorName || user?.name || 'Instructor TokiDev'
      }, `LS-TEST-${Date.now()}`);

      this.simulationMessage.set(`¡Venta simulada con éxito para "${targetCourse.title}"! Fondos y comisiones acreditados en Firestore.`);
    } catch (err) {
      console.error('Error al simular venta:', err);
    } finally {
      this.isSimulatingSale.set(false);
    }
  }
}
