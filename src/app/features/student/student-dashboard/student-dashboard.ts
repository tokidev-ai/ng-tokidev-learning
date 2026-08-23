import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { 
  LucideBookOpen, 
  LucideFlame, 
  LucideTrophy, 
  LucidePlay, 
  LucideCheck, 
  LucideLock, 
  LucideArrowLeft, 
  LucideCompass,
  LucideArrowRight
} from '@lucide/angular';

@Component({
  selector: 'app-student-dashboard',
  imports: [
    RouterLink,
    LucideBookOpen, 
    LucideFlame, 
    LucideTrophy, 
    LucidePlay, 
    LucideCheck, 
    LucideLock, 
    LucideArrowLeft, 
    LucideCompass,
    LucideArrowRight
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-dashboard.html'
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);

  protected readonly activeFilter = signal<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  protected readonly selectedPathId = signal<string | null>(null);
  private routeSub?: Subscription;

  protected readonly allEnrolled = computed(() => this.courseService.enrolledCourses());

  protected readonly enrolledCoursesCount = computed(() => this.allEnrolled().length);
  protected readonly activeEnrolledCount = computed(() => this.allEnrolled().filter(item => item.progressPercentage < 100).length);
  protected readonly completedEnrolledCount = computed(() => this.allEnrolled().filter(item => item.progressPercentage >= 100).length);

  protected readonly filteredEnrolled = computed(() => {
    const list = this.allEnrolled();
    const filter = this.activeFilter();
    
    return list.filter(item => {
      if (filter === 'ALL') return true;
      if (filter === 'IN_PROGRESS') return item.progressPercentage < 100;
      if (filter === 'COMPLETED') return item.progressPercentage >= 100;
      return true;
    });
  });

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const courseId = params.get('id');
      if (courseId) {
        this.selectedPathId.set(courseId);
        this.courseService.selectPath(courseId);
      } else {
        this.selectedPathId.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  selectPathCard(pathId: string): void {
    this.router.navigate(['/student/dashboard', pathId]);
  }

  deselectPath(): void {
    this.router.navigate(['/student/dashboard']);
  }

  openLesson(lesson: any): void {
    if (lesson.isLocked) return;
    this.router.navigate(['/classroom', lesson.id]);
  }

  continueLearning(): void {
    const activeLesson = this.courseService.activeLesson();
    if (activeLesson) {
      this.router.navigate(['/classroom', activeLesson.id]);
    } else {
      this.router.navigate(['/classroom']);
    }
  }
}
