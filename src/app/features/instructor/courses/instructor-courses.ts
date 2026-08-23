import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { 
  LucideUsers, 
  LucideDollarSign, 
  LucideStar, 
  LucidePlus, 
  LucidePencil, 
  LucideTrash2,
  LucideExternalLink,
  LucideLayers,
  LucideArrowLeft
} from '@lucide/angular';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input';
import { FilterSelectComponent, FilterOption } from '../../../shared/components/filter-select/filter-select';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-instructor-courses',
  imports: [
    RouterLink, 
    LucideUsers, 
    LucideDollarSign, 
    LucideStar, 
    LucidePlus, 
    LucidePencil, 
    LucideTrash2,
    LucideExternalLink,
    LucideLayers,
    LucideArrowLeft,
    SearchInputComponent,
    FilterSelectComponent,
    ConfirmModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './instructor-courses.html'
})
export class InstructorCoursesComponent {
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);
  private readonly router = inject(Router);

  // Search & Filter Signals
  protected readonly searchQuery = signal<string>('');
  protected readonly categoryFilter = signal<string>('ALL');

  // Modal State Signals
  protected readonly isDeleteModalOpen = signal<boolean>(false);
  protected readonly isDeletingCourse = signal<boolean>(false);
  protected readonly selectedCourse = signal<Course | null>(null);

  protected readonly categoryOptions: FilterOption[] = [
    { value: 'ALL', label: 'Todas las Categorías' },
    { value: 'Inteligencia Artificial', label: 'Inteligencia Artificial' },
    { value: 'Desarrollo Web', label: 'Desarrollo Web' },
    { value: 'Backend & Cloud', label: 'Backend & Cloud' }
  ];

  protected readonly myCourses = computed(() => {
    const user = this.authService.currentUser();
    const all = this.courseService.coursesCatalog();
    if (!user) return [];
    if (user.role === 'ADMIN') return all;
    return all.filter(c => c.instructorId === user.id);
  });

  protected readonly filteredCourses = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.categoryFilter();
    const courses = this.myCourses();

    return courses.filter(c => {
      const matchesCat = cat === 'ALL' || c.category === cat;
      const matchesQuery = !query || 
        c.title.toLowerCase().includes(query) || 
        c.category.toLowerCase().includes(query) || 
        c.level.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
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

  viewCourseStudents(courseId: string): void {
    this.router.navigate(['/instructor/courses', courseId, 'students']);
  }

  editCourse(courseId: string): void {
    this.router.navigate(['/instructor/courses', courseId, 'edit']);
  }

  openDeleteModal(course: Course): void {
    this.selectedCourse.set(course);
    this.isDeletingCourse.set(false);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    if (this.isDeletingCourse()) return;
    this.isDeleteModalOpen.set(false);
    this.selectedCourse.set(null);
  }

  async confirmDeleteCourse(): Promise<void> {
    const course = this.selectedCourse();
    if (!course || this.isDeletingCourse()) return;

    this.isDeletingCourse.set(true);
    try {
      await this.courseService.deleteCourse(course.id);
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (err) {
      console.error('Error eliminando curso:', err);
    } finally {
      this.isDeletingCourse.set(false);
      this.isDeleteModalOpen.set(false);
      this.selectedCourse.set(null);
    }
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.categoryFilter.set('ALL');
  }
}
