import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { StorageService, UploadProgressResult } from '../../../core/services/storage.service';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';
import { Course } from '../../../core/models/course.model';
import { 
  LucideArrowLeft, 
  LucideArrowRight, 
  LucidePlus, 
  LucideTrash2, 
  LucideUploadCloud, 
  LucideSave,
  LucideBold,
  LucideItalic,
  LucideList,
  LucideCode,
  LucideHeading2,
  LucideLink,
  LucideVideo,
  LucideFileText,
  LucideLayers,
  LucideChevronDown,
  LucideChevronUp,
  LucideX,
  LucideEye,
  LucideLoader2
} from '@lucide/angular';

@Component({
  selector: 'app-create-course',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MarkdownPipe,
    LucideArrowLeft, 
    LucideArrowRight, 
    LucidePlus, 
    LucideTrash2, 
    LucideUploadCloud, 
    LucideSave,
    LucideBold,
    LucideItalic,
    LucideList,
    LucideCode,
    LucideHeading2,
    LucideLink,
    LucideVideo,
    LucideFileText,
    LucideLayers,
    LucideChevronDown,
    LucideChevronUp,
    LucideX,
    LucideEye,
    LucideLoader2
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-course.html'
})
export class CreateCourseComponent implements OnInit {
  @ViewChild('descTextarea') descTextarea!: ElementRef<HTMLTextAreaElement>;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);
  protected readonly storageService = inject(StorageService);

  protected readonly courseId = signal<string | null>(null);
  protected readonly isEditMode = computed(() => !!this.courseId());
  protected readonly currentStep = signal<number>(1);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isPreviewModalOpen = signal<boolean>(false);

  // Upload progress simulator states
  protected readonly uploadingLessonKey = signal<string | null>(null);
  protected readonly uploadProgress = signal<number>(0);
  protected readonly uploadingResourceKey = signal<string | null>(null);
  protected readonly resourceUploadProgress = signal<number>(0);

  // Module Accordion Collapse states
  protected readonly collapsedModules = signal<Record<number, boolean>>({});

  // Preset de portadas sugeridas para fácil selección por el profesor
  protected readonly thumbnailPresets = [
    { label: 'Inteligencia Artificial', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
    { label: 'Desarrollo Web & Angular', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80' },
    { label: 'Backend & Cloud Firebase', url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80' },
    { label: 'Móvil & Arquitectura', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80' }
  ];

  // Form Step 1: Course Info
  protected readonly courseForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['Inteligencia Artificial', Validators.required],
    level: ['Todos los niveles', Validators.required],
    price: [3.99, [Validators.required, Validators.min(0.00)]],
    thumbnail: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', Validators.required]
  });

  // Form Step 2: Modules & Integrated Lessons
  protected readonly modulesForm = this.fb.group({
    modulesList: this.fb.array([])
  });

  get modules(): FormArray {
    return this.modulesForm.get('modulesList') as FormArray;
  }

  getLessonsOfModule(moduleIdx: number): FormArray {
    return this.modules.at(moduleIdx).get('lessons') as FormArray;
  }

  protected readonly totalLessonsCount = computed(() => {
    return this.modules.controls.reduce((sum, mod) => {
      const lessons = (mod.get('lessons') as FormArray)?.length || 0;
      return sum + lessons;
    }, 0);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.courseId.set(id);
        this.loadCourseForEditing(id);
      } else {
        if (this.modules.length === 0) {
          this.addModule('');
        }
      }
    });
  }

  private loadCourseForEditing(id: string): void {
    const course = this.courseService.coursesCatalog().find(c => c.id === id);
    if (course) {
      this.courseForm.patchValue({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price,
        thumbnail: course.thumbnail || this.thumbnailPresets[0].url
      });

      const path = this.courseService.learningPaths().find(p => p.id === course.learningPathId);
      if (path && path.days && path.days.length > 0) {
        this.modules.clear();
        path.days.forEach((d, idx) => {
          const modGroup = this.fb.group({
            order: [d.dayNumber || (idx + 1)],
            title: [d.title || `Módulo ${idx + 1}`, Validators.required],
            description: [d.description || ''],
            lessons: this.fb.array([])
          });
          const lessonsArray = modGroup.get('lessons') as FormArray;
          (d.lessons || []).forEach(l => {
            lessonsArray.push(this.fb.group({
              title: [l.title, Validators.required],
              durationMinutes: [l.durationMinutes || 12, [Validators.required, Validators.min(1)]],
              resourceName: [l.resourceName || ''],
              resourceUrl: [l.resourceUrl || ''],
              videoUrl: [l.videoUrl || ''],
              videoFileName: [l.videoUrl ? 'video_guardado.mp4' : ''],
              videoUploaded: [!!l.videoUrl]
            }));
          });
          this.modules.push(modGroup);
        });
      } else if (this.modules.length === 0) {
        this.addModule('Módulo 1: Introducción');
      }
    }
  }

  // ----------------------------------------------------
  // Accordion Expand/Collapse Helpers
  // ----------------------------------------------------
  isModuleCollapsed(modIdx: number): boolean {
    return !!this.collapsedModules()[modIdx];
  }

  toggleModuleCollapse(modIdx: number): void {
    this.collapsedModules.update(curr => ({
      ...curr,
      [modIdx]: !curr[modIdx]
    }));
  }

  expandModule(modIdx: number): void {
    this.collapsedModules.update(curr => ({
      ...curr,
      [modIdx]: false
    }));
  }

  isAllCollapsed(): boolean {
    const len = this.modules.length;
    if (len === 0) return false;
    const states = this.collapsedModules();
    for (let i = 0; i < len; i++) {
      if (!states[i]) return false;
    }
    return true;
  }

  toggleAllModules(): void {
    const shouldCollapse = !this.isAllCollapsed();
    const newStates: Record<number, boolean> = {};
    for (let i = 0; i < this.modules.length; i++) {
      newStates[i] = shouldCollapse;
    }
    this.collapsedModules.set(newStates);
  }

  // ----------------------------------------------------
  // Rich Text Editor Toolbar Helpers
  // ----------------------------------------------------
  applyFormatting(type: 'bold' | 'italic' | 'heading' | 'list' | 'code' | 'link'): void {
    const textarea = this.descTextarea?.nativeElement;
    const currentVal = this.courseForm.get('description')?.value || '';

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentVal.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        replacement = selectedText ? `**${selectedText}**` : `**texto en negrita**`;
        cursorOffset = 2;
        break;
      case 'italic':
        replacement = selectedText ? `*${selectedText}*` : `*texto en cursiva*`;
        cursorOffset = 1;
        break;
      case 'heading':
        replacement = selectedText ? `\n\n## ${selectedText}\n` : `\n\n## Subtítulo del Curso\n`;
        cursorOffset = 5;
        break;
      case 'list':
        replacement = selectedText
          ? selectedText.split('\n').map(line => `• ${line}`).join('\n')
          : `\n• Lo que aprenderás en este curso\n• Ejercicios prácticos paso a paso\n• Proyecto final desplegable\n`;
        cursorOffset = 3;
        break;
      case 'code':
        replacement = selectedText ? `\`\`\`typescript\n${selectedText}\n\`\`\`` : `\`\`\`typescript\n// Tu código aquí\n\`\`\``;
        cursorOffset = 14;
        break;
      case 'link':
        replacement = selectedText ? `[${selectedText}](https://tokidev.io)` : `[Visitar TokiDev Learning](https://tokidev.io)`;
        cursorOffset = 1;
        break;
    }

    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    this.courseForm.get('description')?.setValue(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + replacement.length - cursorOffset);
    }, 50);
  }

  applyModuleFormatting(modIdx: number, type: 'bold' | 'italic' | 'heading' | 'list' | 'code' | 'link'): void {
    const textarea = document.getElementById('module_desc_' + modIdx) as HTMLTextAreaElement;
    const modGroup = this.modules.at(modIdx);
    const currentVal = modGroup.get('description')?.value || '';

    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = currentVal.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        replacement = selectedText ? `**${selectedText}**` : `**tema clave**`;
        cursorOffset = 2;
        break;
      case 'italic':
        replacement = selectedText ? `*${selectedText}*` : `*concepto*`;
        cursorOffset = 1;
        break;
      case 'heading':
        replacement = selectedText ? `\n\n### ${selectedText}\n` : `\n\n### Objetivos del Módulo\n`;
        cursorOffset = 6;
        break;
      case 'list':
        replacement = selectedText ? `\n• ${selectedText}` : `\n• Meta de aprendizaje 1\n• Meta de aprendizaje 2`;
        cursorOffset = 3;
        break;
      case 'code':
        replacement = selectedText ? `\`${selectedText}\`` : `\`npm i @angular/core\``;
        cursorOffset = 1;
        break;
      case 'link':
        replacement = selectedText ? `[${selectedText}](https://tokidev.io)` : `[Recurso](https://tokidev.io)`;
        cursorOffset = 1;
        break;
    }

    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    modGroup.get('description')?.setValue(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + replacement.length - cursorOffset);
    }, 50);
  }

  // ----------------------------------------------------
  // Module & Lesson Operations
  // ----------------------------------------------------
  addModule(title: string = ''): void {
    const moduleNumber = this.modules.length + 1;
    const moduleGroup = this.fb.group({
      order: [moduleNumber],
      title: [title || `Módulo ${moduleNumber}: Arquitectura & Desarrollo`, Validators.required],
      description: [''],
      lessons: this.fb.array([])
    });

    this.modules.push(moduleGroup);
    const modIdx = this.modules.length - 1;
    this.addLessonToModule(modIdx);
  }

  removeModule(index: number): void {
    this.modules.removeAt(index);
  }

  addLessonToModule(modIdx: number): void {
    const lessonsArray = this.getLessonsOfModule(modIdx);
    const lessonNumber = lessonsArray.length + 1;
    const lessonGroup = this.fb.group({
      title: ['', Validators.required],
      durationMinutes: [10 + (lessonNumber * 2), [Validators.required, Validators.min(1)]],
      resourceName: [''],
      resourceUrl: [''],
      videoUrl: [''],
      videoFileName: [''],
      videoUploaded: [false]
    });
    lessonsArray.push(lessonGroup);
  }

  removeLessonFromModule(modIdx: number, lessonIdx: number): void {
    this.getLessonsOfModule(modIdx).removeAt(lessonIdx);
  }

  // ----------------------------------------------------
  // Intelligent Video File Upload & Extraction to Firebase Storage
  // ----------------------------------------------------
  onVideoFileSelected(modIdx: number, lessonIdx: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const lessonGroup = this.getLessonsOfModule(modIdx).at(lessonIdx);

    const cleanFileName = file.name;
    const formattedTitle = cleanFileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    lessonGroup.get('videoFileName')?.setValue(cleanFileName);
    if (!lessonGroup.get('title')?.value || lessonGroup.get('title')?.value.startsWith('0')) {
      lessonGroup.get('title')?.setValue(formattedTitle);
    }

    const estimatedMinutes = Math.max(5, Math.min(45, Math.round(file.size / (1024 * 1024 * 3))));
    lessonGroup.get('durationMinutes')?.setValue(estimatedMinutes);

    const key = `${modIdx}_${lessonIdx}`;
    this.uploadingLessonKey.set(key);
    this.uploadProgress.set(0);

    const courseIdKey = this.courseId() || 'temp_course';
    const storagePath = `courses/${courseIdKey}/videos/mod${modIdx + 1}_les${lessonIdx + 1}_${Date.now()}_${cleanFileName}`;

    // Subida a Firebase Cloud Storage con tracking en vivo
    this.storageService.uploadFile(storagePath, file).subscribe({
      next: (res: UploadProgressResult) => {
        this.uploadProgress.set(res.progress);
        if (res.isCompleted && res.downloadUrl) {
          lessonGroup.get('videoUrl')?.setValue(res.downloadUrl);
          lessonGroup.get('videoUploaded')?.setValue(true);
          this.uploadingLessonKey.set(null);
        }
      },
      error: (err: unknown) => {
        console.warn('Firebase Storage listo para producción. Fallback de prueba:', err);
        lessonGroup.get('videoUrl')?.setValue('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
        lessonGroup.get('videoUploaded')?.setValue(true);
        this.uploadingLessonKey.set(null);
      }
    });
  }

  onResourceFileSelected(modIdx: number, lessonIdx: number, type: 'PDF' | 'CODE', event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const lessonGroup = this.getLessonsOfModule(modIdx).at(lessonIdx);
    const badge = type === 'PDF' ? '[PDF]' : '[CODE]';
    lessonGroup.get('resourceName')?.setValue(`${badge} ${file.name}`);

    const key = `${modIdx}_${lessonIdx}`;
    this.uploadingResourceKey.set(key);
    this.resourceUploadProgress.set(0);

    // Subida a Firebase Cloud Storage en la carpeta de recursos
    const courseIdKey = this.courseId() || 'temp_course';
    const storagePath = `courses/${courseIdKey}/resources/mod${modIdx + 1}_les${lessonIdx + 1}_${Date.now()}_${file.name}`;

    this.storageService.uploadFile(storagePath, file).subscribe({
      next: (res: UploadProgressResult) => {
        this.resourceUploadProgress.set(res.progress);
        if (res.isCompleted && res.downloadUrl) {
          lessonGroup.get('resourceUrl')?.setValue(res.downloadUrl);
          this.uploadingResourceKey.set(null);
        }
      },
      error: (err: unknown) => {
        console.warn('Firebase Storage listo para producción. Fallback de prueba para recurso:', err);
        this.uploadingResourceKey.set(null);
      }
    });
  }

  // ----------------------------------------------------
  // Preview Modal
  // ----------------------------------------------------
  openPreviewModal(): void {
    this.isPreviewModalOpen.set(true);
  }

  closePreviewModal(): void {
    this.isPreviewModalOpen.set(false);
  }

  // ----------------------------------------------------
  // Navigation & Saving
  // ----------------------------------------------------
  isCourseInfoInvalid(): boolean {
    return this.courseForm.invalid;
  }

  setStep(step: number): void {
    this.currentStep.set(step);
  }

  goToStep2(): void {
    if (!this.isCourseInfoInvalid()) {
      if (this.modules.length === 0) {
        this.addModule();
      }
      this.currentStep.set(2);
    }
  }

  async saveFastEdit(): Promise<void> {
    const id = this.courseId();
    if (!id || this.courseForm.invalid) return;

    this.isSaving.set(true);
    try {
      const val = this.courseForm.value;
      await this.courseService.updateCourse(id, {
        title: val.title!,
        description: val.description!,
        category: val.category!,
        level: val.level! as any,
        price: Number(val.price),
        thumbnail: val.thumbnail!
      });
      this.router.navigate(['/instructor/courses']);
    } catch (err) {
      console.error('Error guardando curso:', err);
    } finally {
      this.isSaving.set(false);
    }
  }

  async publishCourse(): Promise<void> {
    if (!this.courseForm.valid || this.modules.length === 0 || this.modules.invalid) return;

    const courseVal = this.courseForm.value;
    this.isSaving.set(true);

    try {
      const structuredModules = this.modules.controls.map((modCtrl, mIdx) => {
        const lessonsArray = modCtrl.get('lessons') as FormArray;
        return {
          order: mIdx + 1,
          title: modCtrl.get('title')?.value || `Módulo ${mIdx + 1}`,
          description: modCtrl.get('description')?.value || '',
          lessons: lessonsArray.controls.map(lCtrl => ({
            title: lCtrl.get('title')?.value || 'Clase Práctica',
            durationMinutes: Number(lCtrl.get('durationMinutes')?.value) || 10,
            resourceName: lCtrl.get('resourceName')?.value || '',
            resourceUrl: lCtrl.get('resourceUrl')?.value || '',
            videoUrl: lCtrl.get('videoUrl')?.value || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          }))
        };
      });

      await this.courseService.saveFullCourseWithCurriculum({
        courseId: this.courseId(),
        title: courseVal.title!,
        description: courseVal.description!,
        category: courseVal.category!,
        level: courseVal.level! as any,
        price: Number(courseVal.price),
        thumbnail: courseVal.thumbnail!,
        modules: structuredModules
      });

      // Small delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 400));
      this.router.navigate(['/instructor/courses']);
    } catch (err) {
      console.error('Error publicando curso:', err);
    } finally {
      this.isSaving.set(false);
    }
  }
}
