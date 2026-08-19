import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { 
  LucideArrowLeft, 
  LucideArrowRight, 
  LucidePlus, 
  LucideTrash2, 
  LucideUploadCloud, 
  LucideCheckCircle2, 
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
    ReactiveFormsModule, 
    RouterLink,
    LucideArrowLeft,
    LucideArrowRight,
    LucidePlus,
    LucideTrash2,
    LucideUploadCloud,
    LucideCheckCircle2,
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

  protected readonly courseId = signal<string | null>(null);
  protected readonly isEditMode = computed(() => !!this.courseId());
  protected readonly currentStep = signal<number>(1);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isPreviewModalOpen = signal<boolean>(false);

  // Upload progress simulator states
  protected readonly uploadingLessonKey = signal<string | null>(null);
  protected readonly uploadProgress = signal<number>(0);

  // Module Accordion Collapse states
  protected readonly collapsedModules = signal<Record<number, boolean>>({});

  // Form Step 1: Course Info
  protected readonly courseForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['Inteligencia Artificial', Validators.required],
    level: ['Todos los niveles', Validators.required],
    price: [3.99, [Validators.required, Validators.min(0.00)]]
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
        price: course.price
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
              videoFileName: ['leccion_guardada.mp4'],
              videoUploaded: [true]
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
  // Module & Lesson Management
  // ----------------------------------------------------
  addModule(defaultTitle?: string): void {
    const modIdx = this.modules.length + 1;
    const modGroup = this.fb.group({
      order: [modIdx],
      title: [defaultTitle ?? '', Validators.required],
      description: [''],
      lessons: this.fb.array([])
    });
    this.modules.push(modGroup);
    this.addLessonToModule(this.modules.length - 1);
  }

  removeModule(modIdx: number): void {
    this.modules.removeAt(modIdx);
  }

  addLessonToModule(modIdx: number): void {
    const lessonsArray = this.getLessonsOfModule(modIdx);
    const lessonNumber = lessonsArray.length + 1;
    const lessonGroup = this.fb.group({
      title: ['', Validators.required],
      durationMinutes: [10 + (lessonNumber * 2), [Validators.required, Validators.min(1)]],
      resourceName: [''],
      videoFileName: [''],
      videoUploaded: [false]
    });
    lessonsArray.push(lessonGroup);
  }

  removeLessonFromModule(modIdx: number, lessonIdx: number): void {
    this.getLessonsOfModule(modIdx).removeAt(lessonIdx);
  }

  // ----------------------------------------------------
  // Intelligent Video File Upload & Extraction
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

    const interval = setInterval(() => {
      this.uploadProgress.update(val => {
        if (val >= 100) {
          clearInterval(interval);
          this.uploadingLessonKey.set(null);
          lessonGroup.get('videoUploaded')?.setValue(true);
          return 100;
        }
        const inc = Math.floor(Math.random() * 25) + 20;
        const nextVal = val + inc;
        return nextVal > 100 ? 100 : nextVal;
      });
    }, 180);
  }

  onResourceFileSelected(modIdx: number, lessonIdx: number, type: 'PDF' | 'CODE', event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const lessonGroup = this.getLessonsOfModule(modIdx).at(lessonIdx);
    const badge = type === 'PDF' ? '[PDF]' : '[CODE]';
    lessonGroup.get('resourceName')?.setValue(`${badge} ${file.name}`);
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
        price: Number(val.price)
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
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
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
