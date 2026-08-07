import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-50 glass-nav px-4 lg:px-8 py-3.5 transition-all duration-300">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        
        <!-- Left: Brand Logo & Title -->
        <a routerLink="/" class="flex items-center gap-3 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A406E9] to-[#DA2984] flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform duration-300">
            &lt;/&gt;
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-lg tracking-tight text-white">
              TokiDev<span class="text-[#DA2984]">.learning</span>
            </span>
          </div>
        </a>

        <!-- Center: Centered Clean Navigation Bar -->
        <nav class="hidden md:flex items-center gap-1 bg-slate-900/90 px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <a routerLink="/" 
             routerLinkActive="bg-white/10 text-white font-bold shadow-sm" 
             [routerLinkActiveOptions]="{exact: true}"
             class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
            Inicio
          </a>

          <a routerLink="/catalog" 
             routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
             class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
            Explorar Cursos
          </a>

          <a routerLink="/resources" 
             routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
             class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
            Recursos
          </a>

          <a routerLink="/mentorships" 
             routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
             class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
            Mentorías
          </a>

          @if (authService.isStudent()) {
            <a routerLink="/student/dashboard" 
               routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
               class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
              Mis Cursos
            </a>

            <a routerLink="/classroom" 
               routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
               class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
              Aula Virtual
            </a>
          }

          @if (authService.isInstructor()) {
            <a routerLink="/instructor" 
               routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
               class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
              Panel Profesor
            </a>
          }

          @if (authService.isAdmin()) {
            <a routerLink="/admin" 
               routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
               class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
              Administración
            </a>
          }
        </nav>

        <!-- Right: Clean User Profile Avatar -->
        <div class="flex items-center gap-3">
          <!-- Quick Role Selector for testing -->
          <div class="flex items-center gap-1.5 mr-2">
            <span class="text-[9px] text-slate-500 font-bold uppercase">Rol Test:</span>
            <select 
              [value]="authService.currentRole()"
              (change)="setRole($event)"
              class="bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white">
              <option value="STUDENT">Estudiante</option>
              <option value="INSTRUCTOR">Profesor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <a [routerLink]="authService.isStudent() ? '/student/dashboard' : authService.isInstructor() ? '/instructor' : '/admin'" class="flex items-center gap-3 group">
            <div class="relative">
              <img [src]="authService.currentUser().avatar" 
                   [alt]="authService.currentUser().name"
                   class="w-9 h-9 rounded-full object-cover border border-white/20 group-hover:border-[#A406E9] transition-colors" />
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0B0A17]"></span>
            </div>
            
            <div class="hidden lg:flex flex-col text-left">
              <span class="text-xs font-bold text-slate-100 group-hover:text-white transition-colors leading-tight">
                {{ authService.currentUser().name }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium">
                @switch (authService.currentRole()) {
                  @case ('ADMIN') { Administrador }
                  @case ('INSTRUCTOR') { Profesor TokiDev }
                  @default { Estudiante PRO }
                }
              </span>
            </div>
          </a>
        </div>

      </div>
    </header>
  `
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);

  setRole(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.authService.setRole(select.value as any);
  }
}
