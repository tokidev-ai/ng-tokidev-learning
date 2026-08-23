import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
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
  LucideThumbsUp
} from '@lucide/angular';

@Component({
  selector: 'app-classroom',
  imports: [
    RouterLink, 
    ReactiveFormsModule,
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
    LucideThumbsUp
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

  protected readonly activeTab = signal<'temario' | 'discussion'>('discussion');
  protected readonly commentControl = new FormControl('');
  private routeSub?: Subscription;

  protected readonly isBlocked = computed(() => {
    const user = this.authService.currentUser();
    if (!user || user.role !== 'STUDENT') return false;
    const activePath = this.courseService.activePath();
    if (!activePath) return false;
    const enrollment = this.courseService.myEnrollments().find(e => e.pathId === activePath.id);
    return enrollment?.status === 'blocked';
  });

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const lessonId = params.get('lessonId');
      if (lessonId) {
        this.courseService.selectLesson(lessonId);
      } else {
        const activeLessonId = this.courseService.activeLessonId() || 'les_101';
        this.router.navigate(['/classroom', activeLessonId], { replaceUrl: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  selectLesson(lessonId: string): void {
    this.router.navigate(['/classroom', lessonId]);
  }

  submitComment(): void {
    const val = this.commentControl.value;
    const lesson = this.courseService.activeLesson();
    const user = this.authService.currentUser();
    if (val && val.trim() && lesson && user) {
      this.courseService.addComment(
        lesson.id,
        val.trim(),
        user.name,
        user.avatar
      );
      this.commentControl.reset();
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
        this.router.navigate(['/classroom', prevLesson.id]);
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
        this.router.navigate(['/classroom', nextLesson.id]);
      }
    }
  }

  async toggleCurrentLesson(): Promise<void> {
    const activeLesson = this.courseService.activeLesson();
    if (activeLesson) {
      await this.courseService.toggleLessonCompletion(activeLesson.id);
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

    // Vimeo Parser
    if (url.includes('vimeo.com')) {
      const parts = url.split('/');
      const videoId = parts[parts.length - 1]?.split('?')[0] || '';
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.vimeo.com/video/${videoId}?autoplay=1`);
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  downloadResource(resName: string): void {
    alert(`Descargando recurso: ${resName}`);
  }
}
