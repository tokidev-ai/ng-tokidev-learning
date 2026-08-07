import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-instructor-dashboard',
  imports: [RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-5xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div class="space-y-1">
            <span class="px-3 py-1 bg-[#DA2984]/20 text-[#DA2984] text-xs font-extrabold uppercase rounded-full border border-[#DA2984]/30">
              Panel del Docente
            </span>
            <h1 class="text-3xl font-black text-white">Mis Cursos Creados</h1>
            <p class="text-xs text-slate-400">Controla el rendimiento financiero de tus cursos y conoce a tus estudiantes.</p>
          </div>
          
          <a routerLink="/instructor/create-course" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-white font-extrabold text-xs tracking-wider uppercase hover:opacity-95 transition-all shadow-xl shadow-[#DA2984]/30 flex items-center justify-center gap-2 cursor-pointer">
            <i class="fa-solid fa-plus text-sm"></i>
            Crear Nuevo Curso
          </a>
        </div>

        <!-- Instructor Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden">
            <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-[#DA2984]/10 rounded-full blur-xl"></div>
            <span class="text-xs font-extrabold uppercase text-slate-400">Total Ganado</span>
            <div class="text-3xl font-black text-emerald-400 pt-1">{{ totalEarnings() }}</div>
            <span class="text-[10px] text-slate-500 block">70% de regalías del autor</span>
          </div>

          <div class="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden">
            <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-[#A406E9]/10 rounded-full blur-xl"></div>
            <span class="text-xs font-extrabold uppercase text-slate-400">Estudiantes Registrados</span>
            <div class="text-3xl font-black text-white pt-1">{{ totalStudents() }}</div>
            <span class="text-[10px] text-slate-500 block">Inscripciones directas</span>
          </div>

          <div class="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden">
            <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-[#FA743F]/10 rounded-full blur-xl"></div>
            <span class="text-xs font-extrabold uppercase text-slate-400">Cursos Publicados</span>
            <div class="text-3xl font-black text-[#FA743F] pt-1">{{ courseService.coursesCatalog().length }}</div>
            <span class="text-[10px] text-slate-500 block">Catálogo activo</span>
          </div>
        </div>

        <!-- Courses Catalog Grid -->
        <div class="space-y-4">
          <h2 class="text-lg font-bold text-white uppercase tracking-wider">Temarios & Estudiantes</h2>

          <div class="grid grid-cols-1 gap-6">
            @for (course of courseService.coursesCatalog(); track course.id) {
              <div class="glass-card rounded-3xl p-5 md:p-6 border border-white/10 space-y-4 hover:border-[#DA2984]/20 transition-colors">
                
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <img [src]="course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80'" 
                         [alt]="course.title" 
                         class="w-16 h-12 rounded-xl object-cover border border-white/10" />
                    <div>
                      <h3 class="font-extrabold text-base text-white hover:text-[#DA2984] transition-colors">{{ course.title }}</h3>
                      <span class="text-[11px] text-slate-400 font-mono">
                        Categoría: {{ course.category }} • Nivel: {{ course.level }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-4 justify-between sm:justify-end">
                    <div class="text-right">
                      <span class="text-[10px] text-slate-500 font-bold block uppercase">Costo del Curso</span>
                      <span class="text-xs font-extrabold text-white font-mono">\${{ course.price }} USD</span>
                    </div>
                    
                    <button 
                      type="button" 
                      (click)="viewCourseStudents(course.id)"
                      class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#DA2984]/20 border border-white/10 hover:border-[#DA2984]/40 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer">
                      <i class="fa-solid fa-users mr-1"></i> Ver Alumnos ({{ course.studentsCount }})
                    </button>
                  </div>
                </div>

              </div>
            } @empty {
              <div class="glass-card p-12 text-center rounded-3xl space-y-4">
                <div class="w-16 h-16 rounded-full bg-[#DA2984]/10 text-[#DA2984] flex items-center justify-center mx-auto text-2xl">
                  <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <div class="space-y-1">
                  <h3 class="font-bold text-white text-lg">No tienes cursos publicados</h3>
                  <p class="text-xs text-slate-400">Publica tu primer curso mediante nuestro asistente por pasos para comenzar a impartir clases.</p>
                </div>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `
})
export class InstructorDashboardComponent {
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);
  private readonly router = inject(Router);

  // Helper stats methods
  protected readonly totalStudents = () => {
    return this.courseService.coursesCatalog().reduce((sum, c) => sum + c.studentsCount, 0).toLocaleString();
  };

  protected readonly totalEarnings = () => {
    const total = this.courseService.coursesCatalog().reduce((sum, c) => sum + (c.studentsCount * c.price * 0.7), 0);
    return '$' + Math.round(total).toLocaleString();
  };

  viewCourseStudents(courseId: string): void {
    this.router.navigate(['/instructor/courses', courseId, 'students']);
  }
}
