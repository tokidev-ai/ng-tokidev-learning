import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { UserRole, UserProfile } from '../../core/models/user.model';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-[#A406E9]/20 text-[#A406E9] text-xs font-extrabold uppercase rounded-full border border-[#A406E9]/30">
              Panel de Control de Superadmin
            </span>
          </div>
          <h1 class="text-3xl md:text-4xl font-black text-white">Administración General</h1>
          <p class="text-xs text-slate-400">Gestiona usuarios, roles de profesores, moderación de comentarios y contenido del catálogo.</p>
        </div>

        <!-- Admin Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] font-extrabold uppercase text-slate-400">Usuarios Totales</span>
            <div class="text-3xl font-black text-white">{{ authService.users().length }}</div>
            <span class="text-[10px] text-slate-500 font-mono">Estudiantes, profesores y admins</span>
          </div>

          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] font-extrabold uppercase text-slate-400">Cursos Publicados</span>
            <div class="text-3xl font-black text-[#DA2984]">{{ courseService.coursesCatalog().length }}</div>
            <span class="text-[10px] text-slate-500 font-mono">En catálogo activo</span>
          </div>

          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] font-extrabold uppercase text-slate-400">Comentarios Activos</span>
            <div class="text-3xl font-black text-[#FA743F]">{{ courseService.commentsStore().length }}</div>
            <span class="text-[10px] text-emerald-400 font-mono">Moderación activa habilitada</span>
          </div>

          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] font-extrabold uppercase text-slate-400">Ingresos Totales</span>
            <div class="text-3xl font-black text-emerald-400">\${{ estimatedPlatformEarnings() }}</div>
            <span class="text-[10px] text-slate-500 font-mono">USD Brutos simulados</span>
          </div>
        </div>

        <!-- Main Tab Control -->
        <div class="glass-card rounded-3xl p-6 space-y-6">
          <div class="flex items-center border-b border-white/10 pb-2 gap-6 overflow-x-auto scrollbar-none">
            <button 
              type="button"
              (click)="activeTab.set('users')"
              [class.text-white]="activeTab() === 'users'"
              [class.border-b-2]="activeTab() === 'users'"
              [class.border-[#A406E9]]="activeTab() === 'users'"
              class="pb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400 hover:text-white transition-all flex items-center gap-2 cursor-pointer shrink-0">
              <i class="fa-solid fa-users"></i> Gestión de Usuarios
            </button>

            <button 
              type="button"
              (click)="activeTab.set('comments')"
              [class.text-white]="activeTab() === 'comments'"
              [class.border-b-2]="activeTab() === 'comments'"
              [class.border-[#A406E9]]="activeTab() === 'comments'"
              class="pb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400 hover:text-white transition-all flex items-center gap-2 cursor-pointer shrink-0">
              <i class="fa-regular fa-comments"></i> Moderación de Q&A
            </button>

            <button 
              type="button"
              (click)="activeTab.set('courses')"
              [class.text-white]="activeTab() === 'courses'"
              [class.border-b-2]="activeTab() === 'courses'"
              [class.border-[#A406E9]]="activeTab() === 'courses'"
              class="pb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400 hover:text-white transition-all flex items-center gap-2 cursor-pointer shrink-0">
              <i class="fa-solid fa-graduation-cap"></i> Cursos del Catálogo
            </button>
          </div>

          <!-- TAB 1: USERS MANAGEMENT -->
          @if (activeTab() === 'users') {
            <div class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 class="text-base font-bold text-white uppercase tracking-wider">Lista de Usuarios del Sistema</h3>
                
                <!-- Quick Role Filter -->
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-400">Filtrar por:</span>
                  <select 
                    [formControl]="roleFilterControl"
                    class="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white">
                    <option value="ALL">Todos</option>
                    <option value="ADMIN">Superadmin</option>
                    <option value="INSTRUCTOR">Profesor</option>
                    <option value="STUDENT">Estudiante</option>
                  </select>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-white/10 text-slate-400 font-extrabold uppercase">
                      <th class="py-3 px-4">Usuario</th>
                      <th class="py-3 px-4">Email</th>
                      <th class="py-3 px-4">Rol Actual</th>
                      <th class="py-3 px-4 text-right">Acción de Permisos</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (user of filteredUsers(); track user.id) {
                      <tr class="border-b border-white/5 hover:bg-slate-900/40 transition-colors">
                        <td class="py-3.5 px-4 flex items-center gap-3">
                          <img [src]="user.avatar" [alt]="user.name" class="w-8 h-8 rounded-full object-cover border border-white/10" />
                          <div>
                            <span class="font-bold text-white block">{{ user.name }}</span>
                            <span class="text-[10px] text-slate-500">Streak: {{ user.streakDays }} días</span>
                          </div>
                        </td>
                        <td class="py-3.5 px-4 text-slate-300">{{ user.email }}</td>
                        <td class="py-3.5 px-4">
                          @if (user.role === 'ADMIN') {
                            <span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">Superadmin</span>
                          } @else if (user.role === 'INSTRUCTOR') {
                            <span class="px-2 py-0.5 rounded bg-[#FA743F]/20 text-[#FA743F] font-bold border border-[#FA743F]/30">Profesor</span>
                          } @else {
                            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">Estudiante</span>
                          }
                        </td>
                        <td class="py-3.5 px-4 text-right space-x-1.5">
                          @if (user.id !== authService.currentUser().id) {
                            @if (user.role !== 'INSTRUCTOR') {
                              <button 
                                type="button"
                                (click)="changeRole(user.id, 'INSTRUCTOR')"
                                class="px-3 py-1 bg-[#FA743F]/20 hover:bg-[#FA743F]/30 border border-[#FA743F]/40 text-[#FA743F] rounded-lg font-bold transition-all cursor-pointer">
                                Ascender a Profesor
                              </button>
                            } @else {
                              <button 
                                type="button"
                                (click)="changeRole(user.id, 'STUDENT')"
                                class="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-lg font-bold transition-all cursor-pointer">
                                Degradada a Estudiante
                              </button>
                            }
                            @if (user.role !== 'ADMIN') {
                              <button 
                                type="button"
                                (click)="changeRole(user.id, 'ADMIN')"
                                class="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 rounded-lg font-bold transition-all cursor-pointer">
                                Hacer Admin
                              </button>
                            }
                          } @else {
                            <span class="text-[10px] text-slate-500 italic">Eres tú mismo</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- TAB 2: QA COMMENTS MODERATION -->
          @if (activeTab() === 'comments') {
            <div class="space-y-4">
              <h3 class="text-base font-bold text-white uppercase tracking-wider">Moderación de Preguntas & Discusiones</h3>
              <p class="text-xs text-slate-400">Moderación manual del foro escolar. Elimina comentarios ofensivos o inapropiados.</p>

              <div class="space-y-4">
                @for (comment of courseService.commentsStore(); track comment.id) {
                  <div class="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-start justify-between gap-4">
                    <div class="flex items-start gap-3">
                      <img [src]="comment.authorAvatar" [alt]="comment.authorName" class="w-9 h-9 rounded-full object-cover" />
                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-xs text-white">{{ comment.authorName }}</span>
                          <span class="text-[10px] text-slate-500">{{ comment.timeAgo }}</span>
                        </div>
                        <p class="text-xs text-slate-300">{{ comment.content }}</p>
                        <span class="text-[9px] text-[#A406E9] font-mono block">ID Clase: {{ comment.lessonId }}</span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      (click)="deleteComment(comment.id)"
                      class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-[10px] transition-colors cursor-pointer">
                      <i class="fa-solid fa-trash-can mr-1"></i> Eliminar
                    </button>
                  </div>
                } @empty {
                  <div class="text-center p-8 text-slate-500 text-xs">No hay comentarios en el sistema.</div>
                }
              </div>
            </div>
          }

          <!-- TAB 3: COURSES CATALOG -->
          @if (activeTab() === 'courses') {
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 class="text-base font-bold text-white uppercase tracking-wider">Cursos en el Catálogo</h3>
                <span class="text-xs text-slate-400 font-mono">{{ courseService.coursesCatalog().length }} cursos</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (course of courseService.coursesCatalog(); track course.id) {
                  <div class="p-4 bg-slate-900/80 border border-white/10 rounded-2xl flex gap-4 items-center">
                    <img [src]="course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'" 
                         [alt]="course.title" 
                         class="w-16 h-12 object-cover rounded-xl border border-white/10" />
                    <div class="flex-1 space-y-1">
                      <h4 class="font-bold text-xs text-white">{{ course.title }}</h4>
                      <div class="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Docente: {{ course.instructorName }}</span>
                        <span>•</span>
                        <span class="text-emerald-400 font-bold">\${{ course.price }} USD</span>
                      </div>
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
export class AdminDashboardComponent {
  protected readonly authService = inject(AuthService);
  protected readonly courseService = inject(CourseService);
  private readonly fb = inject(FormBuilder);

  protected readonly activeTab = signal<'users' | 'comments' | 'courses'>('users');
  protected readonly roleFilterControl = this.fb.control('ALL');

  protected readonly estimatedPlatformEarnings = computed(() => {
    const total = this.courseService.coursesCatalog().reduce((sum, c) => sum + (c.studentsCount * c.price), 0);
    return Math.round(total).toLocaleString();
  });

  protected readonly filteredUsers = computed(() => {
    const filter = this.roleFilterControl.value || 'ALL';
    const users = this.authService.users();
    if (filter === 'ALL') return users;
    return users.filter(u => u.role === filter);
  });

  changeRole(userId: string, role: string): void {
    this.authService.updateUserRole(userId, role as UserRole);
  }

  deleteComment(commentId: string): void {
    // Delete comment locally
    this.courseService.commentsStore.update(comments => {
      return comments.filter(c => c.id !== commentId);
    });
  }
}
