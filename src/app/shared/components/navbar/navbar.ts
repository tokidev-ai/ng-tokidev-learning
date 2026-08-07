import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'sticky top-0 z-50 block w-full bg-[#0B0A17]/95 backdrop-blur-md border-b border-white/10 shadow-lg'
  },
  template: `
    <header class="w-full px-4 lg:px-8 py-3.5">
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

        <!-- Center: Centered Clean Navigation Bar based on Role (Platzi/Udemy style) -->
        <nav class="hidden md:flex items-center gap-4 bg-slate-900/90 px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          
          <!-- Unauthenticated Nav Links -->
          @if (!authService.isLoggedIn()) {
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

            <a routerLink="/mentorships" 
               routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
               class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
              Mentorías
            </a>
          }

          <!-- Student Nav Links (Authenticated) -->
          @if (authService.isLoggedIn() && authService.isStudent()) {
            <a routerLink="/student/dashboard" 
               routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
               class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
              Mis Cursos
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
          }

          <!-- Instructor Nav Links -->
          @if (authService.isInstructor()) {
            <a routerLink="/instructor" 
               routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
               [routerLinkActiveOptions]="{exact: true}"
               class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
              Mis Cursos Creados
            </a>

            <a routerLink="/instructor/create-course" 
               routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
               class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
              Crear Curso
            </a>
          }

          <!-- Admin Nav Links -->
          @if (authService.isAdmin()) {
            <a routerLink="/admin/courses" 
               routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
               class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
              Cursos
            </a>
            
            <a routerLink="/admin/users" 
               routerLinkActive="bg-white/10 text-white font-bold shadow-sm"
               class="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all">
              Usuarios
            </a>
          }
        </nav>

        <!-- Right: Clean User Profile Avatar or Login CTA -->
        <div class="flex items-center gap-3">
          @if (authService.isLoggedIn() && authService.currentUser(); as user) {
            <a [routerLink]="authService.isStudent() ? '/student/dashboard' : authService.isInstructor() ? '/instructor' : '/admin'" class="flex items-center gap-3 group">
              <div class="relative">
                <img [src]="user.avatar" 
                     [alt]="user.name"
                     class="w-9 h-9 rounded-full object-cover border border-white/20 group-hover:border-[#A406E9] transition-colors" />
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0B0A17]"></span>
              </div>
              
              <div class="hidden lg:flex flex-col text-left">
                <span class="text-xs font-bold text-slate-100 group-hover:text-white transition-colors leading-tight">
                  {{ user.name }}
                </span>
                <span class="text-[10px] text-slate-400 font-medium">
                  @switch (user.role) {
                    @case ('ADMIN') { Administrador }
                    @case ('INSTRUCTOR') { Profesor TokiDev }
                    @default { Estudiante PRO }
                  }
                </span>
              </div>
            </a>

            <button 
              type="button" 
              (click)="authService.logout()"
              class="ml-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/40 text-[10px] font-bold text-slate-400 hover:text-rose-400 transition-all cursor-pointer">
              Salir <i class="fa-solid fa-right-from-bracket ml-0.5"></i>
            </button>
          } @else {
            <a routerLink="/login" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold text-white cursor-pointer hover:opacity-95 transition-all shadow-md">
              Ingresar
            </a>
          }
        </div>

      </div>
    </header>
  `
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);
}
