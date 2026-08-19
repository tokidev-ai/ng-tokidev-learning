import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { 
  LucideUsers, 
  LucideDollarSign, 
  LucideBookOpen, 
  LucideTrendingUp, 
  LucideArrowUpRight, 
  LucideLayers, 
  LucideGraduationCap, 
  LucideSparkles
} from '@lucide/angular';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    RouterLink,
    LucideUsers,
    LucideDollarSign,
    LucideBookOpen,
    LucideTrendingUp,
    LucideArrowUpRight,
    LucideLayers,
    LucideGraduationCap,
    LucideSparkles
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboardComponent {
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);

  protected readonly courses = computed(() => this.courseService.coursesCatalog());
  protected readonly users = computed(() => this.authService.users());

  protected readonly totalEnrollmentsCount = computed(() => {
    return this.courses().reduce((acc, c) => acc + (c.studentsCount || 0), 0);
  });

  protected readonly totalGrossSum = computed(() => {
    return this.courses().reduce((sum, c) => sum + ((c.studentsCount || 0) * (c.price || 0)), 0);
  });

  protected readonly totalPlatformRevenueFormatted = computed(() => {
    return '$' + Math.round(this.totalGrossSum()).toLocaleString() + ' USD';
  });

  protected readonly totalAcademyNet = computed(() => {
    return (this.totalGrossSum() * 0.30).toFixed(2);
  });

  protected readonly totalInstructorRoyalties = computed(() => {
    return (this.totalGrossSum() * 0.70).toFixed(2);
  });

  protected readonly paidCoursesCount = computed(() => {
    return this.courses().filter(c => c.price > 0).length;
  });

  protected readonly freeCoursesCount = computed(() => {
    return this.courses().filter(c => !c.price || c.price === 0).length;
  });

  protected readonly studentUsersCount = computed(() => {
    return this.users().filter(u => u.role === 'STUDENT').length;
  });

  protected readonly instructorUsersCount = computed(() => {
    return this.users().filter(u => u.role === 'INSTRUCTOR').length;
  });

  protected readonly recentUsers = computed(() => {
    return this.users().slice(0, 6);
  });
}
