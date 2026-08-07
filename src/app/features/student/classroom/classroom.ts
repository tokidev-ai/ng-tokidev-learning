import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-classroom',
  imports: [RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-4">
      <div class="max-w-5xl mx-auto space-y-6">
        
        <!-- Header Navigation Bar -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a routerLink="/student/dashboard" 
               class="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-[#A406E9]/40 transition-all">
              <i class="fa-solid fa-chevron-left text-sm"></i>
            </a>
            <h1 class="text-xl md:text-2xl font-black text-white tracking-tight">
              {{ courseService.activeLesson()?.title || 'Cargando lección...' }}
            </h1>
          </div>

          <!-- Video Controls (Prev/Next/Share) -->
          <div class="flex items-center gap-2">
            <button 
              type="button"
              (click)="previousLesson()"
              class="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
              <i class="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button 
              type="button"
              (click)="nextLesson()"
              class="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
              <i class="fa-solid fa-chevron-right text-xs"></i>
            </button>
            <button 
              type="button"
              class="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
              <i class="fa-solid fa-share-nodes text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Video Player Frame -->
        <div class="relative rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl group">
          @if (courseService.activeLesson()?.videoUrl; as videoUrl) {
            <video 
              controls 
              autoplay
              class="w-full aspect-video object-cover"
              [src]="videoUrl">
            </video>
          } @else {
            <div class="aspect-video bg-gradient-to-br from-slate-900 to-indigo-950/60 p-8 flex flex-col justify-center items-center text-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-[#A406E9]/20 border border-[#A406E9] flex items-center justify-center text-[#A406E9] text-2xl">
                <i class="fa-solid fa-file-lines"></i>
              </div>
              <div class="space-y-1">
                <h3 class="text-xl font-bold text-white">{{ courseService.activeLesson()?.title }}</h3>
                <p class="text-xs text-slate-400 max-w-md">Esta lección es de formato lectura e interactiva. Revisa la guía en el área de temario a continuación.</p>
              </div>
            </div>
          }
        </div>

        <!-- Duration & Resources Tag -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-2">
            <i class="fa-regular fa-clock text-[#FA743F]"></i>
            {{ courseService.activeLesson()?.durationMinutes || 21 }} min de video
          </span>
          <span class="px-3 py-1 rounded-full bg-[#A406E9]/20 text-[#A406E9] border border-[#A406E9]/30 text-xs font-bold uppercase">
            {{ courseService.activeLesson()?.moduleCode }}
          </span>
          
          @if (courseService.activeLesson()?.resourceName; as resName) {
            <button 
              type="button"
              (click)="downloadResource(resName)"
              class="px-3.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-2 transition-all cursor-pointer">
              <i class="fa-solid fa-file-arrow-down"></i>
              Recurso: {{ resName }}
            </button>
          }
        </div>

        <!-- Main Tab Control (TEMARIO vs DISCUSIÓN) -->
        <div class="glass-card rounded-2xl p-4 md:p-6 space-y-6">
          <div class="flex items-center border-b border-white/10 pb-2 gap-8">
            <button 
              type="button"
              (click)="activeTab.set('temario')"
              [class.text-white]="activeTab() === 'temario'"
              [class.border-b-2]="activeTab() === 'temario'"
              [class.border-[#A406E9]]="activeTab() === 'temario'"
              class="pb-3 text-sm font-extrabold uppercase tracking-wider text-slate-400 hover:text-white transition-all flex items-center gap-2 cursor-pointer">
              <i class="fa-solid fa-list-ul"></i> TEMARIO
            </button>

            <button 
              type="button"
              (click)="activeTab.set('discussion')"
              [class.text-white]="activeTab() === 'discussion'"
              [class.border-b-2]="activeTab() === 'discussion'"
              [class.border-[#A406E9]]="activeTab() === 'discussion'"
              class="pb-3 text-sm font-extrabold uppercase tracking-wider text-slate-400 hover:text-white transition-all flex items-center gap-2 cursor-pointer">
              <i class="fa-regular fa-comments"></i> DISCUSIÓN 
              <span class="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                {{ courseService.activeLessonComments().length || 0 }}
              </span>
            </button>
          </div>

          <!-- TAB 1: TEMARIO -->
          @if (activeTab() === 'temario') {
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider">Lecciones de esta sección</h3>
              <div class="space-y-2">
                @for (day of courseService.activePath().days; track day.id) {
                  @for (lesson of day.lessons; track lesson.id) {
                    <button 
                      type="button"
                      (click)="selectLesson(lesson.id)"
                      [class.bg-[#A406E9]/20]="courseService.activeLessonId() === lesson.id"
                      [class.border-[#A406E9]]="courseService.activeLessonId() === lesson.id"
                      class="w-full text-left p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/20 flex items-center justify-between transition-colors cursor-pointer">
                      <div class="flex items-center gap-3">
                        <i [class]="lesson.isCompleted ? 'fa-solid fa-check text-emerald-400' : 'fa-solid fa-play text-slate-400'" class="text-xs"></i>
                        <span class="text-sm font-semibold text-slate-200">{{ lesson.title }}</span>
                      </div>
                      <span class="text-xs text-slate-400 font-mono">{{ lesson.durationMinutes }} min</span>
                    </button>
                  }
                }
              </div>
            </div>
          }

          <!-- TAB 2: DISCUSIÓN (Q&A Comments) -->
          @if (activeTab() === 'discussion') {
            <div class="space-y-6">
              <!-- Discussion Subheader -->
              <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>{{ courseService.activeLessonComments().length }} HILOS EN ESTE MÓDULO</span>
                <button type="button" class="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                  <i class="fa-solid fa-arrows-up-down text-xs"></i> Más recientes
                </button>
              </div>

              <!-- Comment Input Form (Lab10 Style) -->
              <div class="flex items-start gap-3 bg-slate-900/90 border border-white/10 p-3 rounded-2xl shadow-inner">
                <div class="w-10 h-10 rounded-full bg-[#A406E9] text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md">
                  YO
                </div>
                
                <div class="flex-1 space-y-3">
                  <textarea 
                    [formControl]="commentControl"
                    placeholder="Pregunta o comparte tu progreso..."
                    rows="2"
                    class="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none">
                  </textarea>
                  
                  <div class="flex justify-end">
                    <button 
                      type="button"
                      (click)="submitComment()"
                      [disabled]="!commentControl.value?.trim()"
                      class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#A406E9] to-[#DA2984] hover:opacity-90 disabled:opacity-40 text-white text-xs font-extrabold tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#A406E9]/30">
                      Publicar <i class="fa-solid fa-paper-plane text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Discussion Threads List -->
              <div class="space-y-6 pt-2">
                @for (thread of courseService.activeLessonComments(); track thread.id) {
                  <div class="space-y-4 border-b border-white/5 pb-6">
                    
                    <!-- Main Comment -->
                    <div class="flex items-start gap-3">
                      <img [src]="thread.authorAvatar" [alt]="thread.authorName" class="w-10 h-10 rounded-full object-cover border border-white/20" />
                      
                      <div class="space-y-1 flex-1">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-sm text-slate-100">{{ thread.authorName }}</span>
                          <span class="text-xs text-slate-400 font-medium">{{ thread.timeAgo }}</span>
                        </div>

                        <p class="text-sm text-slate-300 leading-relaxed font-normal">
                          {{ thread.content }}
                        </p>

                        <!-- Comment Actions -->
                        <div class="flex items-center gap-4 pt-1 text-xs">
                          <button 
                            type="button"
                            (click)="courseService.toggleLikeComment(thread.id)"
                            [class.text-[#A406E9]]="thread.isUserLiked"
                            class="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer">
                            <i class="fa-regular fa-thumbs-up"></i>
                            <span>{{ thread.likesCount }}</span>
                          </button>

                          <button 
                            type="button"
                            (click)="toggleReplyInput(thread.id)"
                            class="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer">
                            <i class="fa-solid fa-reply"></i>
                            <span>Responder</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Thread Replies -->
                    @if (thread.replies.length > 0) {
                      <div class="ml-12 pl-4 border-l-2 border-[#A406E9]/40 space-y-4 pt-2">
                        @for (reply of thread.replies; track reply.id) {
                          <div class="flex items-start gap-3">
                            <img [src]="reply.authorAvatar" [alt]="reply.authorName" class="w-8 h-8 rounded-full object-cover border border-[#DA2984]" />
                            <div class="space-y-1">
                              <div class="flex items-center gap-2">
                                <span class="font-bold text-xs text-slate-100">{{ reply.authorName }}</span>
                                <span class="px-2 py-0.5 rounded-full bg-[#DA2984]/20 text-[#DA2984] text-[10px] font-bold uppercase border border-[#DA2984]/30">
                                  {{ reply.authorRole }}
                                </span>
                                <span class="text-[11px] text-slate-400">{{ reply.timeAgo }}</span>
                              </div>
                              <p class="text-xs text-slate-300 leading-relaxed">
                                {{ reply.content }}
                              </p>
                            </div>
                          </div>
                        }
                      </div>
                    }

                    <!-- Inline Reply Input Box -->
                    @if (replyingToId() === thread.id) {
                      <div class="ml-12 flex items-center gap-2 pt-2">
                        <input 
                          [formControl]="replyControl"
                          placeholder="Escribe tu respuesta..."
                          class="flex-1 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-[#A406E9]" />
                        
                        <button 
                          type="button"
                          (click)="submitReply(thread.id)"
                          class="px-4 py-2 rounded-xl bg-[#A406E9] text-white text-xs font-bold cursor-pointer">
                          Enviar
                        </button>
                      </div>
                    }

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
export class ClassroomComponent implements OnInit, OnDestroy {
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly activeTab = signal<'temario' | 'discussion'>('discussion');
  protected readonly replyingToId = signal<string | null>(null);

  protected readonly commentControl = new FormControl('');
  protected readonly replyControl = new FormControl('');

  private routeSub?: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const lessonId = params.get('lessonId');
      if (lessonId) {
        // Set the active lesson in CourseService
        this.courseService.selectLesson(lessonId);
        
        // Find which learning path this lesson belongs to, and make sure that path is selected as active!
        const paths = this.courseService.learningPaths();
        for (const path of paths) {
          const hasLesson = path.days.some(d => d.lessons.some(l => l.id === lessonId));
          if (hasLesson) {
            this.courseService.selectPath(path.id);
            break;
          }
        }
      } else {
        // Fallback: If no lessonId in URL, redirect to the current active lessonId
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

  toggleReplyInput(commentId: string): void {
    this.replyingToId.update(curr => curr === commentId ? null : commentId);
  }

  submitReply(commentId: string): void {
    const val = this.replyControl.value;
    const user = this.authService.currentUser();
    if (val && val.trim() && user) {
      const comments = this.courseService.commentsStore();
      const target = comments.find(c => c.id === commentId);
      if (target) {
        target.replies.push({
          id: `rep_${Date.now()}`,
          authorName: user.name,
          authorAvatar: user.avatar,
          authorRole: this.authService.isInstructor() ? 'Profesor' : 'Estudiante',
          timeAgo: 'Justo ahora',
          content: val.trim(),
          likesCount: 0,
          isUserLiked: false
        });
      }
      this.replyControl.reset();
      this.replyingToId.set(null);
    }
  }

  previousLesson(): void {
    const currentPath = this.courseService.activePath();
    const currentLessonId = this.courseService.activeLessonId();
    if (!currentPath || !currentLessonId) return;

    // Get flat list of all lessons in this path
    const allLessons = currentPath.days.flatMap(d => d.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    
    // If there is a previous lesson that is not locked
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

    // Get flat list of all lessons in this path
    const allLessons = currentPath.days.flatMap(d => d.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    
    // If there is a next lesson that is not locked
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (!nextLesson.isLocked) {
        this.router.navigate(['/classroom', nextLesson.id]);
      }
    }
  }

  downloadResource(resName: string): void {
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute('download', resName);
    document.body.appendChild(link);
    alert(`Descargando archivo adjunto: ${resName}`);
  }
}
