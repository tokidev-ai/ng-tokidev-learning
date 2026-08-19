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
    if (!user) return all;
    const filtered = all.filter(c => c.instructorId === user.id || c.instructorName.toLowerCase().includes(user.name.toLowerCase()));
    return filtered.length > 0 ? filtered : all;
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
    const courses = this.myCourses();
    if (courses.length === 0) return '5.0';
    const sum = courses.reduce((acc, c) => acc + (c.rating || 5.0), 0);
    return (sum / courses.length).toFixed(1);
  });
}
