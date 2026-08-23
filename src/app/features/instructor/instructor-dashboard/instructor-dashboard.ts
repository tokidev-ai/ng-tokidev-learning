import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { 
  LucideUsers, 
  LucideDollarSign, 
  LucideStar, 
  LucidePlus, 
  LucideTrendingUp, 
  LucideLayers,
  LucideBookOpen,
  LucideSparkles,
  LucideArrowUpRight
} from '@lucide/angular';

@Component({
  selector: 'app-instructor-dashboard',
  imports: [
    RouterLink, 
    LucideUsers, 
    LucideDollarSign, 
    LucideStar, 
    LucidePlus, 
    LucideTrendingUp, 
    LucideLayers,
    LucideBookOpen,
    LucideSparkles,
    LucideArrowUpRight
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './instructor-dashboard.html'
})
export class InstructorDashboardComponent {
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);

  protected readonly myCourses = computed(() => {
    const user = this.authService.currentUser();
    const all = this.courseService.coursesCatalog();
    if (!user) return [];
    if (user.role === 'ADMIN') return all;
    return all.filter(c => c.instructorId === user.id);
  });

  protected readonly totalStudentsCount = computed(() => {
    return this.myCourses().reduce((sum, c) => sum + (c.studentsCount || 0), 0);
  });

  protected readonly totalGrossSum = computed(() => {
    return this.myCourses().reduce((sum, c) => sum + ((c.studentsCount || 0) * (c.price || 0)), 0);
  });

  protected readonly totalEarningsFormatted = computed(() => {
    const total = this.totalGrossSum() * 0.70;
    return '$' + total.toFixed(2) + ' USD';
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
}
