import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CourseReview } from '../../../core/models/course.model';
import { db } from '../../../core/firebase/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';
import { ShareModalComponent } from '../../../shared/components/share-modal/share-modal';
import { slugify, matchSlug } from '../../../shared/utils/slug.utils';
import { 
  LucidePlay, 
  LucideCheck, 
  LucideLock, 
  LucideChevronLeft, 
  LucideChevronRight, 
  LucideShare2, 
  LucideFileText, 
  LucideClock, 
  LucideDownload, 
  LucideList, 
  LucideMessageSquare, 
  LucideSend, 
  LucideThumbsUp,
  LucideStar,
  LucideLoader2,
  LucideBookOpen
} from '@lucide/angular';

@Component({
  selector: 'app-classroom',
  imports: [
    RouterLink, 
    ReactiveFormsModule,
    MarkdownPipe,
    ShareModalComponent,
    LucidePlay, 
    LucideCheck, 
    LucideLock, 
    LucideChevronLeft, 
    LucideChevronRight, 
    LucideShare2, 
    LucideFileText, 
    LucideClock, 
    LucideDownload, 
    LucideList, 
    LucideMessageSquare, 
    LucideSend, 
    LucideThumbsUp, 
    LucideStar, 
    LucideLoader2, 
    LucideBookOpen
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './classroom.html'
})
export class ClassroomComponent implements OnInit, OnDestroy {
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly activeTab = signal<'temario' | 'discussion' | 'reviews'>('discussion');
  protected readonly commentControl = new FormControl('');
  private routeSub?: Subscription;

  // Estado del Modal de Compartir
  protected readonly isShareModalOpen = signal<boolean>(false);

  // Estados de Carga Asíncrona (UX)
  protected readonly isTogglingLesson = signal<boolean>(false);
  protected readonly isSubmittingComment = signal<boolean>(false);

  // Estado de Reseñas en el Aula
  protected readonly reviews = signal<CourseReview[]>([]);
  protected readonly selectedRating = signal<number>(0);
  protected readonly hoverRating = signal<number>(0);
  protected readonly reviewComment = new FormControl('');
  protected readonly isSubmittingReview = signal(false);
  protected readonly reviewSuccess = signal(false);

  setRating(star: number): void {
    this.selectedRating.set(star);
  }

  protected readonly myReview = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return null;
    return this.reviews().find(r => r.userId === user.id) || null;
  });

  protected readonly currentCourse = computed(() => {
    const activePath = this.courseService.activePath();
    if (!activePath) return null;
    return this.courseService.coursesCatalog().find(c => c.learningPathId === activePath.id) || null;
  });

  protected readonly currentModule = computed(() => {
    const activeLesson = this.courseService.activeLesson();
    const path = this.courseService.activePath();
    if (!path || !activeLesson) return null;
    return path.days.find(d => d.lessons.some(l => l.id === activeLesson.id)) || path.days[0] || null;
  });

  protected readonly currentModuleTitle = computed(() => {
    const mod = this.currentModule();
    if (!mod) return 'Módulo 1';
    return this.formatModuleTitle(mod);
  });

  formatModuleTitle(day: { dayNumber: number; title: string } | null | undefined): string {
    if (!day) return '';
    const title = (day.title || '').trim();
    if (/^m[oó]dulo/i.test(title)) {
      return title;
    }
    return `Módulo ${day.dayNumber}: ${title}`;
  }

  protected readonly isBlocked = computed(() => {
    const user = this.authService.currentUser();
    if (!user || user.role !== 'STUDENT') return false;
    const activePath = this.courseService.activePath();
    if (!activePath) return false;
    const enrollment = this.courseService.myEnrollments().find(e => e.pathId === activePath.id);
    return enrollment?.status === 'blocked';
  });

  constructor() {
    // 1. Cargar reseñas del curso en tiempo real
    effect(() => {
      const course = this.currentCourse();
      const user = this.authService.currentUser();
      if (course) {
        const q = query(collection(db, 'courses', course.id, 'reviews'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CourseReview));
          this.reviews.set(list);

          // Si el usuario ya tenía una reseña y no ha seleccionado manualmente otra, precargar
          if (user) {
            const existing = list.find(r => r.userId === user.id);
            if (existing && this.selectedRating() === 0) {
              this.selectedRating.set(existing.rating);
              if (!this.reviewComment.dirty) {
                this.reviewComment.setValue(existing.comment);
              }
            }
          }
        });
        return () => unsub();
      } else {
        this.reviews.set([]);
        this.selectedRating.set(0);
        return;
      }
    });

    // 2. Sincronizar lección activa tan pronto como los módulos de la ruta se carguen
    effect(() => {
      const path = this.courseService.activePath();
      const currentLessonId = this.courseService.activeLessonId();
      const lessonParam = this.route.snapshot.paramMap.get('lessonId');

      if (path && path.days && path.days.length > 0) {
        const allLessons = path.days.flatMap(d => d.lessons);
        if (allLessons.length > 0) {
          // Buscar lección por ID actual o por el slug que viene en la URL
          let targetLesson = allLessons.find(l => l.id === currentLessonId);
          if (!targetLesson && lessonParam) {
            targetLesson = allLessons.find(l => matchSlug(l.title, lessonParam) || l.id === lessonParam);
          }

          if (!targetLesson) {
            targetLesson = allLessons[0];
          }

          if (targetLesson.id !== currentLessonId) {
            this.courseService.selectLesson(targetLesson.id);
          }

          const parentModule = path.days.find(d => d.lessons.some(l => l.id === targetLesson.id)) || path.days[0];

          const courseSlug = this.courseService.getPathSlug(path.id);
          const moduleSlug = this.courseService.getModuleSlug(parentModule);
          const lessonSlug = this.courseService.getLessonSlug(targetLesson);

          if (courseSlug && moduleSlug && lessonSlug) {
            const currentUrl = decodeURIComponent(this.router.url);
            const targetSuffix = `/classroom/${courseSlug}/${moduleSlug}/${lessonSlug}`;
            if (!currentUrl.includes(targetSuffix)) {
              this.router.navigate(['/classroom', courseSlug, moduleSlug, lessonSlug], { replaceUrl: true });
            }
          }
        }
      }
    });
  }

  async submitReview(): Promise<void> {
    const course = this.currentCourse();
    const comment = this.reviewComment.value;
    const rating = this.selectedRating();
    if (!course || !comment || !comment.trim() || rating === 0) return;

    this.isSubmittingReview.set(true);
    try {
      await this.courseService.addCourseReview(course.id, rating, comment.trim());
      this.reviewSuccess.set(true);
      setTimeout(() => this.reviewSuccess.set(false), 3000);
    } catch (err) {
      console.error('Error enviando reseña desde aula:', err);
    } finally {
      this.isSubmittingReview.set(false);
    }
  }

  ngOnInit(): void {
    // Escuchar parámetros de ruta dinámica (/classroom/:pathId/:moduleId/:lessonId o /classroom/:pathId/:lessonId o /classroom/:pathId)
    this.routeSub = this.route.paramMap.subscribe(params => {
      const pathParam = params.get('pathId');
      const moduleParam = params.get('moduleId');
      const lessonParam = params.get('lessonId');

      if (pathParam) {
        const resolvedPathId = this.courseService.resolvePathId(pathParam);
        if (resolvedPathId && resolvedPathId !== this.courseService.activePathId()) {
          this.courseService.selectPath(resolvedPathId);
        }
      }

      // El identificador de lección puede venir en lessonId (3 niveles) o en moduleId (2 niveles)
      const rawLesson = lessonParam || moduleParam;
      if (rawLesson) {
        const path = this.courseService.activePath();
        const resolvedLessonId = this.courseService.resolveLessonId(path, rawLesson);
        if (resolvedLessonId && resolvedLessonId !== this.courseService.activeLessonId()) {
          this.courseService.selectLesson(resolvedLessonId);
        } else if (!resolvedLessonId) {
          this.courseService.selectLesson(rawLesson);
        }
      }
    });

    // Escuchar cambios en queryParams (?pathId=...)
    this.route.queryParamMap.subscribe(qParams => {
      const pathId = qParams.get('pathId');
      if (pathId) {
        const resolved = this.courseService.resolvePathId(pathId);
        if (resolved && resolved !== this.courseService.activePathId()) {
          this.courseService.selectPath(resolved);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  selectLesson(lessonId: string): void {
    const path = this.courseService.activePath();
    const courseSlug = this.courseService.getPathSlug(path?.id) || 'curso';
    const parentModule = path?.days?.find(d => d.lessons.some(l => l.id === lessonId)) || path?.days?.[0];
    const moduleSlug = this.courseService.getModuleSlug(parentModule);
    const allLessons = path?.days?.flatMap(d => d.lessons) || [];
    const targetLesson = allLessons.find(l => l.id === lessonId);
    const lessonSlug = targetLesson ? this.courseService.getLessonSlug(targetLesson) : lessonId;

    this.courseService.selectLesson(lessonId);
    this.router.navigate(['/classroom', courseSlug, moduleSlug, lessonSlug]);
  }

  async submitComment(): Promise<void> {
    const val = this.commentControl.value;
    const lesson = this.courseService.activeLesson();
    const user = this.authService.currentUser();
    if (!val || !val.trim() || !lesson || !user || this.isSubmittingComment()) return;

    this.isSubmittingComment.set(true);
    try {
      await this.courseService.addComment(
        lesson.id,
        val.trim(),
        user.name,
        user.avatar
      );
      this.commentControl.reset();
    } catch (err) {
      console.error('Error enviando comentario:', err);
    } finally {
      this.isSubmittingComment.set(false);
    }
  }

  previousLesson(): void {
    const currentPath = this.courseService.activePath();
    const currentLessonId = this.courseService.activeLessonId();
    if (!currentPath || !currentLessonId) return;

    const allLessons = currentPath.days.flatMap(d => d.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      if (!prevLesson.isLocked) {
        this.selectLesson(prevLesson.id);
      }
    }
  }

  nextLesson(): void {
    const currentPath = this.courseService.activePath();
    const currentLessonId = this.courseService.activeLessonId();
    if (!currentPath || !currentLessonId) return;

    const allLessons = currentPath.days.flatMap(d => d.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (!nextLesson.isLocked) {
        this.selectLesson(nextLesson.id);
      }
    }
  }

  async toggleCurrentLesson(): Promise<void> {
    const activeLesson = this.courseService.activeLesson();
    if (!activeLesson || this.isTogglingLesson()) return;

    this.isTogglingLesson.set(true);
    try {
      await this.courseService.toggleLessonCompletion(activeLesson.id);
    } catch (err) {
      console.error('Error actualizando estado de lección:', err);
    } finally {
      this.isTogglingLesson.set(false);
    }
  }

  isYouTubeOrVimeo(url?: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  }

  getEmbedUrl(url?: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');

    // YouTube Parser
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || '';
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0] || '';
      }
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  protected readonly shareUrl = computed(() => {
    const c = this.currentCourse();
    if (c) {
      return `${window.location.origin}/catalog/${c.id}`;
    }
    return window.location.href;
  });

  openShareModal(): void {
    this.isShareModalOpen.set(true);
  }

  closeShareModal(): void {
    this.isShareModalOpen.set(false);
  }

  downloadResource(resourceUrl?: string, resName?: string): void {
    if (resourceUrl) {
      window.open(resourceUrl, '_blank');
    } else {
      alert(`El recurso ${resName || 'adjunto'} no tiene un archivo vinculado todavía.`);
    }
  }
}
