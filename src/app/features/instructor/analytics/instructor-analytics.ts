import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { LemonSqueezyService } from '../../../core/services/lemon-squeezy.service';
import { Course } from '../../../core/models/course.model';
import { 
  LucideEye, 
  LucideUsers, 
  LucidePercent, 
  LucidePencil, 
  LucideBarChart3
} from '@lucide/angular';

export interface CoursePerformance {
  course: Course;
  views: number;
  students: number;
  conversionRate: number;
  earnings: number;
}

@Component({
  selector: 'app-instructor-analytics',
  imports: [
    RouterLink,
    LucideEye,
    LucideUsers,
    LucidePercent,
    LucidePencil,
    LucideBarChart3
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './instructor-analytics.html'
})
export class InstructorAnalyticsComponent {
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);
  protected readonly lemonSqueezyService = inject(LemonSqueezyService);

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

  protected readonly totalCourseViews = computed(() => {
    return this.myCourses().reduce((sum, c) => sum + (c.viewsCount || 0), 0);
  });

  protected readonly totalStudentsCount = computed(() => {
    return this.myCourses().reduce((sum, c) => sum + (c.studentsCount || 0), 0);
  });

  protected readonly overallConversionRate = computed(() => {
    const views = this.totalCourseViews();
    const students = this.totalStudentsCount();
    if (views === 0) return '0.0';
    return ((students / views) * 100).toFixed(1);
  });

  protected readonly coursePerformanceList = computed<CoursePerformance[]>(() => {
    const courses = this.myCourses();
    const orders = this.myOrders();

    return courses.map(c => {
      const views = c.viewsCount || 0;
      const students = c.studentsCount || 0;
      const conversionRate = views > 0 ? Number(((students / views) * 100).toFixed(1)) : 0;
      
      const courseOrders = orders.filter(o => o.courseId === c.id || o.courseTitle === c.title);
      const earnings = courseOrders.reduce((sum, o) => sum + (o.split?.instructorEarnings || 0), 0);

      return {
        course: c,
        views,
        students,
        conversionRate,
        earnings
      };
    }).sort((a, b) => b.views - a.views);
  });
}
