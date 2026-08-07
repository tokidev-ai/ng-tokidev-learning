import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-instructor-dashboard',
  imports: [ReactiveFormsModule],
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
                <i class="fa-solid fa-circle text-[8px] animate-pulse"></i> Cuenta Verificada
              </span>
            </div>
            <h1 class="text-3xl md:text-4xl font-black text-white">Panel de Creador & Instructor</h1>
            <p class="text-xs text-slate-400">Gestiona tus publicaciones, sube nuevos módulos de video y revisa tus analíticas de audiencia.</p>
          </div>

          <button 
            type="button"
            (click)="openCreateModal()"
            class="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-white font-extrabold text-xs tracking-wider uppercase hover:opacity-95 transition-all shadow-xl shadow-[#DA2984]/30 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DA2984]">
            <i class="fa-solid fa-plus text-sm"></i>
            Crear Nuevo Curso
          </button>
        </div>

        <!-- Instructor Stats Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-5 rounded-2xl space-y-2">
            <span class="text-xs font-extrabold uppercase text-slate-400">Cursos Publicados</span>
            <div class="text-3xl font-black text-white">
              {{ courseService.coursesCatalog().length }}
            </div>
            <span class="text-[11px] text-emerald-400 font-semibold">+1 este mes</span>
          </div>

          <div class="glass-card p-5 rounded-2xl space-y-2">
            <span class="text-xs font-extrabold uppercase text-slate-400">Estudiantes Totales</span>
            <div class="text-3xl font-black text-[#A406E9]">
              {{ totalStudents() }}
            </div>
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
            <div class="text-3xl font-black text-emerald-400">
              {{ totalEarnings() }}
            </div>
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
                  <img [src]="course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'" 
                       [alt]="course.title" 
                       class="w-20 h-14 rounded-xl object-cover border border-white/10" />
                  <div>
                    <h3 class="font-bold text-base text-white">{{ course.title }}</h3>
                    <span class="text-xs text-slate-400 font-mono">
                      {{ course.studentsCount }} estudiantes • {{ course.category }} • \${{ course.price }} USD
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button 
                    type="button" 
                    (click)="openUploadModal(course)"
                    class="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/30 text-xs font-bold text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-white">
                    <i class="fa-solid fa-cloud-arrow-up mr-1"></i> Subir Video
                  </button>
                  <button 
                    type="button" 
                    class="px-4 py-2 rounded-xl bg-[#DA2984]/20 border border-[#DA2984]/40 text-xs font-bold text-[#DA2984] hover:bg-[#DA2984]/30 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#DA2984]">
                    <i class="fa-solid fa-gear mr-1"></i> Configurar
                  </button>
                </div>
              </div>
            } @empty {
              <div class="glass-card p-12 text-center rounded-2xl space-y-4">
                <div class="w-16 h-16 rounded-full bg-[#DA2984]/10 text-[#DA2984] flex items-center justify-center mx-auto text-2xl">
                  <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <div class="space-y-1">
                  <h3 class="font-bold text-white text-lg">No tienes cursos activos</h3>
                  <p class="text-xs text-slate-400">Crea tu primer curso para comenzar a subir contenido y recibir estudiantes.</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- MODAL 1: Create Course -->
        @if (isCreateModalOpen()) {
          <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="create-course-title">
            <div class="glass-card max-w-lg w-full p-6 rounded-3xl space-y-5 border border-white/20 shadow-2xl">
              <div class="flex items-center justify-between">
                <h3 id="create-course-title" class="text-xl font-extrabold text-white flex items-center gap-2">
                  <i class="fa-solid fa-graduation-cap text-[#DA2984]"></i> Crear Nuevo Curso
                </h3>
                <button (click)="isCreateModalOpen.set(false)" class="text-slate-400 hover:text-white cursor-pointer" aria-label="Cerrar modal">
                  <i class="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <form [formGroup]="courseForm" (ngSubmit)="submitCourse()" class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase text-slate-400">Título del Curso</label>
                  <input 
                    type="text" 
                    formControlName="title"
                    placeholder="Ej. NestJS Microservicios Avanzados" 
                    class="w-full bg-slate-900 border border-white/10 focus:border-[#A406E9] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                  @if (courseForm.get('title')?.touched && courseForm.get('title')?.invalid) {
                    <span class="text-[10px] text-rose-500 font-bold block">El título es requerido (mínimo 5 caracteres).</span>
                  }
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase text-slate-400">Descripción / Subtítulo</label>
                  <textarea 
                    formControlName="description"
                    placeholder="Describe de qué trata el curso..." 
                    rows="3"
                    class="w-full bg-slate-900 border border-white/10 focus:border-[#A406E9] outline-none p-3 rounded-xl text-xs text-white transition-colors resize-none"></textarea>
                  @if (courseForm.get('description')?.touched && courseForm.get('description')?.invalid) {
                    <span class="text-[10px] text-rose-500 font-bold block">La descripción es requerida.</span>
                  }
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold uppercase text-slate-400">Categoría</label>
                    <select 
                      formControlName="category"
                      class="w-full bg-slate-900 border border-white/10 focus:border-[#A406E9] outline-none p-3 rounded-xl text-xs text-white transition-colors">
                      <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                      <option value="Desarrollo Web">Desarrollo Web</option>
                      <option value="Backend & Cloud">Backend & Cloud</option>
                      <option value="Diseño & Producto">Diseño & Producto</option>
                    </select>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-bold uppercase text-slate-400">Nivel</label>
                    <select 
                      formControlName="level"
                      class="w-full bg-slate-900 border border-white/10 focus:border-[#A406E9] outline-none p-3 rounded-xl text-xs text-white transition-colors">
                      <option value="Todos los niveles">Todos los niveles</option>
                      <option value="Principiante">Principiante</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase text-slate-400">Costo del Curso (USD)</label>
                  <input 
                    type="number" 
                    formControlName="price"
                    step="0.01"
                    placeholder="Ej. 3.99" 
                    class="w-full bg-slate-900 border border-white/10 focus:border-[#A406E9] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                  @if (courseForm.get('price')?.touched && courseForm.get('price')?.invalid) {
                    <span class="text-[10px] text-rose-500 font-bold block">El precio es requerido (mínimo 0.99).</span>
                  }
                </div>

                <div class="flex justify-end gap-2 pt-2">
                  <button 
                    type="button"
                    (click)="isCreateModalOpen.set(false)" 
                    class="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-slate-300 hover:text-white cursor-pointer">
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    [disabled]="courseForm.invalid"
                    class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold text-white cursor-pointer hover:opacity-95 disabled:opacity-40 transition-all">
                    Guardar Curso
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- MODAL 2: Upload Video / Add Lesson -->
        @if (isUploadModalOpen() && selectedCourseForUpload(); as course) {
          <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="upload-video-title">
            <div class="glass-card max-w-lg w-full p-6 rounded-3xl space-y-5 border border-white/20 shadow-2xl">
              <div class="flex items-center justify-between">
                <h3 id="upload-video-title" class="text-xl font-extrabold text-white flex items-center gap-2">
                  <i class="fa-solid fa-clapperboard text-[#DA2984]"></i> Subir Contenido para:
                </h3>
                <button (click)="closeUploadModal()" class="text-slate-400 hover:text-white cursor-pointer" aria-label="Cerrar modal">
                  <i class="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <span class="text-xs text-[#FA743F] font-mono block truncate -mt-3">{{ course.title }}</span>

              <form [formGroup]="lessonForm" (ngSubmit)="submitLesson()" class="space-y-4">
                
                <!-- Video File Sim Dropzone -->
                <div class="space-y-2">
                  <label class="text-xs font-bold uppercase text-slate-400">Archivo de Video</label>
                  
                  @if (uploadProgress() === null) {
                    <!-- Ready state -->
                    <div 
                      (click)="simulateFileUpload()"
                      class="border-2 border-dashed border-white/10 hover:border-[#DA2984] rounded-2xl p-6 text-center space-y-2 bg-slate-900/40 transition-colors cursor-pointer">
                      <div class="w-10 h-10 rounded-full bg-[#DA2984]/15 text-[#DA2984] flex items-center justify-center mx-auto text-lg">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                      </div>
                      <div>
                        <span class="font-bold text-xs text-white block">Seleccionar archivo MP4 / M4V</span>
                        <span class="text-[10px] text-slate-500">Haz clic para simular la carga inmediata</span>
                      </div>
                    </div>
                  } @else if (uploadProgress()! < 100) {
                    <!-- Progress state -->
                    <div class="border border-white/15 bg-slate-900/60 rounded-2xl p-6 space-y-3">
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-300 font-bold flex items-center gap-1.5">
                          <i class="fa-solid fa-spinner animate-spin text-[#DA2984]"></i>
                          {{ mockFileName() }}
                        </span>
                        <span class="text-[#DA2984] font-black">{{ uploadProgress() }}%</span>
                      </div>
                      <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-gradient-to-r from-[#A406E9] to-[#DA2984] h-full rounded-full transition-all duration-300" [style.width.%]="uploadProgress()"></div>
                      </div>
                    </div>
                  } @else {
                    <!-- Success state -->
                    <div class="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-4 flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                          <i class="fa-solid fa-check"></i>
                        </div>
                        <div class="text-left">
                          <span class="text-xs font-bold text-white block truncate max-w-56">{{ mockFileName() }}</span>
                          <span class="text-[10px] text-emerald-400 font-medium">Subida completada</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        (click)="resetUpload()" 
                        class="text-[10px] font-bold text-slate-400 hover:text-white underline cursor-pointer">
                        Cambiar
                      </button>
                    </div>
                  }
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold uppercase text-slate-400">Número de Día</label>
                    <input 
                      type="number" 
                      formControlName="dayNumber"
                      min="1"
                      placeholder="Ej. 1" 
                      class="w-full bg-slate-900 border border-white/10 focus:border-[#A406E9] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-bold uppercase text-slate-400">Duración (Minutos)</label>
                    <input 
                      type="number" 
                      formControlName="durationMinutes"
                      min="1"
                      placeholder="Ej. 12" 
                      class="w-full bg-slate-900 border border-white/10 focus:border-[#A406E9] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase text-slate-400">Título de la Lección</label>
                  <input 
                    type="text" 
                    formControlName="title"
                    placeholder="Ej. Configuración de Variables de Entorno" 
                    class="w-full bg-slate-900 border border-white/10 focus:border-[#A406E9] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                  @if (lessonForm.get('title')?.touched && lessonForm.get('title')?.invalid) {
                    <span class="text-[10px] text-rose-500 font-bold block">El título de la lección es requerido.</span>
                  }
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase text-slate-400">Resumen / Descripción de Clase</label>
                  <textarea 
                    formControlName="summary"
                    placeholder="Describe qué se enseñará en esta lección..." 
                    rows="2"
                    class="w-full bg-slate-900 border border-white/10 focus:border-[#A406E9] outline-none p-3 rounded-xl text-xs text-white transition-colors resize-none"></textarea>
                </div>

                <div class="flex justify-end gap-2 pt-2">
                  <button 
                    type="button"
                    (click)="closeUploadModal()" 
                    class="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-slate-300 hover:text-white cursor-pointer">
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    [disabled]="lessonForm.invalid || uploadProgress() !== 100"
                    class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold text-white cursor-pointer hover:opacity-95 disabled:opacity-40 transition-all">
                    Agregar Lección
                  </button>
                </div>
              </form>
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
  private readonly fb = inject(FormBuilder);

  protected readonly isCreateModalOpen = signal(false);
  protected readonly isUploadModalOpen = signal(false);
  protected readonly selectedCourseForUpload = signal<Course | null>(null);

  // Simulated Upload States
  protected readonly uploadProgress = signal<number | null>(null);
  protected readonly mockFileName = signal<string>('');

  // Course Reactive Form
  protected readonly courseForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['Inteligencia Artificial', Validators.required],
    level: ['Todos los niveles', Validators.required],
    price: [3.99, [Validators.required, Validators.min(0.99)]]
  });

  // Lesson Reactive Form
  protected readonly lessonForm = this.fb.group({
    dayNumber: [1, [Validators.required, Validators.min(1)]],
    title: ['', Validators.required],
    durationMinutes: [10, [Validators.required, Validators.min(1)]],
    summary: ['']
  });

  // Computed totals for stats
  protected readonly totalStudents = () => {
    return this.courseService.coursesCatalog().reduce((sum, c) => sum + c.studentsCount, 0).toLocaleString();
  };

  protected readonly totalEarnings = () => {
    const total = this.courseService.coursesCatalog().reduce((sum, c) => sum + (c.studentsCount * c.price * 0.7), 0); // simulated instructor 70% share
    return '$' + Math.round(total).toLocaleString();
  };

  openCreateModal(): void {
    this.courseForm.reset({
      title: '',
      description: '',
      category: 'Inteligencia Artificial',
      level: 'Todos los niveles',
      price: 3.99
    });
    this.isCreateModalOpen.set(true);
  }

  submitCourse(): void {
    if (this.courseForm.valid) {
      const formVal = this.courseForm.value;
      const user = this.authService.currentUser();
      
      this.courseService.createCourse({
        title: formVal.title!,
        description: formVal.description!,
        category: formVal.category!,
        level: formVal.level! as any,
        price: formVal.price!,
        instructorName: user.name,
        instructorAvatar: user.avatar
      });

      this.isCreateModalOpen.set(false);
    }
  }

  openUploadModal(course: Course): void {
    this.selectedCourseForUpload.set(course);
    this.lessonForm.reset({
      dayNumber: 1,
      title: '',
      durationMinutes: 10,
      summary: ''
    });
    this.uploadProgress.set(null);
    this.mockFileName.set('');
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.isUploadModalOpen.set(false);
    this.selectedCourseForUpload.set(null);
  }

  simulateFileUpload(): void {
    const randomNames = [
      'intro_conceptos_principales.mp4',
      'modulo_1_ejercicio_guiado.mp4',
      'clase_de_configuracion_v2.mp4',
      'microservicios_implementacion.mp4',
      'prompting_avanzado_mastery.mp4'
    ];
    const index = Math.floor(Math.random() * randomNames.length);
    this.mockFileName.set(randomNames[index]);
    this.uploadProgress.set(0);

    const interval = setInterval(() => {
      this.uploadProgress.update(val => {
        if (val === null) {
          clearInterval(interval);
          return null;
        }
        if (val >= 100) {
          clearInterval(interval);
          return 100;
        }
        const inc = Math.floor(Math.random() * 25) + 10;
        const nextVal = val + inc;
        return nextVal > 100 ? 100 : nextVal;
      });
    }, 400);
  }

  resetUpload(): void {
    this.uploadProgress.set(null);
    this.mockFileName.set('');
  }

  submitLesson(): void {
    const course = this.selectedCourseForUpload();
    if (this.lessonForm.valid && course && this.uploadProgress() === 100) {
      const formVal = this.lessonForm.value;

      this.courseService.addLesson(course.id, {
        dayNumber: formVal.dayNumber!,
        title: formVal.title!,
        type: 'VIDEO',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // mock standard placeholder video
        summary: formVal.summary || '',
        durationMinutes: formVal.durationMinutes!
      });

      this.closeUploadModal();
    }
  }
}
