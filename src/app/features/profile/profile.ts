import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { 
  LucideUser, 
  LucideCamera, 
  LucideMail, 
  LucideCalendar, 
  LucideShield, 
  LucideLock, 
  LucideLayers, 
  LucideGlobe, 
  LucidePlus, 
  LucideX, 
  LucideSave, 
  LucideLoader2, 
  LucideCheckCircle2, 
  LucideAlertCircle, 
  LucideCopy, 
  LucideCheck,
  LucideGraduationCap,
  LucideKeyRound,
  LucideEye,
  LucideEyeOff
} from '@lucide/angular';

export const AVATAR_PRESETS = [
  'Felix',
  'Aneka',
  'Oliver',
  'Bella',
  'Christian',
  'Sara',
  'Max',
  'Luna',
  'Leo',
  'Maya'
];

export const SUGGESTED_SPECIALTIES = [
  'Angular',
  'TypeScript',
  'Firebase',
  'TailwindCSS',
  'Node.js',
  'RxJS',
  'NestJS',
  'Docker',
  'Python',
  'PostgreSQL',
  'Figma',
  'Next.js'
];

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    LucideUser,
    LucideCamera,
    LucideMail,
    LucideCalendar,
    LucideShield,
    LucideLock,
    LucideLayers,
    LucideGlobe,
    LucidePlus,
    LucideX,
    LucideSave,
    LucideLoader2,
    LucideCheckCircle2,
    LucideAlertCircle,
    LucideCopy,
    LucideCheck,
    LucideGraduationCap,
    LucideKeyRound,
    LucideEye,
    LucideEyeOff
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.html'
})
export class ProfileComponent {
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly presets = AVATAR_PRESETS;
  protected readonly suggestedSpecialties = SUGGESTED_SPECIALTIES;

  // Profile Save State
  protected readonly isSaving = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly isIdCopied = signal<boolean>(false);

  // Password Update State
  protected readonly isUpdatingPassword = signal<boolean>(false);
  protected readonly passwordSuccessMessage = signal<string | null>(null);
  protected readonly passwordErrorMessage = signal<string | null>(null);
  protected readonly showNewPassword = signal<boolean>(false);
  protected readonly showConfirmPassword = signal<boolean>(false);

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);

  // Specialties Tags
  protected readonly specialties = signal<string[]>([]);
  protected readonly specialtyInput = signal<string>('');

  protected readonly user = computed(() => this.authService.currentUser());

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(70)]],
    title: ['', [Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(25)]],
    bio: ['', [Validators.maxLength(600)]],
    linkedinUrl: ['', [Validators.maxLength(200)]],
    githubUrl: ['', [Validators.maxLength(200)]],
    portfolioUrl: ['', [Validators.maxLength(200)]]
  });

  protected readonly passwordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    confirmPassword: ['', [Validators.required]]
  });

  protected readonly formattedRegistrationDate = computed(() => {
    const u = this.user();
    if (!u || !u.createdAt) return 'Fecha no disponible';
    try {
      const date = typeof u.createdAt.toDate === 'function' 
        ? u.createdAt.toDate() 
        : new Date(u.createdAt as unknown as string);
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return 'Miembro registrado';
    }
  });

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.form.patchValue({
          name: u.name || '',
          title: u.title || '',
          phone: u.phone || '',
          bio: u.bio || '',
          linkedinUrl: u.linkedinUrl || '',
          githubUrl: u.githubUrl || '',
          portfolioUrl: u.portfolioUrl || ''
        });

        if (u.specialties && Array.isArray(u.specialties)) {
          this.specialties.set([...u.specialties]);
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('La imagen seleccionada no debe superar los 5MB.');
        return;
      }
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  selectPreset(seed: string): void {
    const url = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
    this.selectedFile.set(null);
    this.previewUrl.set(url);
  }

  addSpecialty(): void {
    const tag = this.specialtyInput().trim();
    if (!tag) return;

    if (this.specialties().includes(tag)) {
      this.specialtyInput.set('');
      return;
    }

    if (this.specialties().length >= 15) {
      this.errorMessage.set('Puedes agregar un máximo de 15 especialidades.');
      return;
    }

    this.specialties.update(list => [...list, tag]);
    this.specialtyInput.set('');
  }

  addSuggestedSpecialty(tag: string): void {
    if (this.specialties().includes(tag)) return;
    if (this.specialties().length >= 15) return;
    this.specialties.update(list => [...list, tag]);
  }

  removeSpecialty(index: number): void {
    this.specialties.update(list => list.filter((_, i) => i !== index));
  }

  copyUserId(): void {
    const u = this.user();
    if (!u?.id) return;
    navigator.clipboard.writeText(u.id);
    this.isIdCopied.set(true);
    setTimeout(() => {
      this.isIdCopied.set(false);
    }, 2000);
  }

  async saveProfile(): Promise<void> {
    if (this.form.invalid || this.isSaving()) return;

    const name = this.form.value.name?.trim();
    if (!name || name.length < 3) {
      this.errorMessage.set('Por favor ingresa un nombre válido (mínimo 3 caracteres).');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.authService.updateUserProfile({
        name,
        title: this.form.value.title || '',
        phone: this.form.value.phone || '',
        bio: this.form.value.bio || '',
        specialties: this.specialties(),
        linkedinUrl: this.form.value.linkedinUrl || '',
        githubUrl: this.form.value.githubUrl || '',
        portfolioUrl: this.form.value.portfolioUrl || '',
        avatarFile: this.selectedFile(),
        avatarUrl: !this.selectedFile() && this.previewUrl() ? this.previewUrl()! : undefined
      });

      this.successMessage.set('¡Tu información de perfil ha sido actualizada exitosamente!');
      setTimeout(() => {
        this.successMessage.set(null);
      }, 4000);
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      this.errorMessage.set(err.message || 'Ocurrió un error al guardar los cambios de tu perfil.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async changePassword(): Promise<void> {
    if (this.passwordForm.invalid || this.isUpdatingPassword()) return;

    const newPass = this.passwordForm.value.newPassword || '';
    const confirmPass = this.passwordForm.value.confirmPassword || '';

    if (newPass.length < 6) {
      this.passwordErrorMessage.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      this.passwordErrorMessage.set('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    this.isUpdatingPassword.set(true);
    this.passwordErrorMessage.set(null);
    this.passwordSuccessMessage.set(null);

    try {
      await this.authService.updateUserPassword(newPass);
      this.passwordSuccessMessage.set('¡Tu contraseña ha sido actualizada con éxito!');
      this.passwordForm.reset();
      setTimeout(() => {
        this.passwordSuccessMessage.set(null);
      }, 4000);
    } catch (err: any) {
      console.error('Error actualizando contraseña:', err);
      if (err.code === 'auth/requires-recent-login') {
        this.passwordErrorMessage.set('Por seguridad, para cambiar la contraseña debes cerrar sesión e iniciarla nuevamente.');
      } else if (err.code === 'auth/weak-password') {
        this.passwordErrorMessage.set('La contraseña es demasiado débil. Usa al menos 6 caracteres combinando letras y números.');
      } else {
        this.passwordErrorMessage.set(err.message || 'Ocurrió un error al actualizar tu contraseña.');
      }
    } finally {
      this.isUpdatingPassword.set(false);
    }
  }
}
