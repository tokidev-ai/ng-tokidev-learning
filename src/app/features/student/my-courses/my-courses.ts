import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { 
  LucideBookOpen, 
  LucidePlay, 
  LucideCompass, 
  LucideSearch, 
  LucideCheckCircle2
} from '@lucide/angular';

@Component({
  selector: 'app-my-courses',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    LucideBookOpen, 
    LucidePlay, 
    LucideCompass, 
    LucideSearch, 
    LucideCheckCircle2
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-courses.html'
})
export class MyCoursesComponent {
  private readonly router = inject(Router);
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);

  protected readonly activeFilter = signal<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  protected readonly searchControl = new FormControl('');

  protected readonly allEnrolled = computed(() => this.courseService.enrolledCourses());

  protected readonly totalEnrolledCount = computed(() => this.allEnrolled().length);
  protected readonly inProgressCount = computed(() => this.allEnrolled().filter(item => item.progressPercentage < 100).length);
  protected readonly completedCount = computed(() => this.allEnrolled().filter(item => item.progressPercentage >= 100).length);

  protected readonly filteredEnrolledCourses = computed(() => {
    const list = this.allEnrolled();
    const filter = this.activeFilter();
    const search = (this.searchControl.value || '').trim().toLowerCase();

    return list.filter(item => {
      // Filtro de estado
      if (filter === 'IN_PROGRESS' && item.progressPercentage >= 100) return false;
      if (filter === 'COMPLETED' && item.progressPercentage < 100) return false;

      // Filtro de búsqueda
      if (search) {
        const matchesTitle = item.course.title.toLowerCase().includes(search);
        const matchesCat = item.course.category.toLowerCase().includes(search);
        const matchesDesc = item.course.description.toLowerCase().includes(search);
        return matchesTitle || matchesCat || matchesDesc;
      }

      return true;
    });
  });

  goToClassroom(pathId: string): void {
    this.courseService.activePathId.set(pathId);
    this.router.navigate(['/classroom']);
  }
}
