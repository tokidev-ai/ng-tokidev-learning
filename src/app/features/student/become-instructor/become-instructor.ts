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
  LucideArrowLeft,
  LucideCheck,
  LucideBriefcase,
  LucideCamera,
  LucideLayers,
  LucideClock,
  LucideAlertCircle,
  LucidePlus,
  LucideX,
  LucideSparkles,
  LucideRefreshCw
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
    LucideArrowLeft,
    LucideCheck,
    LucideBriefcase,
    LucideCamera,
    LucideLayers,
    LucideClock,
    LucideAlertCircle,
    LucidePlus,
    LucideX,
    LucideSparkles,
    LucideRefreshCw
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './become-instructor.html'
})
export class BecomeInstructorComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly countryCodes: CountryCode[] = COUNTRY_CODES;

  // Wizard Step (1: Perfil, 2: Propuesta y Enlaces)
  protected readonly currentStep = signal<1 | 2>(1);
  protected readonly isReapplying = signal<boolean>(false);

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly isSuccess = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly selectedAvatarFile = signal<File | null>(null);
  protected readonly selectedAvatarPreview = signal<string | null>(null);

  // Specialties Tags
  protected readonly specialtiesList = signal<string[]>([]);
  protected readonly specialtyInput = signal<string>('');
  readonly popularSuggestions: string[] = [
    'Angular', 'TypeScript', 'RxJS', 'Firebase', 'Tailwind CSS',
    'Node.js', 'NestJS', 'React', 'Next.js', 'Docker', 'Python'
  ];

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    experienceYears: [2, [Validators.required, Validators.min(1), Validators.max(40)]],
    specialties: ['', [Validators.required]],
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

  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly applicationStatus = computed(() => this.currentUser()?.instructorApplicationStatus || 'NONE');

  constructor() {
    this.form.get('bio')?.valueChanges.subscribe(val => this.bioLength.set((val || '').length));
    this.form.get('courseProposal')?.valueChanges.subscribe(val => this.proposalLength.set((val || '').length));
  }

  onSpecialtyInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.specialtyInput.set(input.value);
  }

  nextStep(): void {
    const title = this.form.get('title');
    const exp = this.form.get('experienceYears');
    const specialties = this.form.get('specialties');
    const bio = this.form.get('bio');

    title?.markAsTouched();
    exp?.markAsTouched();
    specialties?.markAsTouched();
    bio?.markAsTouched();

    if (title?.invalid || exp?.invalid || specialties?.invalid || bio?.invalid || this.specialtiesList().length === 0) {
      this.errorMessage.set('Por favor completa todos los campos requeridos del Paso 1 antes de continuar.');
      return;
    }

    this.errorMessage.set(null);
    this.currentStep.set(2);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    this.errorMessage.set(null);
    this.currentStep.set(1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  }

  addSpecialty(tagToAdd?: string): void {
    const raw = (tagToAdd || this.specialtyInput()).trim();
    if (!raw) return;

    // Permitir split si pegó varios separados por coma
    const items = raw.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const current = this.specialtiesList();
    const next = [...current];

    for (const item of items) {
      if (!next.some(s => s.toLowerCase() === item.toLowerCase()) && next.length < 10) {
        next.push(item);
      }
    }

    this.specialtiesList.set(next);
    this.specialtyInput.set('');
    this.syncSpecialtiesForm();
  }

  removeSpecialty(index: number): void {
    this.specialtiesList.update(list => list.filter((_, i) => i !== index));
    this.syncSpecialtiesForm();
  }

  private syncSpecialtiesForm(): void {
    const current = this.specialtiesList();
    this.form.get('specialties')?.setValue(current.length > 0 ? current.join(', ') : '');
    this.form.get('specialties')?.markAsTouched();
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

  startReapplying(): void {
    const u = this.currentUser();
    if (u) {
      this.form.patchValue({
        title: u.title || '',
        experienceYears: (u as any).experienceYears || 2,
        bio: u.bio || '',
        phone: u.phone ? u.phone.replace(/^\+\d+\s*/, '') : '',
        linkedinUsername: u.linkedinUrl ? u.linkedinUrl.replace(/^https?:\/\/(?:www\.)?linkedin\.com\/in\//i, '') : '',
        githubUsername: u.githubUrl ? u.githubUrl.replace(/^https?:\/\/(?:www\.)?github\.com\//i, '') : '',
        portfolioUrl: u.portfolioUrl ? u.portfolioUrl.replace(/^https?:\/\//i, '') : '',
        courseProposal: (u as any).courseProposal || ''
      });

      if (u.specialties && u.specialties.length > 0) {
        this.specialtiesList.set([...u.specialties]);
        this.syncSpecialtiesForm();
      }
    }
    this.currentStep.set(1);
    this.isReapplying.set(true);
    this.errorMessage.set(null);
  }

  async submitApplication(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Por favor completa todos los campos requeridos respetando los límites establecidos.');
      return;
    }

    const v = this.form.value;
    const specialtiesList = this.specialtiesList().length > 0
      ? this.specialtiesList()
      : (v.specialties || '')
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

    const rawPhone = (v.phone || '').trim();
    const formattedPhone = rawPhone ? `${v.countryCode || '+591'} ${rawPhone}` : '';

    let linkedinUrl = '';
    const rawLinkedin = (v.linkedinUsername || '').trim();
    if (rawLinkedin) {
      const match = rawLinkedin.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^/?#]+)/i);
      const username = match ? match[1] : rawLinkedin.replace(/^@/, '').replace(/^in\//, '').replace(/^https?:\/\//, '');
      linkedinUrl = `https://linkedin.com/in/${username}`;
    }

    let githubUrl = '';
    const rawGithub = (v.githubUsername || '').trim();
    if (rawGithub) {
      const match = rawGithub.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)/i);
      const username = match ? match[1] : rawGithub.replace(/^@/, '').replace(/^https?:\/\//, '');
      githubUrl = `https://github.com/${username}`;
    }

    let portfolioUrl = '';
    const rawPortfolio = (v.portfolioUrl || '').trim();
    if (rawPortfolio) {
      portfolioUrl = rawPortfolio.startsWith('http://') || rawPortfolio.startsWith('https://')
        ? rawPortfolio
        : `https://${rawPortfolio.replace(/^https?:\/\//, '')}`;
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
      this.isReapplying.set(false);
    } catch (err: any) {
      console.error('Error enviando postulación:', err);
      this.errorMessage.set(err.message || 'Ocurrió un error al enviar tu postulación. Intenta nuevamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
