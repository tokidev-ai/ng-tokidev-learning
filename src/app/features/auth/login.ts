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

      <!-- Main Container -->
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
          <h2 class="text-2xl font-black text-white pt-2">
            {{ activeTab() === 'login' ? 'Ingresar a la Plataforma' : 'Crear nueva cuenta' }}
          </h2>
          <p class="text-xs text-slate-400">
            {{ activeTab() === 'login' ? 'Inicia sesión para continuar aprendiendo.' : 'Regístrate para comenzar a estudiar hoy mismo.' }}
          </p>
        </div>

        <!-- Glassmorphism card -->
        <div class="glass-card p-6 md:p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl">
          
          <!-- Tab selector (Login vs Register) -->
          <div class="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/5">
            <button 
              type="button"
              (click)="toggleTab('login')"
              [class.bg-white/10]="activeTab() === 'login'"
              [class.text-white]="activeTab() === 'login'"
              class="flex-1 py-2 text-center rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer">
              Iniciar Sesión
            </button>
            <button 
              type="button"
              (click)="toggleTab('register')"
              [class.bg-white/10]="activeTab() === 'register'"
              [class.text-white]="activeTab() === 'register'"
              class="flex-1 py-2 text-center rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer">
              Registrarse
            </button>
          </div>

          <!-- Login Form -->
          @if (activeTab() === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="space-y-4">
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

              @if (errorMessage()) {
                <span class="text-[10px] text-rose-500 font-bold block text-center">{{ errorMessage() }}</span>
              }

              <button 
                type="submit"
                [disabled]="loginForm.invalid || loading()"
                class="w-full py-3 rounded-xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold tracking-wider uppercase text-white shadow-lg shadow-[#DA2984]/30 cursor-pointer disabled:opacity-40 transition-all hover:opacity-95">
                {{ loading() ? 'Ingresando...' : 'Ingresar' }}
              </button>
            </form>
          }

          <!-- Register Form -->
          @if (activeTab() === 'register') {
            <form [formGroup]="registerForm" (ngSubmit)="submitRegister()" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase text-slate-400">Nombre Completo</label>
                <input 
                  type="text" 
                  formControlName="name"
                  placeholder="Juan Pérez" 
                  class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                @if (registerForm.get('name')?.touched && registerForm.get('name')?.invalid) {
                  <span class="text-[10px] text-rose-500 font-bold block">El nombre es requerido.</span>
                }
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase text-slate-400">Correo Electrónico</label>
                <input 
                  type="email" 
                  formControlName="email"
                  placeholder="ejemplo@tokidev.io" 
                  class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
                  <span class="text-[10px] text-rose-500 font-bold block">Introduce un correo válido.</span>
                }
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase text-slate-400">Contraseña (mínimo 6 caracteres)</label>
                <input 
                  type="password" 
                  formControlName="password"
                  placeholder="••••••••" 
                  class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
                  <span class="text-[10px] text-rose-500 font-bold block">La contraseña debe tener al menos 6 caracteres.</span>
                }
              </div>

              @if (errorMessage()) {
                <span class="text-[10px] text-rose-500 font-bold block text-center">{{ errorMessage() }}</span>
              }

              <button 
                type="submit"
                [disabled]="registerForm.invalid || loading()"
                class="w-full py-3 rounded-xl bg-gradient-to-r from-[#A406E9] to-[#DA2984] text-xs font-extrabold tracking-wider uppercase text-white shadow-lg shadow-[#A406E9]/30 cursor-pointer disabled:opacity-40 transition-all hover:opacity-95">
                {{ loading() ? 'Creando cuenta...' : 'Crear Cuenta' }}
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

  protected readonly activeTab = signal<'login' | 'register'>('login');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = signal<boolean>(false);

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  protected readonly registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
  }

  async submitLogin(): Promise<void> {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email?.toLowerCase().trim();
      const password = this.loginForm.value.password;
      if (!email || !password) return;

      this.loading.set(true);
      this.errorMessage.set(null);

      try {
        await this.authService.login(email, password);
        this.redirectByRole();
      } catch (err: any) {
        console.error(err);
        this.handleAuthError(err);
      } finally {
        this.loading.set(false);
      }
    }
  }

  async submitRegister(): Promise<void> {
    if (this.registerForm.valid) {
      const name = this.registerForm.value.name?.trim();
      const email = this.registerForm.value.email?.toLowerCase().trim();
      const password = this.registerForm.value.password;
      if (!name || !email || !password) return;

      this.loading.set(true);
      this.errorMessage.set(null);

      try {
        await this.authService.register(email, password, name);
        this.redirectByRole();
      } catch (err: any) {
        console.error(err);
        this.handleAuthError(err);
      } finally {
        this.loading.set(false);
      }
    }
  }

  private handleAuthError(err: any): void {
    if (err.code === 'auth/configuration-not-found') {
      this.errorMessage.set('⚠️ Error: Habilita "Correo y Contraseña" en la pestaña "Sign-in method" de Firebase Auth.');
    } else if (err.code === 'auth/email-already-in-use') {
      this.errorMessage.set('El correo ya está registrado en la plataforma.');
    } else if (err.code === 'auth/invalid-credential') {
      this.errorMessage.set('Credenciales incorrectas. Verifica tu correo o contraseña.');
    } else if (err.code === 'auth/weak-password') {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
    } else {
      this.errorMessage.set(err.message || 'Error de conexión.');
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
