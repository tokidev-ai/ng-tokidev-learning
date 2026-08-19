import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { 
  LucideMail, 
  LucideLock, 
  LucideUser, 
  LucideArrowRight, 
  LucideSparkles, 
  LucideArrowLeft,
  LucideEye,
  LucideEyeOff
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
    LucideArrowLeft,
    LucideEye,
    LucideEyeOff
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html'
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly activeTab = signal<'login' | 'register'>('login');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = signal<boolean>(false);

  // Password visibility signals
  protected readonly showLoginPassword = signal<boolean>(false);
  protected readonly showRegisterPassword = signal<boolean>(false);

  // Form definitions
  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected readonly registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required, 
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/) // Requires at least one letter and one number
    ]]
  });

  // Dynamic Password Strength Computed Signals
  protected readonly registerPasswordValue = signal<string>('');

  protected readonly hasMinLength = computed(() => {
    return (this.registerPasswordValue() || '').length >= 6;
  });

  protected readonly hasLettersAndNumbers = computed(() => {
    const val = this.registerPasswordValue() || '';
    return /[A-Za-z]/.test(val) && /\d/.test(val);
  });

  constructor() {
    this.registerForm.get('password')?.valueChanges.subscribe(val => {
      this.registerPasswordValue.set(val || '');
    });
  }

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
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
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
