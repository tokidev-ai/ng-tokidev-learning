import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, InstructorRegistrationData } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/user.model';
import { 
  LucideMail, 
  LucideLock, 
  LucideUser, 
  LucideArrowRight, 
  LucideSparkles, 
  LucideArrowLeft,
  LucideEye,
  LucideEyeOff,
  LucideGraduationCap,
  LucideBriefcase,
  LucideGlobe,
  LucideLayers,
  LucidePhone,
  LucideLoader2,
  LucideCamera,
  LucideTrash2
} from '@lucide/angular';

export interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+34', name: 'España', flag: '🇪🇸' },
  { code: '+1', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', name: 'Panamá', flag: '🇵🇦' },
  { code: '+1809', name: 'Rep. Dominicana', flag: '🇩🇴' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+504', name: 'Honduras', flag: '🇭🇳' },
  { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
  { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
  { code: '+55', name: 'Brasil', flag: '🇧🇷' }
];

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
    LucideEyeOff,
    LucideGraduationCap,
    LucideBriefcase,
    LucideGlobe,
    LucideLayers,
    LucidePhone,
    LucideLoader2,
    LucideCamera,
    LucideTrash2
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html'
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly countryCodes = COUNTRY_CODES;

  protected readonly activeTab = signal<'login' | 'register'>('login');
  protected readonly registerAccountType = signal<'student' | 'instructor'>('student');
  protected readonly instructorStep = signal<1 | 2>(1);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = signal<boolean>(false);

  // Avatar upload signals for instructor
  protected readonly selectedAvatarFile = signal<File | null>(null);
  protected readonly selectedAvatarPreview = signal<string | null>(null);

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
    ]],
    countryCode: ['+591'],
    phone: [''],
    title: [''],
    experienceYears: [1],
    specialties: [''],
    bio: [''],
    linkedinUsername: [''],
    githubUsername: [''],
    portfolioUrl: [''],
    courseProposal: ['']
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
    this.instructorStep.set(1);
    this.errorMessage.set(null);
  }

  setAccountType(type: 'student' | 'instructor'): void {
    this.registerAccountType.set(type);
    this.instructorStep.set(1);
    this.errorMessage.set(null);
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('La imagen seleccionada no debe superar los 5MB.');
        return;
      }
      this.selectedAvatarFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedAvatarPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.selectedAvatarFile.set(null);
    this.selectedAvatarPreview.set(null);
  }

  nextInstructorStep(): void {
    const name = this.registerForm.value.name?.trim();
    const email = this.registerForm.value.email?.toLowerCase().trim();
    const password = this.registerForm.value.password;

    if (!name || name.length < 3) {
      this.registerForm.get('name')?.markAsTouched();
      this.errorMessage.set('Por favor ingresa tu nombre completo (mínimo 3 letras).');
      return;
    }

    if (!email || this.registerForm.get('email')?.invalid) {
      this.registerForm.get('email')?.markAsTouched();
      this.errorMessage.set('Por favor introduce un correo electrónico válido.');
      return;
    }

    if (!password || !this.hasMinLength() || !this.hasLettersAndNumbers()) {
      this.registerForm.get('password')?.markAsTouched();
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres e incluir letras y números.');
      return;
    }

    this.errorMessage.set(null);
    this.instructorStep.set(2);
  }

  prevInstructorStep(): void {
    this.errorMessage.set(null);
    this.instructorStep.set(1);
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
    const isStudent = this.registerAccountType() === 'student';
    
    // Check base validity
    const name = this.registerForm.value.name?.trim();
    const email = this.registerForm.value.email?.toLowerCase().trim();
    const password = this.registerForm.value.password;

    if (!name || !email || !password || !this.hasMinLength() || !this.hasLettersAndNumbers()) {
      this.errorMessage.set('Por favor completa los campos de cuenta y contraseña segura.');
      return;
    }

    if (!isStudent) {
      const v = this.registerForm.value;
      if (!v.title || v.title.trim().length < 3) {
        this.errorMessage.set('Por favor ingresa tu Titular Profesional (mínimo 3 caracteres).');
        return;
      }
      if (!v.specialties || v.specialties.trim().length < 2) {
        this.errorMessage.set('Por favor ingresa tus Especialidades o Tecnologías.');
        return;
      }
      if (!v.bio || v.bio.trim().length < 10) {
        this.errorMessage.set('Por favor ingresa un resumen de tu experiencia (mínimo 10 caracteres).');
        return;
      }
      if (!v.courseProposal || v.courseProposal.trim().length < 10) {
        this.errorMessage.set('Por favor describe brevemente qué te gustaría enseñar (mínimo 10 caracteres).');
        return;
      }
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      if (isStudent) {
        // Registro normal de estudiante: entra directo
        const user = await this.authService.register(email, password, name);
        this.redirectUser(user);
      } else {
        // Registro y postulación de profesor: requiere aprobación
        const v = this.registerForm.value;
        const specialtiesRaw = v.specialties || '';
        const specialtiesList = specialtiesRaw
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        // Formatear teléfono completo
        const rawPhone = (v.phone || '').trim();
        const countryCode = v.countryCode || '+591';
        const formattedPhone = rawPhone ? `${countryCode} ${rawPhone}` : '';

        // Formatear enlaces de LinkedIn y GitHub
        let linkedinUrl = (v.linkedinUsername || '').trim();
        if (linkedinUrl && !linkedinUrl.startsWith('http://') && !linkedinUrl.startsWith('https://')) {
          linkedinUrl = `https://linkedin.com/in/${linkedinUrl.replace(/^@/, '').replace(/^in\//, '')}`;
        }

        let githubUrl = (v.githubUsername || '').trim();
        if (githubUrl && !githubUrl.startsWith('http://') && !githubUrl.startsWith('https://')) {
          githubUrl = `https://github.com/${githubUrl.replace(/^@/, '')}`;
        }

        let portfolioUrl = (v.portfolioUrl || '').trim();
        if (portfolioUrl && !portfolioUrl.startsWith('http://') && !portfolioUrl.startsWith('https://')) {
          portfolioUrl = `https://${portfolioUrl}`;
        }

        const instructorData: InstructorRegistrationData = {
          name,
          email,
          password,
          avatarFile: this.selectedAvatarFile(),
          phone: formattedPhone,
          title: v.title?.trim() || 'Profesor TokiDev',
          experienceYears: Number(v.experienceYears) || 1,
          specialties: specialtiesList.length > 0 ? specialtiesList : ['Desarrollo de Software'],
          bio: v.bio?.trim() || '',
          linkedinUrl: linkedinUrl,
          githubUrl: githubUrl,
          portfolioUrl: portfolioUrl || linkedinUrl || githubUrl,
          courseProposal: v.courseProposal?.trim() || ''
        };

        const user = await this.authService.registerAsInstructorCandidate(instructorData);
        // Redirección inmediata a pantalla de estado en revisión
        this.router.navigate(['/instructor-application-status']);
      }
    } catch (err: any) {
      console.error(err);
      this.handleAuthError(err);
    } finally {
      this.loading.set(false);
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

  private redirectUser(user: UserProfile): void {
    // Si tiene postulación de profesor pendiente o rechazada, pantalla de estado
    if (user.instructorApplicationStatus === 'PENDING' || user.instructorApplicationStatus === 'REJECTED') {
      this.router.navigate(['/instructor-application-status']);
      return;
    }

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

