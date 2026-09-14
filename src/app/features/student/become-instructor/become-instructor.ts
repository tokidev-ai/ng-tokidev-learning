import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, InstructorApplicationData } from '../../../core/services/auth.service';
import { COUNTRY_CODES, CountryCode } from '../../../core/models/country-codes';
import { 
  LucideGraduationCap, 
  LucideUpload, 
  LucideTrash2, 
  LucideCheckCircle2, 
  LucideLoader2, 
  LucideArrowRight,
  LucideBriefcase,
  LucideGlobe,
  LucideLayers,
  LucideClock,
  LucideAlertCircle
} from '@lucide/angular';

@Component({
  selector: 'app-become-instructor',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideGraduationCap,
    LucideUpload,
    LucideTrash2,
    LucideCheckCircle2,
    LucideLoader2,
    LucideArrowRight,
    LucideBriefcase,
    LucideGlobe,
    LucideLayers,
    LucideClock,
    LucideAlertCircle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './become-instructor.html'
})
export class BecomeInstructorComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly countryCodes: CountryCode[] = COUNTRY_CODES;

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly isSuccess = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly selectedAvatarFile = signal<File | null>(null);
  protected readonly selectedAvatarPreview = signal<string | null>(null);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    experienceYears: [2, [Validators.required, Validators.min(1), Validators.max(40)]],
    specialties: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    bio: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(500)]],
    countryCode: ['+591'],
    phone: ['', [Validators.maxLength(20)]],
    linkedinUsername: ['', [Validators.maxLength(100)]],
    githubUsername: ['', [Validators.maxLength(100)]],
    portfolioUrl: ['', [Validators.maxLength(150)]],
    courseProposal: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(600)]]
  });

  // Character counter signals
  protected readonly bioLength = signal<number>(0);
  protected readonly proposalLength = signal<number>(0);
  protected readonly specialtiesLength = signal<number>(0);

  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly applicationStatus = computed(() => this.currentUser()?.instructorApplicationStatus || 'NONE');

  constructor() {
    this.form.get('bio')?.valueChanges.subscribe(val => this.bioLength.set((val || '').length));
    this.form.get('courseProposal')?.valueChanges.subscribe(val => this.proposalLength.set((val || '').length));
    this.form.get('specialties')?.valueChanges.subscribe(val => this.specialtiesLength.set((val || '').length));
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('La foto no debe superar los 5MB.');
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

  async submitApplication(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Por favor completa todos los campos requeridos respetando los límites establecidos.');
      return;
    }

    const v = this.form.value;
    const specialtiesList = (v.specialties || '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const rawPhone = (v.phone || '').trim();
    const formattedPhone = rawPhone ? `${v.countryCode || '+591'} ${rawPhone}` : '';

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

    const applicationData: InstructorApplicationData = {
      title: v.title?.trim() || '',
      experienceYears: Number(v.experienceYears) || 1,
      specialties: specialtiesList.length > 0 ? specialtiesList : ['Desarrollo de Software'],
      bio: v.bio?.trim() || '',
      phone: formattedPhone,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      courseProposal: v.courseProposal?.trim() || '',
      avatarFile: this.selectedAvatarFile()
    };

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.applyAsInstructor(applicationData);
      this.isSuccess.set(true);
      setTimeout(() => {
        this.router.navigate(['/instructor-application-status']);
      }, 2500);
    } catch (err: any) {
      console.error('Error enviando postulación:', err);
      this.errorMessage.set(err.message || 'Error al enviar la postulación. Intenta nuevamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
