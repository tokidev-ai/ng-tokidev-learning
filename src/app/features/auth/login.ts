import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/user.model';
import { 
  LucideMail, 
  LucideLock, 
  LucideUser, 
  LucideArrowRight, 
  LucideArrowLeft,
  LucideEye,
  LucideEyeOff,
  LucideLoader2,
  LucideCheckCircle2,
  LucideShieldCheck
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
    LucideArrowLeft,
    LucideEye,
    LucideEyeOff,
    LucideLoader2,
    LucideCheckCircle2,
    LucideShieldCheck
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html'
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly activeTab = signal<'login' | 'register'>('login');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly googleLoading = signal<boolean>(false);

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
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
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

  async submitGoogleLogin(): Promise<void> {
    this.googleLoading.set(true);
    this.errorMessage.set(null);

    try {
      const user = await this.authService.loginWithGoogle();
      this.redirectUser(user);
    } catch (err: any) {
      console.error('Error con Google Auth:', err);
      this.handleAuthError(err);
    } finally {
      this.googleLoading.set(false);
    }
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
        this.redirectUser(user);
      } catch (err: any) {
        console.error(err);
        this.handleAuthError(err);
      } finally {
        this.loading.set(false);
      }
    }
  }

  async submitRegister(): Promise<void> {
    const name = this.registerForm.value.name?.trim();
    const email = this.registerForm.value.email?.toLowerCase().trim();
    const password = this.registerForm.value.password;

    if (!name || !email || !password || !this.hasMinLength() || !this.hasLettersAndNumbers()) {
      this.errorMessage.set('Por favor completa tu nombre, correo y una contraseña segura (mínimo 6 caracteres con letras y números).');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const user = await this.authService.register(email, password, name);
      this.redirectUser(user);
    } catch (err: any) {
      console.error(err);
      this.handleAuthError(err);
    } finally {
      this.loading.set(false);
    }
  }

  private handleAuthError(err: any): void {
    if (err.code === 'auth/popup-closed-by-user') {
      this.errorMessage.set('La ventana de Google se cerró antes de completar el inicio de sesión.');
    } else if (err.code === 'auth/popup-blocked') {
      this.errorMessage.set('El navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes para continuar.');
    } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
      this.errorMessage.set('El inicio de sesión con Google no está habilitado en Firebase. Debes activarlo en Firebase Console > Authentication > Sign-in method > Google.');
    } else if (err.code === 'auth/email-already-in-use') {
      this.errorMessage.set('El correo ya está registrado en la plataforma. Intenta iniciar sesión.');
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      this.errorMessage.set('Credenciales incorrectas. Verifica tu correo o contraseña.');
    } else if (err.code === 'auth/weak-password') {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
    } else {
      this.errorMessage.set(err.message || 'Error de conexión. Inténtalo de nuevo.');
    }
  }

  private redirectUser(user: UserProfile): void {
    // Si hay una URL de retorno segura especificada (ej. al adquirir curso), redirigir allí
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    if (user.role === 'INSTRUCTOR') {
      this.router.navigate(['/instructor']);
    } else if (user.role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/student/dashboard']);
    }
  }
}
