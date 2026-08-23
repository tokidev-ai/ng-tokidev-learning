import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course } from '../../../core/models/course.model';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  LucideArrowLeft, 
  LucideStar, 
  LucidePlayCircle, 
  LucideInfinity, 
  LucideAward, 
  LucideMessageSquare, 
  LucideShoppingCart, 
  LucideArrowRight, 
  LucideShieldCheck, 
  LucideX, 
  LucideCheck, 
  LucideLoader2, 
  LucidePencil 
} from '@lucide/angular';

@Component({
  selector: 'app-course-detail',
  imports: [
    RouterLink, 
    ReactiveFormsModule,
    MarkdownPipe,
    LucideArrowLeft,
    LucideStar,
    LucidePlayCircle,
    LucideInfinity,
    LucideAward,
    LucideMessageSquare,
    LucideShoppingCart,
    LucideArrowRight,
    LucideShieldCheck,
    LucideX,
    LucideCheck,
    LucideLoader2,
    LucidePencil
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './course-detail.html'
})
export class CourseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly isCheckoutOpen = signal(false);
  protected readonly isPaymentProcessing = signal(false);
  protected readonly isPaymentSuccess = signal(false);

  protected readonly paymentForm = this.fb.group({
    cardHolder: ['Rodrigo TokiDev', Validators.required],
    cardNumber: ['4532 8901 2345 6789', [Validators.required, Validators.pattern('^[0-9\\s]{16,19}$')]],
    expiry: ['12/28', [Validators.required]],
    cvc: ['889', [Validators.required, Validators.pattern('^[0-9]{3}$')]]
  });

  protected readonly courseId = computed(() => {
    return this.route.snapshot.paramMap.get('id') || '';
  });

  protected readonly course = computed(() => {
    const id = this.courseId();
    return this.courseService.coursesCatalog().find(c => c.id === id) || null;
  });

  constructor() {
    effect(() => {
      const c = this.course();
      if (c && c.learningPathId) {
        this.courseService.selectPath(c.learningPathId);
      }
    });
  }

  protected readonly path = computed(() => {
    const c = this.course();
    if (!c) return null;
    const paths = this.courseService.learningPaths();
    const details = this.courseService.activePathDetails();
    const foundPath = paths.find(p => p.id === c.learningPathId);
    
    if (!foundPath) {
      return {
        id: c.learningPathId,
        title: c.title,
        subtitle: c.description,
        badge: 'Completo',
        progressPercentage: 0,
        totalModules: details.length,
        totalSessions: details.reduce((sum, d) => sum + d.lessons.length, 0),
        days: details
      };
    }

    return {
      ...foundPath,
      days: details.length > 0 ? details : (foundPath.days || [])
    };
  });

  isAuthorOrStaff(course: Course | null): boolean {
    if (!course) return false;
    const user = this.authService.currentUser();
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'INSTRUCTOR') {
      return course.instructorId === user.id || 
             course.instructorName.toLowerCase().includes(user.name.toLowerCase()) || 
             user.email === 'rodrigo@tokidev.io' ||
             true; // All instructors can preview & edit courses in instructor mode
    }
    return false;
  }

  isAlreadyEnrolled(courseId: string): boolean {
    const c = this.course();
    if (!c) return false;
    return this.courseService.myEnrollments().some(e => e.pathId === c.learningPathId);
  }

  goToClassroom(course: any): void {
    this.courseService.selectPath(course.learningPathId);
    const path = this.courseService.learningPaths().find(p => p.id === course.learningPathId);
    const firstLessonId = path?.days[0]?.lessons[0]?.id;
    if (firstLessonId) {
      this.courseService.selectLesson(firstLessonId);
      this.router.navigate(['/classroom', firstLessonId]);
    } else {
      this.router.navigate(['/classroom']);
    }
  }

  async processPayment(course: any): Promise<void> {
    if (this.paymentForm.valid) {
      this.isPaymentProcessing.set(true);

      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await this.courseService.enrollInPath(course.learningPathId);

        this.isPaymentProcessing.set(false);
        this.isPaymentSuccess.set(true);

        setTimeout(() => {
          this.isCheckoutOpen.set(false);
          this.isPaymentSuccess.set(false);
          this.goToClassroom(course);
        }, 1200);
      } catch (err) {
        console.error('Error al matricularse en el curso:', err);
        alert('Ocurrió un error al procesar la inscripción.');
        this.isPaymentProcessing.set(false);
      }
    }
  }
}
