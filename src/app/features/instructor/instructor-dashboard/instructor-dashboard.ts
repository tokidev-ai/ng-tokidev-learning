import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-instructor-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Header & Role Indicator -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-[#DA2984]/20 text-[#DA2984] text-xs font-extrabold uppercase rounded-full border border-[#DA2984]/30">
                Rol: Profesor / Instructor
              </span>
              <span class="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <i class="fa-solid fa-[#FA743F] fa-circle text-[8px] animate-pulse"></i> Cuenta Verificada
              </span>
            </div>
            <h1 class="text-3xl md:text-4xl font-black text-white">Panel de Creador & Instructor</h1>
            <p class="text-xs text-slate-400">Gestiona tus publicaciones, sube nuevos módulos de video y revisa tus analíticas de audiencia.</p>
          </div>

          <button 
            type="button"
            (click)="isCreateModalOpen.set(true)"
            class="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-white font-extrabold text-xs tracking-wider uppercase hover:opacity-95 transition-all shadow-xl shadow-[#DA2984]/30 flex items-center justify-center gap-2 cursor-pointer">
            <i class="fa-solid fa-plus text-sm"></i>
            Crear Nuevo Curso
          </button>
        </div>

        <!-- Instructor Stats Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-5 rounded-2xl space-y-2">
            <span class="text-xs font-extrabold uppercase text-slate-400">Cursos Publicados</span>
            <div class="text-3xl font-black text-white">2</div>
            <span class="text-[11px] text-emerald-400 font-semibold">+1 este mes</span>
          </div>

          <div class="glass-card p-5 rounded-2xl space-y-2">
            <span class="text-xs font-extrabold uppercase text-slate-400">Estudiantes Totales</span>
            <div class="text-3xl font-black text-[#A406E9]">9,300</div>
            <span class="text-[11px] text-emerald-400 font-semibold">+450 esta semana</span>
          </div>

          <div class="glass-card p-5 rounded-2xl space-y-2">
            <span class="text-xs font-extrabold uppercase text-slate-400">Calificación Promedio</span>
            <div class="text-3xl font-black text-[#FA743F] flex items-center gap-1">
              4.95 <i class="fa-solid fa-star text-yellow-400 text-lg"></i>
            </div>
            <span class="text-[11px] text-slate-400">Basado en 2,310 reseñas</span>
          </div>

          <div class="glass-card p-5 rounded-2xl space-y-2">
            <span class="text-xs font-extrabold uppercase text-slate-400">Ingresos Estimados</span>
            <div class="text-3xl font-black text-emerald-400">$14,250</div>
            <span class="text-[11px] text-emerald-400 font-semibold">USD / Mes actual</span>
          </div>
        </div>

        <!-- Managed Courses List -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-white">Tus Cursos Creados</h2>
          
          <div class="space-y-3">
            @for (course of courseService.coursesCatalog(); track course.id) {
              <div class="glass-card p-4 md:p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 hover:border-[#DA2984]/40 transition-all">
                <div class="flex items-center gap-4 w-full md:w-auto">
                  <img [src]="course.thumbnail" [alt]="course.title" class="w-20 h-14 rounded-xl object-cover" />
                  <div>
                    <h3 class="font-bold text-base text-white">{{ course.title }}</h3>
                    <span class="text-xs text-slate-400 font-mono">{{ course.studentsCount }} estudiantes inscritos • {{ course.category }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button type="button" class="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/30 text-xs font-bold text-slate-300">
                    <i class="fa-solid fa-cloud-arrow-up mr-1"></i> Subir Video
                  </button>
                  <button type="button" class="px-4 py-2 rounded-xl bg-[#DA2984]/20 border border-[#DA2984]/40 text-xs font-bold text-[#DA2984]">
                    <i class="fa-solid fa-[#FA743F] fa-gear mr-1"></i> Configurar
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Video Upload & Course Creation Modal Preview -->
        @if (isCreateModalOpen()) {
          <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div class="glass-card max-w-lg w-full p-6 rounded-3xl space-y-6 border border-white/20 shadow-2xl">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-extrabold text-white flex items-center gap-2">
                  <i class="fa-solid fa-[#FA743F] fa-video text-[#DA2984]"></i> Nuevo Curso / Módulo de Video
                </h3>
                <button (click)="isCreateModalOpen.set(false)" class="text-slate-400 hover:text-white">
                  <i class="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <!-- Upload Area Mockup -->
              <div class="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center space-y-3 bg-slate-900/50 hover:border-[#DA2984] transition-colors cursor-pointer">
                <div class="w-12 h-12 rounded-full bg-[#DA2984]/20 text-[#DA2984] flex items-center justify-center mx-auto text-xl">
                  <i class="fa-solid fa-[#FA743F] fa-cloud-arrow-up"></i>
                </div>
                <div>
                  <span class="font-bold text-sm text-white block">Arrastra tus archivos de MP4/M4V aquí</span>
                  <span class="text-xs text-slate-400">Hasta 4K de resolución y 2GB por video</span>
                </div>
              </div>

              <div class="space-y-3">
                <label class="text-xs font-bold uppercase text-slate-400">Título del Curso</label>
                <input type="text" placeholder="Ej. NestJS Microservicios Avanzados" class="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-xs text-white" />
              </div>

              <div class="flex justify-end gap-2">
                <button (click)="isCreateModalOpen.set(false)" class="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-slate-300">
                  Cancelar
                </button>
                <button (click)="isCreateModalOpen.set(false)" class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold text-white">
                  Guardar Borrador
                </button>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class InstructorDashboardComponent {
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);
  protected readonly isCreateModalOpen = signal(false);
}
