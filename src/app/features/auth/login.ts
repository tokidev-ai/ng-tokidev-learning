import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { 
  LucideMail, 
  LucideLock, 
  LucideUser, 
  LucideArrowRight, 
  LucideSparkles, 
  LucideArrowLeft
} from '@lucide/angular';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule, 
    RouterLink,
    LucideMail,
    LucideLock,
    LucideUser,
    LucideArrowRight,
    LucideSparkles,
    LucideArrowLeft
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 grid grid-cols-1 lg:grid-cols-12 overflow-hidden select-none">
      
      <!-- LEFT SIDE: Modern Tech Graphic Banner (Image generated / high-tech visual) -->
      <div class="hidden lg:flex lg:col-span-7 relative bg-[#0F0D24] p-12 flex-col justify-between overflow-hidden border-r border-white/10">
        
        <!-- Glowing Light Effects -->
        <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#A406E9]/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div class="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#DA2984]/20 rounded-full blur-[120px] pointer-events-none"></div>

        <!-- Top Left Brand Link -->
        <a routerLink="/" class="inline-flex items-center gap-3 relative z-10 group">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A406E9] to-[#DA2984] flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:scale-105 transition-transform">
            &lt;/&gt;
          </div>
          <span class="font-extrabold text-xl tracking-tight text-white">
            TokiDev<span class="text-[#DA2984]"> Learning</span>
          </span>
        </a>

        <!-- Center Image Display Box -->
        <div class="relative z-10 my-auto max-w-xl mx-auto space-y-6">
          <div class="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#161435] group">
            <img 
              src="/images/auth-banner.jpg" 
              alt="TokiDev Platform"
              class="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0F0D24] via-transparent to-transparent"></div>
          </div>

          <!-- Quote Card Overlay -->
          <div class="glass-card p-6 rounded-2xl border border-white/15 space-y-2 backdrop-blur-xl shadow-2xl">
            <div class="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
              <span>★★★★★</span>
              <span class="text-slate-300">4.9 / 5.0 por más de 10,000+ estudiantes</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed font-medium">
              "Domina la arquitectura web moderna, Angular, Node.js e Inteligencia Artificial con proyectos reales y una comunidad de élite."
            </p>
          </div>
        </div>

        <!-- Footer Note -->
        <div class="relative z-10 text-[11px] text-slate-500 font-mono">
          © 2026 TokiDev Learning Inc. Todos los derechos reservados.
        </div>

      </div>

      <!-- RIGHT SIDE: Auth Form Container (Login & Register) -->
      <div class="col-span-1 lg:col-span-5 p-6 md:p-12 flex flex-col justify-between relative bg-[#0B0A17]">
        
        <!-- Top Row Back Link (for mobile & desktop) -->
        <div class="flex items-center justify-between pb-6">
          <a routerLink="/" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <svg lucideArrowLeft class="w-4 h-4"></svg>
            <span>Volver a Inicio</span>
          </a>

          <div class="lg:hidden flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-[#A406E9] flex items-center justify-center text-white text-xs font-bold">&lt;/&gt;</div>
            <span class="font-bold text-sm text-white">TokiDev</span>
          </div>
        </div>

        <!-- Form Card Center -->
        <div class="w-full max-w-md mx-auto my-auto space-y-8">
          
          <div class="space-y-2">
            <h1 class="text-3xl font-extrabold text-white tracking-tight">
              {{ activeTab() === 'login' ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta gratis' }}
            </h1>
            <p class="text-xs text-slate-400 font-medium">
              {{ activeTab() === 'login' ? 'Ingresa tus credenciales para acceder a tus cursos y rutas.' : 'Únete a la comunidad de desarrolladores de TokiDev Learning.' }}
            </p>
          </div>

          <!-- Tab Selector -->
          <div class="flex items-center bg-[#161435] p-1 rounded-xl border border-white/10">
            <button 
              type="button"
              (click)="toggleTab('login')"
              [class.bg-[#A406E9]]="activeTab() === 'login'"
              [class.text-white]="activeTab() === 'login'"
              [class.font-bold]="activeTab() === 'login'"
              [class.text-slate-400]="activeTab() !== 'login'"
              class="flex-1 py-2.5 text-center rounded-lg text-xs transition-all cursor-pointer">
              Iniciar Sesión
            </button>
            <button 
              type="button"
              (click)="toggleTab('register')"
              [class.bg-[#A406E9]]="activeTab() === 'register'"
              [class.text-white]="activeTab() === 'register'"
              [class.font-bold]="activeTab() === 'register'"
              [class.text-slate-400]="activeTab() !== 'register'"
              class="flex-1 py-2.5 text-center rounded-lg text-xs transition-all cursor-pointer">
              Registrarse
            </button>
          </div>

          <!-- LOGIN FORM -->
          @if (activeTab() === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="space-y-4">
              
              <div class="space-y-1.5">
                <label class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Correo Electrónico</label>
                <div class="relative">
                  <svg lucideMail class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"></svg>
                  <input 
                    type="email" 
                    formControlName="email"
                    placeholder="tu-correo@ejemplo.com" 
                    class="w-full bg-[#161435] border border-white/10 focus:border-[#A406E9] outline-none pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 transition-colors" />
                </div>
                @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
                  <span class="text-[10px] text-rose-400 font-bold block">Introduce un correo electrónico válido.</span>
                }
              </div>

              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Contraseña</label>
                  <a href="#" class="text-[11px] text-[#DA2984] hover:underline font-semibold">¿Olvidaste tu contraseña?</a>
                </div>
                <div class="relative">
                  <svg lucideLock class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"></svg>
                  <input 
                    type="password" 
                    formControlName="password"
                    placeholder="••••••••" 
                    class="w-full bg-[#161435] border border-white/10 focus:border-[#A406E9] outline-none pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 transition-colors" />
                </div>
                @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
                  <span class="text-[10px] text-rose-400 font-bold block">La contraseña es requerida.</span>
                }
              </div>

              @if (errorMessage()) {
                <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
                  {{ errorMessage() }}
                </div>
              }

              <button 
                type="submit"
                [disabled]="loginForm.invalid || loading()"
                class="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#A406E9] via-[#DA2984] to-[#FA743F] text-xs font-extrabold tracking-wider uppercase text-white shadow-lg shadow-[#A406E9]/25 cursor-pointer disabled:opacity-40 transition-all hover:opacity-95 flex items-center justify-center gap-2">
                <span>{{ loading() ? 'Ingresando...' : 'Iniciar Sesión' }}</span>
                <svg lucideArrowRight class="w-4 h-4"></svg>
              </button>
            </form>
          }

          <!-- REGISTER FORM -->
          @if (activeTab() === 'register') {
            <form [formGroup]="registerForm" (ngSubmit)="submitRegister()" class="space-y-4">
              
              <div class="space-y-1.5">
                <label class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Nombre Completo</label>
                <div class="relative">
                  <svg lucideUser class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"></svg>
                  <input 
                    type="text" 
                    formControlName="name"
                    placeholder="Juan Pérez" 
                    class="w-full bg-[#161435] border border-white/10 focus:border-[#A406E9] outline-none pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 transition-colors" />
                </div>
                @if (registerForm.get('name')?.touched && registerForm.get('name')?.invalid) {
                  <span class="text-[10px] text-rose-400 font-bold block">El nombre completo es requerido.</span>
                }
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Correo Electrónico</label>
                <div class="relative">
                  <svg lucideMail class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"></svg>
                  <input 
                    type="email" 
                    formControlName="email"
                    placeholder="tu-correo@ejemplo.com" 
                    class="w-full bg-[#161435] border border-white/10 focus:border-[#A406E9] outline-none pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 transition-colors" />
                </div>
                @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
                  <span class="text-[10px] text-rose-400 font-bold block">Introduce un correo válido.</span>
                }
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Contraseña (mín. 6 caracteres)</label>
                <div class="relative">
                  <svg lucideLock class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"></svg>
                  <input 
                    type="password" 
                    formControlName="password"
                    placeholder="••••••••" 
                    class="w-full bg-[#161435] border border-white/10 focus:border-[#A406E9] outline-none pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 transition-colors" />
                </div>
                @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
                  <span class="text-[10px] text-rose-400 font-bold block">La contraseña debe tener al menos 6 caracteres.</span>
                }
              </div>

              @if (errorMessage()) {
                <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
                  {{ errorMessage() }}
                </div>
              }

              <button 
                type="submit"
                [disabled]="registerForm.invalid || loading()"
                class="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#A406E9] via-[#DA2984] to-[#FA743F] text-xs font-extrabold tracking-wider uppercase text-white shadow-lg shadow-[#A406E9]/25 cursor-pointer disabled:opacity-40 transition-all hover:opacity-95 flex items-center justify-center gap-2">
                <span>{{ loading() ? 'Creando cuenta...' : 'Crear Cuenta' }}</span>
                <svg lucideSparkles class="w-4 h-4"></svg>
              </button>
            </form>
          }

        </div>

        <div></div>
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
        const user = await this.authService.login(email, password);
        this.redirectByRole(user.role);
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
        const user = await this.authService.register(email, password, name);
        this.redirectByRole(user.role);
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

  private redirectByRole(role: string | null): void {
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
