import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-6">
      <div class="max-w-4xl mx-auto space-y-8">
        
        <!-- Welcome & Subtitle Header -->
        <div class="space-y-1">
          <h1 class="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Bienvenido, {{ authService.currentUser().name }}
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-md shadow-emerald-400/50"></span>
          </h1>
          <p class="text-xs text-slate-400 font-medium">
            Continúa tu aprendizaje en tu ruta activa.
          </p>
        </div>

        <!-- Overall Progress Summary Cards -->
        <div class="grid grid-cols-3 gap-3 md:gap-6 bg-slate-900/80 p-4 md:p-6 rounded-3xl border border-white/10 shadow-xl backdrop-blur-md">
          <div class="text-center space-y-1">
            <span class="text-2xl md:text-4xl font-black text-white tracking-tight">
              {{ authService.currentUser().completedLessonsCount }}
            </span>
            <span class="block text-[10px] md:text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              COMPLETADAS
            </span>
          </div>

          <div class="text-center space-y-1 border-x border-white/10 px-2">
            <span class="text-2xl md:text-4xl font-black text-white tracking-tight">
              {{ authService.currentUser().inProgressCount }}
            </span>
            <span class="block text-[10px] md:text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              EN CURSO
            </span>
          </div>

          <div class="text-center space-y-1">
            <span class="text-2xl md:text-4xl font-black text-brand-gradient tracking-tight">
              {{ authService.currentUser().averageProgressScore }}%
            </span>
            <span class="block text-[10px] md:text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              PROMEDIO
            </span>
          </div>
        </div>

        <!-- Active Course / Learning Path Card (Clean Header) -->
        <div class="bg-slate-900/90 border border-white/10 p-5 rounded-3xl space-y-4 shadow-xl">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <span class="text-[10px] font-mono uppercase font-bold text-[#FA743F]">CURSO ACTIVO</span>
              <h2 class="text-xl font-extrabold text-white">
                {{ courseService.activePath().title }}
              </h2>
              <p class="text-xs text-slate-400">
                {{ courseService.activePath().subtitle }}
              </p>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <div class="text-right">
                <span class="text-xs font-bold text-white block">{{ courseService.activePath().progressPercentage }}% Avanzado</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ courseService.activePath().totalModules }} lecciones</span>
              </div>
              <button 
                type="button"
                (click)="togglePathDropdown()"
                class="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer">
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </button>
            </div>
          </div>

          <!-- Progress Meter -->
          <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
            <div class="bg-brand-gradient h-full rounded-full" [style.width.%]="courseService.activePath().progressPercentage"></div>
          </div>

          <!-- Dropdown Options if user has multiple courses -->
          @if (isPathDropdownOpen()) {
            <div class="bg-slate-950 border border-white/10 rounded-2xl p-2 space-y-1 pt-3">
              @for (path of courseService.learningPaths(); track path.id) {
                <button 
                  type="button"
                  (click)="selectPath(path.id)"
                  class="w-full px-4 py-2.5 text-left rounded-xl hover:bg-slate-900 flex items-center justify-between transition-colors">
                  <div>
                    <span class="font-bold text-xs text-white block">{{ path.title }}</span>
                    <span class="text-[11px] text-slate-400">{{ path.subtitle }}</span>
                  </div>
                  <span class="text-xs font-bold text-[#A406E9]">{{ path.progressPercentage }}%</span>
                </button>
              }
            </div>
          }
        </div>

        <!-- Clean Day Navigation Bar (No confusing Módulos/Sesiones buttons) -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              SELECCIONA EL DÍA DE ESTUDIO
            </span>
          </div>

          <!-- Day Selection Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            @for (day of courseService.activePath().days; track day.id) {
              <button 
                type="button"
                (click)="courseService.selectDay(day.dayNumber)"
                [class.bg-[#A406E9]]="courseService.selectedDayNumber() === day.dayNumber"
                [class.text-white]="courseService.selectedDayNumber() === day.dayNumber"
                [class.font-bold]="courseService.selectedDayNumber() === day.dayNumber"
                [class.bg-slate-900/80]="courseService.selectedDayNumber() !== day.dayNumber"
                [class.text-slate-400]="courseService.selectedDayNumber() !== day.dayNumber"
                class="px-4 py-2.5 rounded-2xl border border-white/10 text-xs tracking-wide transition-all flex items-center gap-2 shrink-0 cursor-pointer">
                
                @if (day.completedLessons === day.totalLessons && day.totalLessons > 0) {
                  <i class="fa-solid fa-check text-emerald-400 text-xs"></i>
                } @else if (day.isLocked) {
                  <i class="fa-solid fa-lock text-slate-500 text-xs"></i>
                } @else {
                  <i class="fa-regular fa-circle text-xs"></i>
                }

                DÍA {{ day.dayNumber }}
              </button>
            }
          </div>

          <!-- Active Day Details & Lesson List -->
          @if (courseService.selectedDay(); as currentDay) {
            <div class="space-y-4 pt-2">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">
                  {{ currentDay.title }}
                </h3>
                <span class="text-xs text-slate-400 font-mono">
                  {{ currentDay.completedLessons }}/{{ currentDay.totalLessons }} completadas
                </span>
              </div>

              <!-- Lessons List -->
              <div class="space-y-3">
                @for (lesson of currentDay.lessons; track lesson.id) {
                  <div 
                    (click)="openLesson(lesson)"
                    [class.opacity-60]="lesson.isLocked"
                    class="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-[#A406E9]/40 transition-all cursor-pointer group">
                    
                    <div class="flex items-center gap-4">
                      <!-- Status Icon -->
                      <button 
                        type="button"
                        (click)="$event.stopPropagation(); toggleLesson(lesson.id)"
                        class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center transition-colors">
                        @if (lesson.isCompleted) {
                          <i class="fa-solid fa-check text-emerald-400 text-sm"></i>
                        } @else if (lesson.isLocked) {
                          <i class="fa-solid fa-lock text-slate-500 text-xs"></i>
                        } @else {
                          <i class="fa-solid fa-play text-slate-400 group-hover:text-[#A406E9] text-xs transition-colors ml-0.5"></i>
                        }
                      </button>

                      <!-- Lesson Details -->
                      <div class="space-y-0.5">
                        <h4 class="font-bold text-sm text-slate-100 group-hover:text-[#A406E9] transition-colors">
                          {{ lesson.title }}
                        </h4>
                        <div class="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span class="text-slate-300">{{ lesson.moduleCode }}</span>
                          <span>•</span>
                          <span>{{ lesson.type }}</span>
                          @if (lesson.durationMinutes) {
                            <span>•</span>
                            <span class="text-[#FA743F] font-bold">{{ lesson.durationMinutes }} min</span>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Action Arrow -->
                    <div class="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-[#A406E9] transition-all">
                      <i class="fa-solid fa-arrow-right text-xs"></i>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class StudentDashboardComponent {
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isPathDropdownOpen = signal(false);

  togglePathDropdown(): void {
    this.isPathDropdownOpen.update(v => !v);
  }

  selectPath(pathId: string): void {
    this.courseService.selectPath(pathId);
    this.isPathDropdownOpen.set(false);
  }

  toggleLesson(lessonId: string): void {
    this.courseService.toggleLessonCompletion(lessonId);
  }

  openLesson(lesson: any): void {
    if (lesson.isLocked) return;
    this.courseService.selectLesson(lesson.id);
    this.router.navigate(['/classroom']);
  }
}
