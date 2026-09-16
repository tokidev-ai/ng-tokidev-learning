import { Component, ChangeDetectionStrategy, inject, signal, output, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { 
  LucideUser, 
  LucideCamera, 
  LucideX, 
  LucideLoader2, 
  LucideCheck
} from '@lucide/angular';

export const AVATAR_PRESETS = [
  'Felix',
  'Aneka',
  'Oliver',
  'Bella',
  'Christian',
  'Sara',
  'Max',
  'Luna'
];

@Component({
  selector: 'app-profile-modal',
  imports: [
    ReactiveFormsModule,
    LucideUser,
    LucideCamera,
    LucideX,
    LucideLoader2,
    LucideCheck
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-modal.html'
})
export class ProfileEditModalComponent {
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly close = output<void>();

  protected readonly presets = AVATAR_PRESETS;
  protected readonly isSaving = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);

  protected readonly user = computed(() => this.authService.currentUser());

  protected readonly form = this.fb.group({
    name: [this.user()?.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    bio: [this.user()?.bio || '', [Validators.maxLength(300)]]
  });

  constructor() {
    const u = this.user();
    if (u) {
      this.form.patchValue({
        name: u.name,
        bio: u.bio || ''
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('La imagen no debe superar los 5MB.');
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

  async saveProfile(): Promise<void> {
    if (this.form.invalid || this.isSaving()) return;

    const name = this.form.value.name?.trim();
    const bio = this.form.value.bio?.trim();

    if (!name || name.length < 3) {
      this.errorMessage.set('Por favor ingresa un nombre válido (mínimo 3 letras).');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.authService.updateUserProfile({
        name,
        bio: bio || '',
        avatarFile: this.selectedFile(),
        avatarUrl: !this.selectedFile() && this.previewUrl() ? this.previewUrl()! : undefined
      });

      this.successMessage.set('¡Perfil actualizado con éxito!');
      setTimeout(() => {
        this.close.emit();
      }, 1000);
    } catch (err: any) {
      console.error('Error actualizando perfil:', err);
      this.errorMessage.set(err.message || 'Error al guardar los cambios.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
