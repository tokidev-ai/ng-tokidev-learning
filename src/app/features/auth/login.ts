import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <!-- Glow decoration -->
      <div class="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#A406E9]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#DA2984]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Main Login Container -->
      <div class="max-w-md w-full space-y-8 relative z-10">
        
        <!-- Header Logo -->
        <div class="text-center space-y-3">
          <a routerLink="/" class="inline-flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A406E9] to-[#DA2984] flex items-center justify-center text-white font-black text-base shadow-lg group-hover:scale-105 transition-transform duration-300">
              &lt;/&gt;
            </div>
            <span class="font-bold text-xl tracking-tight text-white">
              TokiDev<span class="text-[#DA2984]">.learning</span>
            </span>
          </a>
          <h2 class="text-2xl font-black text-white pt-2">Ingresar a la Plataforma</h2>
          <p class="text-xs text-slate-400">Inicia sesión para continuar con tus cursos o gestionar la academia.</p>
        </div>

        <!-- Glassmorphism login card -->
        <div class="glass-card p-6 md:p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl">
          
          <!-- Tab selector (Mock login vs Quick demo login) -->
          <div class="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/5">
            <button 
              type="button"
              (click)="activeTab.set('quick')"
              [class.bg-white/10]="activeTab() === 'quick'"
              [class.text-white]="activeTab() === 'quick'"
              class="flex-1 py-2 text-center rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer">
              Perfiles de Prueba
            </button>
            <button 
              type="button"
              (click)="activeTab.set('form')"
              [class.bg-white/10]="activeTab() === 'form'"
              [class.text-white]="activeTab() === 'form'"
              class="flex-1 py-2 text-center rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer">
              Formulario de Acceso
            </button>
          </div>

          <!-- Quick Test Profile Tab -->
          @if (activeTab() === 'quick') {
            <div class="space-y-3">
              <span class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Selecciona un rol para ingresar directamente:</span>
              
              <div class="space-y-2">
                @for (user of authService.users(); track user.id) {
                  <!-- Filter to main demo users for clean login dashboard -->
                  @if (user.id === 'usr_1002' || user.id === 'usr_1004' || user.id === 'usr_admin') {
                    <button 
                      type="button"
                      (click)="loginAs(user.id)"
                      class="w-full p-3.5 bg-slate-900/50 hover:bg-[#A406E9]/10 border border-white/5 hover:border-[#A406E9]/40 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group">
                      <div class="flex items-center gap-3">
                        <img [src]="user.avatar" [alt]="user.name" class="w-8 h-8 rounded-full object-cover border border-white/20" />
                        <div>
                          <span class="font-bold text-xs text-white block group-hover:text-[#A406E9] transition-colors">{{ user.name }}</span>
                          <span class="text-[10px] text-slate-500">{{ user.email }}</span>
                        </div>
                      </div>

                      <div class="text-right">
                        @if (user.role === 'ADMIN') {
                          <span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-black border border-rose-500/30 uppercase">Superadmin</span>
                        } @else if (user.role === 'INSTRUCTOR') {
                          <span class="px-2 py-0.5 rounded bg-[#FA743F]/20 text-[#FA743F] text-[9px] font-black border border-[#FA743F]/30 uppercase">Profesor</span>
                        } @else {
                          <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-black border border-white/5 uppercase">Estudiante</span>
                        }
                      </div>
                    </button>
                  }
                }
              </div>
            </div>
          }

          <!-- Traditional Form Tab -->
          @if (activeTab() === 'form') {
            <form [formGroup]="loginForm" (ngSubmit)="submitForm()" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase text-slate-400">Correo Electrónico</label>
                <input 
                  type="email" 
                  formControlName="email"
                  placeholder="ejemplo@tokidev.io" 
                  class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
                  <span class="text-[10px] text-rose-500 font-bold block">Introduce un correo válido.</span>
                }
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase text-slate-400">Contraseña</label>
                <input 
                  type="password" 
                  formControlName="password"
                  placeholder="••••••••" 
                  class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
                  <span class="text-[10px] text-rose-500 font-bold block">La contraseña es requerida.</span>
                }
              </div>

              <!-- General Error Message -->
              @if (errorMessage()) {
                <span class="text-[10px] text-rose-500 font-bold block text-center">{{ errorMessage() }}</span>
              }

              <button 
                type="submit"
                [disabled]="loginForm.invalid"
                class="w-full py-3 rounded-xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold tracking-wider uppercase text-white shadow-lg shadow-[#DA2984]/30 cursor-pointer disabled:opacity-40 transition-all hover:opacity-95">
                Ingresar
              </button>
            </form>
          }

        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly activeTab = signal<'quick' | 'form'>('quick');
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loginAs(userId: string): void {
    const success = this.authService.login(userId);
    if (success) {
      this.redirectByRole();
    }
  }

  submitForm(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email?.toLowerCase().trim();
      
      // Match mock users by email
      const targetUser = this.authService.users().find(u => u.email.toLowerCase() === email);
      if (targetUser) {
        this.authService.login(targetUser.id);
        this.redirectByRole();
      } else {
        // Fallback to student role if user not found, simulating user creation or fallback login
        this.errorMessage.set('Usuario no registrado. Utiliza los perfiles de prueba rápidos.');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    }
  }

  private redirectByRole(): void {
    const role = this.authService.currentRole();
    if (role === 'STUDENT') {
      this.router.navigate(['/student/dashboard']);
    } else if (role === 'INSTRUCTOR') {
      this.router.navigate(['/instructor']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
