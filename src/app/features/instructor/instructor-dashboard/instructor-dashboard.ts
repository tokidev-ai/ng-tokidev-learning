import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { 
  LucideUsers, 
  LucideDollarSign, 
  LucideStar, 
  LucidePlus, 
  LucideSearch, 
  LucideTrendingUp, 
  LucidePencil, 
  LucideMoreVertical 
} from '@lucide/angular';

@Component({
  selector: 'app-instructor-dashboard',
  imports: [
    RouterLink, 
    LucideUsers, 
    LucideDollarSign, 
    LucideStar, 
    LucidePlus, 
    LucideSearch, 
    LucideTrendingUp, 
    LucidePencil, 
    LucideMoreVertical
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 pb-12">
      
      <!-- Fila de Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Panel del Profesor
          </h1>
          <p class="text-xs text-slate-400 font-medium">
            Monitorea tu impacto y gestiona el temario de tus cursos.
          </p>
        </div>
        
        <a 
          routerLink="/instructor/create-course" 
          class="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A406E9] to-[#DA2984] text-white font-extrabold text-xs tracking-wide hover:opacity-95 transition-all shadow-lg shadow-[#A406E9]/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer">
          <svg lucidePlus class="w-4 h-4"></svg>
          <span>Crear Nuevo Curso</span>
        </a>
      </div>

      <!-- 3 Tarjetas de Métricas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Card 1: Total de Estudiantes -->
        <div class="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div class="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <svg lucideUsers class="w-4 h-4 text-slate-400"></svg>
            <span>Total de Estudiantes</span>
          </div>
          <div class="text-3xl font-extrabold text-white tracking-tight">
            {{ totalStudents() }}
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono font-bold">
            <svg lucideTrendingUp class="w-3.5 h-3.5"></svg>
            <span>↑14% vs el mes anterior</span>
          </div>
        </div>

        <!-- Card 2: Ganancias -->
        <div class="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div class="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <svg lucideDollarSign class="w-4 h-4 text-slate-400"></svg>
            <span>Ganancias Estimadas</span>
          </div>
          <div class="text-3xl font-extrabold text-white tracking-tight">
            {{ totalEarnings() }}
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono font-bold">
            <svg lucideTrendingUp class="w-3.5 h-3.5"></svg>
            <span>↑8% vs el mes anterior</span>
          </div>
        </div>

        <!-- Card 3: Valoración Promedio -->
        <div class="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div class="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <svg lucideStar class="w-4 h-4 text-amber-400 fill-amber-400"></svg>
            <span>Valoración Promedio</span>
          </div>
          <div class="text-3xl font-extrabold text-white tracking-tight">
            4.8 <span class="text-xs text-slate-500 font-normal">/ 5.0</span>
          </div>
          <div class="text-[11px] text-slate-400 font-mono">
            Basado en 2,104 valoraciones
          </div>
        </div>

      </div>

      <!-- Sección de Cursos Activos -->
      <div class="space-y-4 pt-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 class="text-xl font-extrabold text-white">Cursos Activos</h2>
          
          <!-- Buscador -->
          <div class="flex items-center gap-2 bg-[#161435] px-4 py-2 rounded-xl border border-white/10 w-full sm:w-72">
            <svg lucideSearch class="w-4 h-4 text-slate-400 shrink-0"></svg>
            <input 
              type="text" 
              placeholder="Buscar mis cursos..." 
              class="bg-transparent text-xs text-white placeholder-slate-400 outline-none w-full font-medium" />
          </div>
        </div>

        <!-- Tabla de Cursos -->
        <div class="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/80 text-slate-400 uppercase font-mono tracking-wider border-b border-white/10">
                <tr>
                  <th class="py-4 px-6 font-bold">Título del Curso</th>
                  <th class="py-4 px-6 font-bold">Estado</th>
                  <th class="py-4 px-6 font-bold">Estudiantes</th>
                  <th class="py-4 px-6 font-bold">Valoración</th>
                  <th class="py-4 px-6 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 font-medium">
                @for (course of courseService.coursesCatalog(); track course.id) {
                  <tr class="hover:bg-white/5 transition-colors">
                    
                    <td class="py-4 px-6">
                      <div class="flex items-center gap-3">
                        <img 
                          [src]="course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80'" 
                          [alt]="course.title"
                          class="w-12 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                        <div>
                          <span class="font-bold text-white text-sm block hover:text-[#A406E9] transition-colors cursor-pointer">
                            {{ course.title }}
                          </span>
                          <span class="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Última actualización: hace 2 días
                          </span>
                        </div>
                      </div>
                    </td>

                    <td class="py-4 px-6">
                      <span class="px-3 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Publicado
                      </span>
                    </td>

                    <td class="py-4 px-6 text-slate-200 font-mono">
                      {{ course.studentsCount.toLocaleString() }}
                    </td>

                    <td class="py-4 px-6">
                      <div class="flex items-center gap-1 font-bold text-white font-mono">
                        <svg lucideStar class="w-3.5 h-3.5 text-amber-400 fill-amber-400"></svg>
                        <span>4.9</span>
                      </div>
                    </td>

                    <td class="py-4 px-6 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button 
                          type="button" 
                          (click)="viewCourseStudents(course.id)"
                          title="Estadísticas"
                          class="p-2 rounded-lg bg-slate-900 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                          <svg lucideTrendingUp class="w-4 h-4"></svg>
                        </button>
                        <button 
                          type="button" 
                          title="Editar"
                          class="p-2 rounded-lg bg-slate-900 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                          <svg lucidePencil class="w-4 h-4"></svg>
                        </button>
                        <button 
                          type="button" 
                          title="Más opciones"
                          class="p-2 rounded-lg bg-slate-900 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                          <svg lucideMoreVertical class="w-4 h-4"></svg>
                        </button>
                      </div>
                    </td>

                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="py-8 text-center text-slate-400">
                      No hay cursos disponibles.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
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

  protected readonly totalStudents = () => {
    return (this.courseService.coursesCatalog().reduce((sum, c) => sum + c.studentsCount, 0) || 12480).toLocaleString();
  };

  protected readonly totalEarnings = () => {
    const total = this.courseService.coursesCatalog().reduce((sum, c) => sum + (c.studentsCount * c.price * 0.7), 0);
    return '$' + (total > 0 ? Math.round(total).toLocaleString() : '4,250.00');
  };

  viewCourseStudents(courseId: string): void {
    this.router.navigate(['/instructor/courses', courseId, 'students']);
  }
}
