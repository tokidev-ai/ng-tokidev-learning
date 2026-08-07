import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Page Title & Search Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-1">
            <h1 class="text-3xl md:text-4xl font-extrabold text-white">Explora los Cursos</h1>
            <p class="text-xs text-slate-400">Descubre rutas de aprendizaje estructuradas para potenciar tu carrera técnica.</p>
          </div>

          <!-- Search Input -->
          <div class="relative w-full md:w-80">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              [formControl]="searchControl"
              type="text" 
              placeholder="Buscar curso, tecnología..."
              class="w-full bg-slate-900 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#A406E9] transition-all" />
          </div>
        </div>

        <!-- Filter Category Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          @for (cat of categories(); track cat) {
            <button 
              type="button"
              (click)="selectedCategory.set(cat)"
              [class.bg-[#A406E9]]="selectedCategory() === cat"
              [class.text-white]="selectedCategory() === cat"
              class="px-4 py-2 rounded-xl bg-slate-900 border border-white/5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shrink-0">
              {{ cat }}
            </button>
          }
        </div>

        <!-- Course Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (course of filteredCourses(); track course.id) {
            <div class="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group">
              <div>
                <div class="relative h-44 overflow-hidden">
                  <img [src]="course.thumbnail" [alt]="course.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 rounded-full text-[11px] font-bold text-white border border-white/10">
                    {{ course.category }}
                  </span>
                  <span class="absolute bottom-3 right-3 px-2 py-0.5 bg-[#FA743F] text-white font-extrabold text-xs rounded flex items-center gap-1">
                    <i class="fa-solid fa-star text-yellow-200"></i> {{ course.rating }}
                  </span>
                </div>

                <div class="p-5 space-y-3">
                  <h3 class="font-extrabold text-base text-white group-hover:text-[#A406E9] transition-colors leading-snug">
                    {{ course.title }}
                  </h3>
                  <p class="text-xs text-slate-400 line-clamp-2">
                    {{ course.description }}
                  </p>

                  <div class="flex items-center gap-3 pt-2">
                    <img [src]="course.instructorAvatar" [alt]="course.instructorName" class="w-7 h-7 rounded-full object-cover border border-[#A406E9]" />
                    <div class="text-xs font-semibold text-slate-300">
                      {{ course.instructorName }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <span class="text-xs text-slate-400 font-mono">{{ course.durationHours }} hrs • {{ course.level }}</span>
                <a [routerLink]="['/catalog', course.id]" class="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-[#A406E9] text-xs font-bold text-white transition-all text-center">
                  Ver Detalles
                </a>
              </div>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class CatalogComponent {
  protected readonly courseService = inject(CourseService);

  protected readonly searchControl = new FormControl('');
  protected readonly selectedCategory = signal<string>('Todos');

  protected readonly categories = signal<string[]>([
    'Todos',
    'Inteligencia Artificial',
    'Desarrollo Web',
    'Backend & Cloud'
  ]);

  protected readonly filteredCourses = computed(() => {
    const category = this.selectedCategory();
    const query = (this.searchControl.value || '').toLowerCase().trim();
    const courses = this.courseService.coursesCatalog();

    return courses.filter(c => {
      const matchesCategory = category === 'Todos' || c.category === category;
      const matchesQuery = !query || c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  });
}
