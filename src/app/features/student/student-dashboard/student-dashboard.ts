import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { 
  LucideBookOpen, 
  LucideFlame, 
  LucideTrophy, 
  LucidePlay, 
  LucideCheck, 
  LucideLock, 
  LucideArrowLeft, 
  LucideChevronRight
} from '@lucide/angular';

@Component({
  selector: 'app-student-dashboard',
  imports: [
    LucideBookOpen, 
    LucideFlame, 
    LucideTrophy, 
    LucidePlay, 
    LucideCheck, 
    LucideLock, 
    LucideArrowLeft, 
    LucideChevronRight
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 pb-12">
      @if (authService.currentUser(); as user) {
        
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Panel del Estudiante
            </h1>
            <p class="text-xs text-slate-400 font-medium">
              Sigue tu progreso y continúa aprendiendo tus rutas seleccionadas.
            </p>
          </div>
        </div>

        <!-- 3 Tarjetas de Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Card 1: Cursos en Progreso -->
          <div class="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-4">
            <div class="flex items-center justify-between">
              <div class="w-10 h-10 rounded-xl bg-[#A406E9]/20 border border-[#A406E9]/30 flex items-center justify-center text-[#A406E9]">
                <svg lucideBookOpen class="w-5 h-5"></svg>
              </div>
              <span class="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-slate-300">
                Activos
              </span>
            </div>
            <div>
              <div class="text-3xl font-extrabold text-white tracking-tight">
                {{ user.inProgressCount || 4 }}
              </div>
              <span class="text-xs text-slate-400 font-medium block mt-1">
                Cursos en Progreso
              </span>
            </div>
          </div>

          <!-- Card 2: Racha de Estudio -->
          <div class="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-4">
            <div class="flex items-center justify-between">
              <div class="w-10 h-10 rounded-xl bg-[#FA743F]/20 border border-[#FA743F]/30 flex items-center justify-center text-[#FA743F]">
                <svg lucideFlame class="w-5 h-5"></svg>
              </div>
              <span class="px-2.5 py-0.5 rounded-md bg-[#FA743F]/10 border border-[#FA743F]/30 text-[10px] font-mono font-bold text-[#FA743F]">
                Diario
              </span>
            </div>
            <div>
              <div class="text-3xl font-extrabold text-white tracking-tight">
                {{ user.streakDays || 12 }} Días
              </div>
              <span class="text-xs text-slate-400 font-medium block mt-1">
                Racha de Estudio
              </span>
            </div>
          </div>

          <!-- Card 3: Certificados -->
          <div class="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-4">
            <div class="flex items-center justify-between">
              <div class="w-10 h-10 rounded-xl bg-[#DA2984]/20 border border-[#DA2984]/30 flex items-center justify-center text-[#DA2984]">
                <svg lucideTrophy class="w-5 h-5"></svg>
              </div>
              <span class="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-slate-300">
                Completados
              </span>
            </div>
            <div>
              <div class="text-3xl font-extrabold text-white tracking-tight">
                {{ user.completedLessonsCount || 2 }}
              </div>
              <span class="text-xs text-slate-400 font-medium block mt-1">
                Certificados Obtenidos
              </span>
            </div>
          </div>

        </div>

        <!-- Sección: Continuar Aprendiendo -->
        @if (selectedPathId() === null) {
          
          <div class="space-y-6 pt-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-extrabold text-white">Continuar Aprendiendo</h2>
              
              <!-- Pestañas de Filtro -->
              <div class="flex items-center gap-1 bg-[#161435] p-1 rounded-xl border border-white/10">
                <button 
                  type="button"
                  (click)="activeFilter.set('ALL')"
                  [class.bg-white/10]="activeFilter() === 'ALL'"
                  [class.text-white]="activeFilter() === 'ALL'"
                  [class.text-slate-400]="activeFilter() !== 'ALL'"
                  class="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer">
                  Todos
                </button>
                <button 
                  type="button"
                  (click)="activeFilter.set('IN_PROGRESS')"
                  [class.bg-white/10]="activeFilter() === 'IN_PROGRESS'"
                  [class.text-white]="activeFilter() === 'IN_PROGRESS'"
                  [class.text-slate-400]="activeFilter() !== 'IN_PROGRESS'"
                  class="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer">
                  En Curso
                </button>
                <button 
                  type="button"
                  (click)="activeFilter.set('COMPLETED')"
                  [class.bg-white/10]="activeFilter() === 'COMPLETED'"
                  [class.text-white]="activeFilter() === 'COMPLETED'"
                  [class.text-slate-400]="activeFilter() !== 'COMPLETED'"
                  class="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer">
                  Completados
                </button>
              </div>
            </div>

            <!-- Tarjetas de Cursos -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (path of filteredPaths(); track path.id) {
                <div 
                  (click)="selectPathCard(path.id)"
                  class="glass-card rounded-2xl p-5 border border-white/10 hover:border-[#A406E9]/40 transition-all cursor-pointer group flex flex-col sm:flex-row gap-5">
                  
                  <!-- Miniatura con botón play overlay -->
                  <div class="relative w-full sm:w-36 h-28 rounded-xl bg-gradient-to-br from-slate-900 to-[#1C1635] overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                    <img 
                      [src]="'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80'" 
                      [alt]="path.title"
                      class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300" />
                    <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div class="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:bg-[#A406E9] group-hover:border-transparent transition-all">
                        <svg lucidePlay class="w-4 h-4 ml-0.5 fill-current"></svg>
                      </div>
                    </div>
                  </div>

                  <!-- Contenido del Curso -->
                  <div class="flex-1 flex flex-col justify-between space-y-3">
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 bg-white/5 border border-white/10 text-[#DA2984] text-[10px] font-mono font-bold rounded-md uppercase">
                          {{ path.badge || 'Frontend' }} Módulo 4/10
                        </span>
                      </div>
                      <h3 class="font-extrabold text-base text-white group-hover:text-[#A406E9] transition-colors leading-tight">
                        {{ path.title }}
                      </h3>
                      <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                        {{ path.subtitle }}
                      </p>
                    </div>

                    <!-- Progreso -->
                    <div class="space-y-1.5 pt-1">
                      <div class="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span>Progreso</span>
                        <span class="text-white font-bold">{{ path.progressPercentage }}%</span>
                      </div>
                      <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                        <div 
                          class="h-full rounded-full bg-brand-gradient transition-all duration-500" 
                          [style.width.%]="path.progressPercentage">
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              } @empty {
                <div class="col-span-full py-12 text-center space-y-3 glass-card rounded-2xl border border-white/5">
                  <svg lucideBookOpen class="w-10 h-10 text-slate-500 mx-auto"></svg>
                  <p class="text-xs text-slate-400">No se encontraron cursos en esta sección.</p>
                </div>
              }
            </div>
          </div>

        } @else {

          <!-- DETALLE DEL CURSO Y ROADMAP DE LECCIONES -->
          @if (courseService.activePath(); as selectedPath) {
            <div class="space-y-6 pt-2">
              
              <!-- Botón Volver -->
              <div>
                <button 
                  (click)="deselectPath()"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161435] hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer">
                  <svg lucideArrowLeft class="w-4 h-4"></svg>
                  Volver a mis cursos
                </button>
              </div>

              <!-- Banner del Curso Seleccionado -->
              <div class="glass-card border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="space-y-1.5">
                    <span class="px-2.5 py-0.5 bg-[#FA743F]/20 text-[#FA743F] text-[10px] font-extrabold uppercase rounded-md border border-[#FA743F]/30">
                      {{ selectedPath.badge || 'CURSO' }}
                    </span>
                    <h2 class="text-2xl font-extrabold text-white">
                      {{ selectedPath.title }}
                    </h2>
                    <p class="text-xs text-slate-400">
                      {{ selectedPath.subtitle }}
                    </p>
                  </div>

                  <button 
                    type="button"
                    (click)="continueLearning()"
                    class="px-6 py-3 bg-gradient-to-r from-[#A406E9] to-[#DA2984] text-xs font-extrabold uppercase rounded-xl text-white hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-[#A406E9]/25 shrink-0 flex items-center gap-2">
                    <svg lucidePlay class="w-4 h-4 fill-current"></svg>
                    Entrar al Aula Virtual
                  </button>
                </div>

                <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                  <div class="bg-brand-gradient h-full rounded-full transition-all duration-500" [style.width.%]="selectedPath.progressPercentage"></div>
                </div>
              </div>

              <!-- Selector de Días y Lista de Lecciones -->
              @if (selectedPath.days.length > 0) {
                <div class="space-y-4">
                  <div class="flex items-center gap-2 overflow-x-auto pb-2">
                    @for (day of selectedPath.days; track day.id) {
                      <button 
                        type="button"
                        (click)="courseService.selectDay(day.dayNumber)"
                        [class.bg-[#A406E9]]="courseService.selectedDayNumber() === day.dayNumber"
                        [class.text-white]="courseService.selectedDayNumber() === day.dayNumber"
                        [class.bg-[#161435]]="courseService.selectedDayNumber() !== day.dayNumber"
                        [class.text-slate-400]="courseService.selectedDayNumber() !== day.dayNumber"
                        class="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer">
                        @if (day.completedLessons === day.totalLessons && day.totalLessons > 0) {
                          <svg lucideCheck class="w-3.5 h-3.5 text-emerald-400"></svg>
                        } @else if (day.isLocked) {
                          <svg lucideLock class="w-3.5 h-3.5 text-slate-500"></svg>
                        }
                        DÍA {{ day.dayNumber }}
                      </button>
                    }
                  </div>

                  @if (courseService.selectedDay(); as currentDay) {
                    <div class="space-y-3 pt-2">
                      <h3 class="text-sm font-extrabold text-white uppercase tracking-wider">
                        {{ currentDay.title }}
                      </h3>

                      <div class="space-y-2.5">
                        @for (lesson of currentDay.lessons; track lesson.id) {
                          <div 
                            (click)="openLesson(lesson)"
                            class="glass-card p-4 rounded-xl flex items-center justify-between hover:border-[#A406E9]/40 transition-all cursor-pointer group">
                            
                            <div class="flex items-center gap-4">
                              <div class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                                @if (lesson.isCompleted) {
                                  <svg lucideCheck class="w-4 h-4 text-emerald-400"></svg>
                                } @else if (lesson.isLocked) {
                                  <svg lucideLock class="w-4 h-4 text-slate-500"></svg>
                                } @else {
                                  <svg lucidePlay class="w-3.5 h-3.5 text-slate-300 group-hover:text-[#A406E9] fill-current"></svg>
                                }
                              </div>
                              <div>
                                <h4 class="font-bold text-sm text-slate-100 group-hover:text-[#A406E9] transition-colors">
                                  {{ lesson.title }}
                                </h4>
                                <span class="text-[11px] font-mono text-slate-400">{{ lesson.type }} • {{ lesson.durationMinutes }} min</span>
                              </div>
                            </div>

                            <svg lucideChevronRight class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"></svg>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }

      }
    </div>
  `
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly activeFilter = signal<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  protected readonly selectedPathId = signal<string | null>(null);
  private routeSub?: Subscription;

  protected readonly filteredPaths = computed(() => {
    const paths = this.courseService.learningPaths();
    const filter = this.activeFilter();
    
    return paths.filter(path => {
      if (filter === 'ALL') return true;
      if (filter === 'IN_PROGRESS') return path.progressPercentage > 0 && path.progressPercentage < 100;
      if (filter === 'COMPLETED') return path.progressPercentage === 100;
      return true;
    });
  });

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const courseId = params.get('id');
      if (courseId) {
        this.selectedPathId.set(courseId);
        this.courseService.selectPath(courseId);
      } else {
        this.selectedPathId.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  selectPathCard(pathId: string): void {
    this.router.navigate(['/student/dashboard', pathId]);
  }

  deselectPath(): void {
    this.router.navigate(['/student/dashboard']);
  }

  openLesson(lesson: any): void {
    if (lesson.isLocked) return;
    this.router.navigate(['/classroom', lesson.id]);
  }

  continueLearning(): void {
    const activeLesson = this.courseService.activeLesson();
    if (activeLesson) {
      this.router.navigate(['/classroom', activeLesson.id]);
    } else {
      this.router.navigate(['/classroom']);
    }
  }
}
