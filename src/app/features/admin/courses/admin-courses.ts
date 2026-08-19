import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { Router, RouterLink } from '@angular/router';
import { 
  LucideBookOpen, 
  LucideDollarSign, 
  LucideUsers, 
  LucideStar, 
  LucideChevronDown, 
  LucideChevronUp, 
  LucideGraduationCap,
  LucideLayers
} from '@lucide/angular';

@Component({
  selector: 'app-admin-courses',
  imports: [
    RouterLink,
    LucideBookOpen,
    LucideDollarSign,
    LucideUsers,
    LucideStar,
    LucideChevronDown,
    LucideChevronUp,
    LucideGraduationCap,
    LucideLayers
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-courses.html'
})
export class AdminCoursesComponent {
  protected readonly courseService = inject(CourseService);
  private readonly router = inject(Router);

  protected readonly expandedCourseId = signal<string | null>(null);

  protected readonly courses = computed(() => this.courseService.coursesCatalog());

  protected readonly totalEnrollments = computed(() => {
    return this.courses().reduce((sum, c) => sum + (c.studentsCount || 0), 0).toLocaleString();
  });

  protected readonly totalPlatformRevenue = computed(() => {
    const sum = this.courses().reduce((sum, c) => sum + ((c.studentsCount || 0) * (c.price || 0)), 0);
    return '$' + Math.round(sum).toLocaleString() + ' USD';
  });

  getBruto(course: Course): string {
    return ((course.studentsCount || 0) * (course.price || 0)).toFixed(2);
  }

  getRoyalties(course: Course): string {
    return ((course.studentsCount || 0) * (course.price || 0) * 0.70).toFixed(2);
  }

  getNetto(course: Course): string {
    return ((course.studentsCount || 0) * (course.price || 0) * 0.30).toFixed(2);
  }

  toggleCourseExpand(courseId: string): void {
    this.expandedCourseId.update(curr => curr === courseId ? null : courseId);
  }

  viewCourseStudents(courseId: string): void {
    this.router.navigate(['/admin/courses', courseId, 'students']);
  }
}
