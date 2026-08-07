import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-6">
      @if (authService.currentUser(); as user) {
        <div class="max-w-4xl mx-auto space-y-8">
          
          <!-- Welcome & Subtitle Header -->
          <div class="space-y-1">
            <h1 class="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Bienvenido, {{ user.name }}
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-md shadow-emerald-400/50"></span>
            </h1>
            <p class="text-xs text-slate-400 font-medium">
              Continúa tu aprendizaje y gestiona tus rutas de estudio.
            </p>
          </div>

          <!-- Overall Progress Summary Cards -->
          <div class="grid grid-cols-3 gap-3 md:gap-6 bg-slate-900/80 p-4 md:p-6 rounded-3xl border border-white/10 shadow-xl backdrop-blur-md">
            <div class="text-center space-y-1">
              <span class="text-2xl md:text-4xl font-black text-white tracking-tight">
                {{ user.completedLessonsCount }}
              </span>
              <span class="block text-[10px] md:text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                COMPLETADAS
              </span>
            </div>

            <div class="text-center space-y-1 border-x border-white/10 px-2">
              <span class="text-2xl md:text-4xl font-black text-white tracking-tight">
                {{ user.inProgressCount }}
              </span>
              <span class="block text-[10px] md:text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                EN CURSO
              </span>
            </div>

            <div class="text-center space-y-1">
              <span class="text-2xl md:text-4xl font-black text-brand-gradient tracking-tight">
                {{ user.averageProgressScore }}%
              </span>
              <span class="block text-[10px] md:text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                PROMEDIO
              </span>
            </div>
          </div>

          <!-- Active Path View or Grid View based on selectedPathId -->
          @if (selectedPathId() === null) {
            
            <!-- LIST VIEW (GRID OF COURSE CARDS WITH FILTERS) -->
            <div class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 class="text-lg font-extrabold uppercase text-slate-400 tracking-wider">Mis Rutas de Aprendizaje</h2>
                
                <!-- Filter Tabs -->
                <div class="flex items-center gap-1.5 bg-slate-900/50 p-1 rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
                  <button 
                    type="button"
                    (click)="activeFilter.set('ALL')"
                    [class.bg-white/10]="activeFilter() === 'ALL'"
                    [class.text-white]="activeFilter() === 'ALL'"
                    [class.text-slate-400]="activeFilter() !== 'ALL'"
                    class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                    Todos <span class="px-1.5 py-0.5 rounded bg-slate-950/60 text-[9px] font-mono">{{ counts().all }}</span>
                  </button>
                  <button 
                    type="button"
                    (click)="activeFilter.set('IN_PROGRESS')"
                    [class.bg-white/10]="activeFilter() === 'IN_PROGRESS'"
                    [class.text-white]="activeFilter() === 'IN_PROGRESS'"
                    [class.text-slate-400]="activeFilter() !== 'IN_PROGRESS'"
                    class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                    En Curso <span class="px-1.5 py-0.5 rounded bg-slate-950/60 text-[9px] font-mono">{{ counts().inProgress }}</span>
                  </button>
                  <button 
                    type="button"
                    (click)="activeFilter.set('NOT_STARTED')"
                    [class.bg-white/10]="activeFilter() === 'NOT_STARTED'"
                    [class.text-white]="activeFilter() === 'NOT_STARTED'"
                    [class.text-slate-400]="activeFilter() !== 'NOT_STARTED'"
                    class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                    Por Comenzar <span class="px-1.5 py-0.5 rounded bg-slate-950/60 text-[9px] font-mono">{{ counts().notStarted }}</span>
                  </button>
                  <button 
                    type="button"
                    (click)="activeFilter.set('COMPLETED')"
                    [class.bg-white/10]="activeFilter() === 'COMPLETED'"
                    [class.text-white]="activeFilter() === 'COMPLETED'"
                    [class.text-slate-400]="activeFilter() !== 'COMPLETED'"
                    class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                    Completados <span class="px-1.5 py-0.5 rounded bg-slate-950/60 text-[9px] font-mono">{{ counts().completed }}</span>
                  </button>
                </div>
              </div>

              <!-- Cards Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (path of filteredPaths(); track path.id) {
                  <div 
                    (click)="selectPathCard(path.id)"
                    class="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between hover:border-[#A406E9]/40 hover:scale-[1.01] transition-all cursor-pointer relative overflow-hidden group">
                    
                    <div class="absolute -right-16 -top-16 w-32 h-32 bg-[#A406E9]/5 rounded-full blur-[40px] group-hover:bg-[#A406E9]/10 transition-colors"></div>

                    <div class="space-y-4">
                      <!-- Badge and percentage -->
                      <div class="flex items-center justify-between">
                        <span class="px-2.5 py-1 bg-white/5 text-[9px] font-extrabold uppercase rounded-lg border border-white/10 text-slate-300">
                          {{ path.badge || 'Curso' }}
                        </span>
                        <span class="text-sm font-black text-brand-gradient">
                          {{ path.progressPercentage }}%
                        </span>
                      </div>

                      <!-- Info -->
                      <div class="space-y-1.5">
                        <h3 class="text-lg font-extrabold text-white group-hover:text-[#A406E9] transition-colors leading-snug">
                          {{ path.title }}
                        </h3>
                        <p class="text-xs text-slate-400 font-medium line-clamp-2">
                          {{ path.subtitle }}
                        </p>
                      </div>
                    </div>

                    <!-- Progress bar -->
                    <div class="space-y-4 pt-6">
                      <div class="space-y-1.5">
                        <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{{ path.totalModules }} Módulos / Lecciones</span>
                          <span>
                            @if (path.progressPercentage === 100) {
                              Completado
                            } @else if (path.progressPercentage > 0) {
                              En Curso
                            } @else {
                              Sin Iniciar
                            }
                          </span>
                        </div>
                        <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                          <div 
                            [class.bg-brand-gradient]="path.progressPercentage > 0"
                            [class.bg-slate-800]="path.progressPercentage === 0"
                            class="h-full rounded-full transition-all duration-500" 
                            [style.width.%]="path.progressPercentage">
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center justify-between pt-2 border-t border-white/5">
                        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ver Contenido</span>
                        <div class="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-[#A406E9] group-hover:border-transparent transition-all">
                          <i class="fa-solid fa-chevron-right text-[10px]"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="col-span-full py-12 text-center space-y-3 glass-card rounded-3xl border border-white/5">
                    <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto">
                      <i class="fa-solid fa-book-open text-lg"></i>
                    </div>
                    <p class="text-xs text-slate-400">No se encontraron cursos con este filtro.</p>
                  </div>
                }
              </div>
            </div>

          } @else {
            
            <!-- DETAIL VIEW (ACTIVE COURSE DETAILS & LESSONS) -->
            @if (courseService.activePath(); as selectedPath) {
              <div class="space-y-6">
                
                <!-- Back Button -->
                <div>
                  <button 
                    (click)="deselectPath()"
                    class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer">
                    <i class="fa-solid fa-arrow-left text-[10px]"></i>
                    Volver a mis cursos
                  </button>
                </div>

                <!-- Course Header Info -->
                <div class="bg-slate-900/90 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
                  <div class="absolute -right-24 -top-24 w-48 h-48 bg-[#DA2984]/5 rounded-full blur-[60px]"></div>

                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="space-y-1.5">
                      <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 bg-[#FA743F]/20 text-[#FA743F] text-[9px] font-extrabold uppercase rounded-md border border-[#FA743F]/30">
                          {{ selectedPath.badge || 'CURSO' }}
                        </span>
                        <span class="text-[10px] text-slate-400 font-mono">• {{ selectedPath.totalModules }} Lecciones</span>
                      </div>
                      <h2 class="text-2xl font-black text-white leading-tight">
                        {{ selectedPath.title }}
                      </h2>
                      <p class="text-xs text-slate-400 font-medium">
                        {{ selectedPath.subtitle }}
                      </p>
                    </div>

                    <div class="flex items-center gap-4 shrink-0">
                      <div class="text-right">
                        <span class="text-sm font-black text-white block">{{ selectedPath.progressPercentage }}% Completado</span>
                        <span class="text-[10px] text-slate-400 font-mono">
                          @if (selectedPath.progressPercentage === 100) {
                            ¡Completado!
                          } @else {
                            En Progreso
                          }
                        </span>
                      </div>
                      
                      @if (selectedPath.days.length > 0) {
                        <button 
                          type="button"
                          (click)="continueLearning()"
                          class="px-5 py-2.5 bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold uppercase rounded-xl text-white hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-[#DA2984]/25">
                          Ver Aula Virtual
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Progress Meter -->
                  <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div class="bg-brand-gradient h-full rounded-full transition-all duration-500" [style.width.%]="selectedPath.progressPercentage"></div>
                  </div>
                </div>

                <!-- Clean Day Navigation Bar -->
                @if (selectedPath.days.length > 0) {
                  <div class="space-y-4 pt-2">
                    <div class="flex items-center justify-between border-b border-white/10 pb-3">
                      <span class="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                        SELECCIONA EL DÍA DE ESTUDIO
                      </span>
                    </div>

                    <!-- Day Selection Tabs -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                      @for (day of selectedPath.days; track day.id) {
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
                } @else {
                  <!-- Empty Days Fallback -->
                  <div class="py-12 text-center space-y-3 glass-card rounded-3xl border border-white/5">
                    <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto">
                      <i class="fa-solid fa-calendar-xmark text-lg"></i>
                    </div>
                    <h3 class="text-sm font-bold text-white">Ruta sin contenido diario</h3>
                    <p class="text-xs text-slate-400 max-w-xs mx-auto">Esta ruta de aprendizaje está siendo estructurada por el profesor. ¡Vuelve pronto!</p>
                  </div>
                }
              </div>
            }
          }

        </div>
      }
    </div>
  `
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // States
  protected readonly activeFilter = signal<'ALL' | 'IN_PROGRESS' | 'NOT_STARTED' | 'COMPLETED'>('ALL');
  protected readonly selectedPathId = signal<string | null>(null);

  private routeSub?: Subscription;

  // Filter count indicators
  protected readonly counts = computed(() => {
    const paths = this.courseService.learningPaths();
    return {
      all: paths.length,
      inProgress: paths.filter(p => p.progressPercentage > 0 && p.progressPercentage < 100).length,
      notStarted: paths.filter(p => p.progressPercentage === 0).length,
      completed: paths.filter(p => p.progressPercentage === 100).length,
    };
  });

  // Filtered learning paths
  protected readonly filteredPaths = computed(() => {
    const paths = this.courseService.learningPaths();
    const filter = this.activeFilter();
    
    return paths.filter(path => {
      if (filter === 'ALL') return true;
      if (filter === 'IN_PROGRESS') return path.progressPercentage > 0 && path.progressPercentage < 100;
      if (filter === 'NOT_STARTED') return path.progressPercentage === 0;
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
        
        // Auto-select first unlocked day or first day in general
        const path = this.courseService.learningPaths().find(p => p.id === courseId);
        if (path && path.days.length > 0) {
          const firstAvailableDay = path.days.find(d => !d.isLocked) || path.days[0];
          this.courseService.selectDay(firstAvailableDay.dayNumber);
        }
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

  toggleLesson(lessonId: string): void {
    this.courseService.toggleLessonCompletion(lessonId);
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
      const unlocked = this.courseService.activePath().days
        .flatMap(d => d.lessons)
        .find(l => !l.isLocked);
      if (unlocked) {
        this.router.navigate(['/classroom', unlocked.id]);
      }
    }
  }
}
