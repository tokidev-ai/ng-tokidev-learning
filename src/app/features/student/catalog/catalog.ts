import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { 
  LucideSearch, 
  LucideStar, 
  LucidePlay, 
  LucideCheckCircle2, 
  LucideSlidersHorizontal,
  LucideCompass
} from '@lucide/angular';

@Component({
  selector: 'app-catalog',
  imports: [
    RouterLink, 
    ReactiveFormsModule,
    LucideSearch,
    LucideStar,
    LucidePlay,
    LucideCheckCircle2,
    LucideSlidersHorizontal,
    LucideCompass
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog.html'
})
export class CatalogComponent {
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);

  protected readonly searchControl = new FormControl('');
  protected readonly selectedCategory = signal<string>('Todos');
  protected readonly hideEnrolled = signal<boolean>(false);

  protected readonly categories = signal<string[]>([
    'Todos',
    'Inteligencia Artificial',
    'Desarrollo Web',
    'Backend & Cloud',
    'Mobile',
    'DevOps'
  ]);

  isUserEnrolled(courseId: string): boolean {
    return this.courseService.isEnrolledInCourse(courseId);
  }

  protected readonly filteredCourses = computed(() => {
    const category = this.selectedCategory();
    const query = (this.searchControl.value || '').toLowerCase().trim();
    const shouldHideEnrolled = this.hideEnrolled();
    const courses = this.courseService.coursesCatalog();

    return courses.filter(c => {
      const matchesCategory = category === 'Todos' || c.category === category;
      const matchesQuery = !query || c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query);
      
      if (shouldHideEnrolled && this.isUserEnrolled(c.id)) {
        return false;
      }

      return matchesCategory && matchesQuery;
    });
  });
}
