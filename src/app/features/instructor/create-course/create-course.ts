import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-create-course',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-4xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 pb-4">
          <div class="space-y-1">
            <span class="text-xs text-[#DA2984] font-extrabold uppercase tracking-widest">Asistente de Publicación</span>
            <h1 class="text-2xl md:text-3xl font-black text-white">Diseñar Nueva Ruta de Aprendizaje</h1>
          </div>
          <a routerLink="/instructor" class="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all">
            <i class="fa-solid fa-arrow-left mr-1"></i> Volver
          </a>
        </div>

        <!-- Wizard Navigation -->
        <div class="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
          <button 
            type="button"
            (click)="setStep(1)"
            [class.bg-white/10]="currentStep() === 1"
            [class.text-white]="currentStep() === 1"
            class="py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer">
            1. Datos del Curso
          </button>
          <button 
            type="button"
            (click)="goToStep2()"
            [disabled]="isCourseInfoInvalid()"
            [class.bg-white/10]="currentStep() === 2"
            [class.text-white]="currentStep() === 2"
            class="py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-30">
            2. Módulos & Días
          </button>
          <button 
            type="button"
            (click)="goToStep3()"
            [disabled]="isCourseInfoInvalid() || days.length === 0"
            [class.bg-white/10]="currentStep() === 3"
            [class.text-white]="currentStep() === 3"
            class="py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-30">
            3. Carga de Videos
          </button>
        </div>

        <!-- Forms Container -->
        <div class="glass-card rounded-3xl p-6 md:p-8 space-y-6">
          
          <!-- STEP 1: Course Meta info -->
          @if (currentStep() === 1) {
            <form [formGroup]="courseForm" class="space-y-5">
              <h3 class="text-sm font-extrabold uppercase text-slate-400 tracking-wider">Metadatos del Catálogo</h3>
              
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase text-slate-400">Título del Curso</label>
                <input 
                  type="text" 
                  formControlName="title"
                  placeholder="Ej. Mastering Angular Signals & RxJS" 
                  class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3.5 rounded-xl text-xs text-white" />
                @if (courseForm.get('title')?.touched && courseForm.get('title')?.invalid) {
                  <span class="text-[10px] text-rose-500 font-bold block">El título es requerido (mínimo 5 caracteres).</span>
                }
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase text-slate-400">Descripción General</label>
                <textarea 
                  formControlName="description"
                  placeholder="Describe de qué trata este curso y qué aprenderán los estudiantes..." 
                  rows="3"
                  class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3.5 rounded-xl text-xs text-white resize-none"></textarea>
                @if (courseForm.get('description')?.touched && courseForm.get('description')?.invalid) {
                  <span class="text-[10px] text-rose-500 font-bold block">La descripción es requerida (mínimo 10 caracteres).</span>
                }
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase text-slate-400">Categoría</label>
                  <select 
                    formControlName="category"
                    class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3.5 rounded-xl text-xs text-white">
                    <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                    <option value="Desarrollo Web">Desarrollo Web</option>
                    <option value="Backend & Cloud">Backend & Cloud</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase text-slate-400">Nivel de Habilidad</label>
                  <select 
                    formControlName="level"
                    class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3.5 rounded-xl text-xs text-white">
                    <option value="Todos los niveles">Todos los niveles</option>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase text-slate-400">Costo del Curso (USD)</label>
                  <input 
                    type="number" 
                    formControlName="price"
                    step="0.01"
                    placeholder="Ej. 3.99" 
                    class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3.5 rounded-xl text-xs text-white" />
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <button 
                  type="button" 
                  (click)="goToStep2()"
                  [disabled]="isCourseInfoInvalid()"
                  class="px-6 py-3 bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-white text-xs font-extrabold uppercase rounded-xl cursor-pointer disabled:opacity-40 transition-all hover:opacity-95 flex items-center gap-1.5">
                  Módulos y Temario <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </form>
          }

          <!-- STEP 2: Custom Modules & Study Days -->
          @if (currentStep() === 2) {
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-extrabold uppercase text-slate-400 tracking-wider">Estructura del Temario (Días de Aprendizaje)</h3>
                
                <button 
                  type="button"
                  (click)="addDay()"
                  class="px-3.5 py-2 bg-[#A406E9]/20 hover:bg-[#A406E9]/30 text-[#A406E9] border border-[#A406E9]/40 rounded-xl text-xs font-bold transition-all cursor-pointer">
                  <i class="fa-solid fa-plus mr-1"></i> Agregar Día / Módulo
                </button>
              </div>

              <!-- Day Modules List -->
              <div class="space-y-4">
                @for (dayForm of days.controls; track $index; let dayIdx = $index) {
                  <div class="p-5 bg-slate-900/60 border border-white/10 rounded-2xl space-y-4">
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="w-7 h-7 rounded-lg bg-[#A406E9]/20 text-[#A406E9] border border-[#A406E9]/30 flex items-center justify-center font-bold text-xs">
                          Día {{ dayIdx + 1 }}
                        </span>
                        <input 
                          type="text" 
                          [formControl]="$any(dayForm).get('title')"
                          placeholder="Título del Módulo (Ej. Fundamentos e Inyección)" 
                          class="bg-transparent border-b border-white/10 focus:border-white outline-none px-2 py-0.5 text-xs text-white font-bold w-64 md:w-80" />
                      </div>
                      
                      <button 
                        type="button" 
                        (click)="removeDay(dayIdx)"
                        class="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        aria-label="Eliminar día">
                        <i class="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>

                    <div class="space-y-1">
                      <input 
                        type="text" 
                        [formControl]="$any(dayForm).get('description')"
                        placeholder="Descripción corta del temario del módulo..." 
                        class="w-full bg-slate-950/60 border border-white/5 outline-none p-2 rounded-xl text-xs text-slate-300" />
                    </div>

                    <!-- Lessons / Classes in this module -->
                    <div class="pl-4 border-l-2 border-white/10 space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-extrabold uppercase text-slate-400">Lecciones del Día</span>
                        <button 
                          type="button"
                          (click)="addLesson(dayIdx)"
                          class="px-2 py-1 bg-white/5 hover:bg-white/10 text-xs text-slate-300 rounded-lg transition-all cursor-pointer">
                          + Agregar Clase
                        </button>
                      </div>

                      @for (lessonForm of getLessons(dayIdx).controls; track $index; let lessonIdx = $index) {
                        <div class="p-3 bg-slate-950/80 border border-white/5 rounded-xl space-y-3">
                          <div class="flex items-center justify-between gap-3">
                            <input 
                              type="text"
                              [formControl]="$any(lessonForm).get('title')"
                              placeholder="Nombre de la clase (Ej. Señales Reactivas vs BehaviorSubject)"
                              class="bg-transparent border-b border-white/10 focus:border-white outline-none text-xs text-white w-full" />
                            
                            <button 
                              type="button" 
                              (click)="removeLesson(dayIdx, lessonIdx)"
                              class="text-slate-600 hover:text-rose-400 transition-all cursor-pointer">
                              <i class="fa-solid fa-circle-minus text-xs"></i>
                            </button>
                          </div>

                          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input 
                              type="number"
                              [formControl]="$any(lessonForm).get('durationMinutes')"
                              placeholder="Minutos"
                              class="w-full bg-slate-900 border border-white/10 p-2 rounded-lg text-[10px] text-white" />
                            
                            <input 
                              type="text"
                              [formControl]="$any(lessonForm).get('resourceName')"
                              placeholder="Nombre del Recurso (Ej. CheatSheet.pdf)"
                              class="w-full bg-slate-900 border border-white/10 p-2 rounded-lg text-[10px] text-white" />

                            <input 
                              type="text"
                              [formControl]="$any(lessonForm).get('summary')"
                              placeholder="Resumen"
                              class="w-full bg-slate-900 border border-white/10 p-2 rounded-lg text-[10px] text-white" />
                          </div>
                        </div>
                      }
                    </div>

                  </div>
                } @empty {
                  <div class="text-center py-10 border border-dashed border-white/10 rounded-2xl space-y-2">
                    <p class="text-xs text-slate-500">No has agregado módulos de estudio.</p>
                    <button type="button" (click)="addDay()" class="text-xs font-bold text-[#A406E9] underline cursor-pointer">Crear Primer Día</button>
                  </div>
                }
              </div>

              <!-- Action buttons -->
              <div class="flex justify-between pt-4">
                <button 
                  type="button" 
                  (click)="setStep(1)"
                  class="px-4 py-2.5 bg-slate-900 border border-white/10 text-slate-300 text-xs font-bold rounded-xl cursor-pointer">
                  Atrás
                </button>
                <button 
                  type="button" 
                  (click)="goToStep3()"
                  [disabled]="days.invalid || days.length === 0"
                  class="px-6 py-3 bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-white text-xs font-extrabold uppercase rounded-xl cursor-pointer disabled:opacity-40 transition-all hover:opacity-95 flex items-center gap-1.5">
                  Subir Videos <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          }

          <!-- STEP 3: Video File Upload Simulation -->
          @if (currentStep() === 3) {
            <div class="space-y-6">
              <div class="space-y-1">
                <h3 class="text-sm font-extrabold uppercase text-slate-400 tracking-wider">Carga y validación de Videos</h3>
                <p class="text-[11px] text-slate-500">Debes simular la subida de los archivos de video para todas las lecciones del temario.</p>
              </div>

              <!-- Upload progress grid -->
              <div class="space-y-3">
                @for (dayData of getDaysData(); track dayData.dayNumber; let dIdx = $index) {
                  <div class="space-y-2">
                    <span class="text-xs font-bold text-slate-300 uppercase block">Día {{ dayData.dayNumber }} • {{ dayData.title }}</span>
                    
                    <div class="space-y-2 pl-4">
                      @for (lesson of dayData.lessons; track lesson.title; let lIdx = $index) {
                        <div class="p-3.5 bg-slate-900/60 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div class="space-y-1">
                            <span class="text-xs font-bold text-white block">{{ lesson.title }}</span>
                            <span class="text-[10px] text-slate-500 block font-mono">Clase {{ lIdx + 1 }} • {{ lesson.durationMinutes }} minutos</span>
                          </div>

                          <!-- Upload simulator trigger -->
                          <div class="shrink-0">
                            @if (!lesson.videoUploaded) {
                              @if (uploadingLessonIndex() === dIdx + '_' + lIdx) {
                                <div class="flex items-center gap-3">
                                  <div class="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                    <div class="bg-[#FA743F] h-full rounded-full transition-all duration-300" [style.width.%]="uploadProgress()"></div>
                                  </div>
                                  <span class="text-[10px] font-black text-[#FA743F] font-mono">{{ uploadProgress() }}%</span>
                                </div>
                              } @else {
                                <button 
                                  type="button"
                                  (click)="simulateLessonVideoUpload(dIdx, lIdx)"
                                  class="px-3 py-1.5 rounded bg-slate-950 border border-white/10 hover:border-[#FA743F]/50 text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer">
                                  <i class="fa-solid fa-cloud-arrow-up mr-1 text-[#FA743F]"></i> Subir Video
                                </button>
                              }
                            } @else {
                              <span class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                <i class="fa-solid fa-circle-check text-emerald-400"></i> Video Cargado
                              </span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Action buttons -->
              <div class="flex justify-between pt-4">
                <button 
                  type="button" 
                  (click)="setStep(2)"
                  class="px-4 py-2.5 bg-slate-900 border border-white/10 text-slate-300 text-xs font-bold rounded-xl cursor-pointer">
                  Atrás
                </button>
                
                <button 
                  type="button" 
                  (click)="publishCourse()"
                  [disabled]="!areAllVideosUploaded()"
                  class="px-6 py-3 bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-white text-xs font-extrabold uppercase rounded-xl cursor-pointer disabled:opacity-40 transition-all hover:opacity-95 flex items-center gap-1.5">
                  Publicar Ruta Completa <i class="fa-solid fa-circle-play"></i>
                </button>
              </div>
            </div>
          }

        </div>

      </div>
    </div>
  `
})
export class CreateCourseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);

  protected readonly currentStep = signal<number>(1);

  // Upload progress simulator states
  protected readonly uploadingLessonIndex = signal<string | null>(null);
  protected readonly uploadProgress = signal<number>(0);

  // Form Step 1
  protected readonly courseForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['Inteligencia Artificial', Validators.required],
    level: ['Todos los niveles', Validators.required],
    price: [3.99, [Validators.required, Validators.min(0.99)]]
  });

  // Form Step 2 (Array of Days)
  protected readonly daysForm = this.fb.group({
    daysList: this.fb.array([])
  });

  get days(): FormArray {
    return this.daysForm.get('daysList') as FormArray;
  }

  getLessons(dayIdx: number): FormArray {
    return this.days.at(dayIdx).get('lessons') as FormArray;
  }

  addDay(): void {
    const dayGroup = this.fb.group({
      dayNumber: [this.days.length + 1],
      title: [`Día ${this.days.length + 1} • Título del Módulo`, Validators.required],
      description: ['', Validators.required],
      lessons: this.fb.array([])
    });
    this.days.push(dayGroup);
    // Add one default lesson to make it easy
    this.addLesson(this.days.length - 1);
  }

  removeDay(dayIdx: number): void {
    this.days.removeAt(dayIdx);
    // Reset day numbers
    this.days.controls.forEach((day, idx) => {
      day.get('dayNumber')?.setValue(idx + 1);
    });
  }

  addLesson(dayIdx: number): void {
    const lessonsArray = this.getLessons(dayIdx);
    const lessonGroup = this.fb.group({
      title: [`Clase ${lessonsArray.length + 1}`, Validators.required],
      durationMinutes: [15, [Validators.required, Validators.min(1)]],
      resourceName: [''],
      summary: [''],
      videoUploaded: [false]
    });
    lessonsArray.push(lessonGroup);
  }

  removeLesson(dayIdx: number, lessonIdx: number): void {
    this.getLessons(dayIdx).removeAt(lessonIdx);
  }

  isCourseInfoInvalid(): boolean {
    return this.courseForm.invalid;
  }

  setStep(step: number): void {
    this.currentStep.set(step);
  }

  goToStep2(): void {
    if (!this.isCourseInfoInvalid()) {
      if (this.days.length === 0) {
        this.addDay(); // add a default day
      }
      this.currentStep.set(2);
    }
  }

  goToStep3(): void {
    if (!this.isCourseInfoInvalid() && this.days.length > 0 && this.days.valid) {
      this.currentStep.set(3);
    }
  }

  // Get typed days object arrays for template rendering
  getDaysData(): any[] {
    return this.days.controls.map((dayCtrl) => {
      const lessonsArray = (dayCtrl.get('lessons') as FormArray).controls;
      return {
        dayNumber: dayCtrl.get('dayNumber')?.value,
        title: dayCtrl.get('title')?.value,
        description: dayCtrl.get('description')?.value,
        lessons: lessonsArray.map(l => ({
          title: l.get('title')?.value,
          durationMinutes: l.get('durationMinutes')?.value,
          videoUploaded: l.get('videoUploaded')?.value
        }))
      };
    });
  }

  simulateLessonVideoUpload(dayIdx: number, lessonIdx: number): void {
    const key = `${dayIdx}_${lessonIdx}`;
    this.uploadingLessonIndex.set(key);
    this.uploadProgress.set(0);

    const interval = setInterval(() => {
      this.uploadProgress.update(val => {
        if (val >= 100) {
          clearInterval(interval);
          this.uploadingLessonIndex.set(null);
          this.getLessons(dayIdx).at(lessonIdx).get('videoUploaded')?.setValue(true);
          return 100;
        }
        const inc = Math.floor(Math.random() * 20) + 15;
        const nextVal = val + inc;
        return nextVal > 100 ? 100 : nextVal;
      });
    }, 250);
  }

  areAllVideosUploaded(): boolean {
    if (this.days.length === 0) return false;
    for (let d = 0; d < this.days.length; d++) {
      const lessons = this.getLessons(d);
      if (lessons.length === 0) return false;
      for (let l = 0; l < lessons.length; l++) {
        if (!lessons.at(l).get('videoUploaded')?.value) {
          return false;
        }
      }
    }
    return true;
  }

  publishCourse(): void {
    if (this.courseForm.valid && this.days.valid && this.areAllVideosUploaded()) {
      const user = this.authService.currentUser();
      if (!user) return;

      const courseVal = this.courseForm.value;

      // 1. Create the Course Model
      const courseId = this.courseService.createCourse({
        title: courseVal.title!,
        description: courseVal.description!,
        category: courseVal.category!,
        level: courseVal.level! as any,
        price: courseVal.price!,
        instructorName: user.name,
        instructorAvatar: user.avatar
      });

      // Find created course to access its autogenerated learningPathId
      const course = this.courseService.coursesCatalog().find(c => c.id === courseId);
      if (!course) return;

      const path = this.courseService.learningPaths().find(p => p.id === course.learningPathId);
      if (!path) return;

      // Clear standard template days of new path and insert the custom configured ones
      path.days = [];

      this.days.controls.forEach((dayCtrl, dIdx) => {
        const dayNum = dayCtrl.get('dayNumber')?.value || (dIdx + 1);
        
        // Add lessons manually using courseService
        const lessonsArray = dayCtrl.get('lessons') as FormArray;
        lessonsArray.controls.forEach((lessonCtrl) => {
          this.courseService.addLesson(courseId, {
            dayNumber: dayNum,
            title: lessonCtrl.get('title')?.value,
            type: 'VIDEO',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            summary: lessonCtrl.get('summary')?.value || '',
            durationMinutes: lessonCtrl.get('durationMinutes')?.value || 10,
            resourceName: lessonCtrl.get('resourceName')?.value || null
          });
        });

        // Set day custom title & description
        const registeredDay = path.days.find(d => d.dayNumber === dayNum);
        if (registeredDay) {
          registeredDay.title = dayCtrl.get('title')?.value;
          registeredDay.description = dayCtrl.get('description')?.value;
        }
      });

      this.router.navigate(['/instructor']);
    }
  }
}
