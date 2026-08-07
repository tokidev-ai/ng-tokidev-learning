import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-courses',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-[#A406E9]/20 text-[#A406E9] text-xs font-extrabold uppercase rounded-full border border-[#A406E9]/30">
              Admin / Cursos
            </span>
          </div>
          <h1 class="text-3xl font-black text-white">Administración de Catálogo</h1>
          <p class="text-xs text-slate-400">Verifica la rentabilidad de las rutas de aprendizaje, docentes a cargo y gestiona las matrículas de estudiantes.</p>
        </div>

        <!-- Quick Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] font-extrabold uppercase text-slate-400">Cursos Registrados</span>
            <div class="text-2xl font-black text-white">{{ courseService.coursesCatalog().length }}</div>
          </div>

          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] font-extrabold uppercase text-slate-400">Matrículas Totales</span>
            <div class="text-2xl font-black text-[#DA2984]">{{ totalEnrollments() }}</div>
          </div>

          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] font-extrabold uppercase text-slate-400">Volumen Facturado Bruto</span>
            <div class="text-2xl font-black text-emerald-400">{{ totalPlatformRevenue() }}</div>
          </div>
        </div>

        <!-- Courses Management Card -->
        <div class="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
          <h3 class="text-sm font-extrabold uppercase text-slate-400 tracking-wider">Listado General de Rutas de Estudio</h3>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-slate-400 font-extrabold uppercase">
                  <th class="py-3.5 px-4">Curso / Ruta</th>
                  <th class="py-3.5 px-4">Categoría</th>
                  <th class="py-3.5 px-4">Calificación</th>
                  <th class="py-3.5 px-4">Alumnos</th>
                  <th class="py-3.5 px-4">Costo</th>
                  <th class="py-3.5 px-4 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody>
                @for (course of courseService.coursesCatalog(); track course.id) {
                  <!-- Row toggle click -->
                  <tr 
                    (click)="toggleCourseExpand(course.id)"
                    [class.bg-[#A406E9]/5]="expandedCourseId() === course.id"
                    class="border-b border-white/5 hover:bg-slate-900/40 transition-colors cursor-pointer">
                    <td class="py-4 px-4 font-bold text-white">{{ course.title }}</td>
                    <td class="py-4 px-4 text-slate-300">{{ course.category }}</td>
                    <td class="py-4 px-4 font-mono font-bold text-[#FA743F]">
                      <i class="fa-solid fa-star text-yellow-400 mr-1"></i>{{ course.rating }}
                    </td>
                    <td class="py-4 px-4 text-slate-400 font-mono font-semibold">{{ course.studentsCount }}</td>
                    <td class="py-4 px-4 text-emerald-400 font-mono font-bold">\${{ course.price }} USD</td>
                    <td class="py-4 px-4 text-right">
                      <button 
                        type="button"
                        class="text-slate-400 hover:text-white transition-colors">
                        <i [class]="'fa-solid ' + (expandedCourseId() === course.id ? 'fa-chevron-up' : 'fa-chevron-down')"></i>
                      </button>
                    </td>
                  </tr>

                  <!-- Expandable details block -->
                  @if (expandedCourseId() === course.id) {
                    <tr class="bg-slate-950/40 border-b border-white/10">
                      <td colspan="6" class="p-6 space-y-6">
                        
                        <!-- Course Info Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          <!-- Column 1: Description -->
                          <div class="space-y-2 md:col-span-2">
                            <span class="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Sinopsis del Curso</span>
                            <p class="text-xs text-slate-300 leading-relaxed">{{ course.description }}</p>
                            
                            <!-- Instructor Section -->
                            <div class="pt-3 flex items-center gap-3">
                              <img [src]="course.instructorAvatar" [alt]="course.instructorName" class="w-9 h-9 rounded-full object-cover border border-white/10" />
                              <div>
                                <span class="text-[10px] text-slate-500 font-extrabold uppercase block leading-none">Profesor Asignado</span>
                                <span class="font-bold text-xs text-white block">{{ course.instructorName }}</span>
                                <span class="text-[9px] text-slate-400 font-medium leading-none">{{ course.instructorTitle }}</span>
                              </div>
                            </div>
                          </div>

                          <!-- Column 2: Financial Performance -->
                          <div class="glass-card p-4 rounded-2xl border border-white/5 space-y-3.5">
                            <span class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Rendimiento Financiero</span>
                            
                            <div class="space-y-1.5 text-[11px]">
                              <div class="flex justify-between text-slate-400">
                                <span>Facturación Bruta:</span>
                                <span class="font-mono text-white font-bold">\${{ getBruto(course) }} USD</span>
                              </div>
                              <div class="flex justify-between text-slate-400">
                                <span>Regalías del Autor (70%):</span>
                                <span class="font-mono text-[#FA743F] font-bold">\${{ getRoyalties(course) }} USD</span>
                              </div>
                              <div class="flex justify-between text-emerald-400/90 font-bold border-t border-white/5 pt-1.5">
                                <span>Ingreso Neto Academia (30%):</span>
                                <span class="font-mono text-emerald-400">\${{ getNetto(course) }} USD</span>
                              </div>
                            </div>

                            <!-- View Students Trigger Button -->
                            <button 
                              type="button"
                              (click)="$event.stopPropagation(); viewCourseStudents(course.id)"
                              class="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold tracking-wider uppercase text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#DA2984]/10">
                              <i class="fa-solid fa-users"></i>
                              Ver Alumnos Inscritos
                            </button>
                          </div>

                        </div>

                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  `
})
export class AdminCoursesComponent {
  protected readonly courseService = inject(CourseService);
  private readonly router = inject(Router);

  protected readonly expandedCourseId = signal<string | null>(null);

  protected readonly totalEnrollments = () => {
    return this.courseService.coursesCatalog().reduce((sum, c) => sum + c.studentsCount, 0).toLocaleString();
  };

  protected readonly totalPlatformRevenue = () => {
    const sum = this.courseService.coursesCatalog().reduce((sum, c) => sum + (c.studentsCount * c.price), 0);
    return '$' + Math.round(sum).toLocaleString() + ' USD';
  };

  getBruto(course: Course): string {
    return (course.studentsCount * course.price).toFixed(2);
  }

  getRoyalties(course: Course): string {
    return (course.studentsCount * course.price * 0.70).toFixed(2);
  }

  getNetto(course: Course): string {
    return (course.studentsCount * course.price * 0.30).toFixed(2);
  }

  toggleCourseExpand(courseId: string): void {
    this.expandedCourseId.update(curr => curr === courseId ? null : courseId);
  }

  viewCourseStudents(courseId: string): void {
    this.router.navigate(['/admin/courses', courseId, 'students']);
  }
}
