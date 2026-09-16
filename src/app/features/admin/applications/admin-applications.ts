import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { InstructorApplication } from '../../../core/models/user.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  LucideClock, 
  LucideCheckCircle2, 
  LucideXCircle, 
  LucideBriefcase, 
  LucideExternalLink, 
  LucidePhone, 
  LucideMail, 
  LucideLoader2, 
  LucideEye, 
  LucideGlobe, 
  LucideSparkles, 
  LucideLayers, 
  LucideMessageSquare, 
  LucideFileText 
} from '@lucide/angular';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input';
import { FilterSelectComponent, FilterOption } from '../../../shared/components/filter-select/filter-select';

@Component({
  selector: 'app-admin-applications',
  imports: [
    RouterLink,
    FormsModule,
    LucideClock,
    LucideCheckCircle2,
    LucideXCircle,
    LucideBriefcase,
    LucideExternalLink,
    LucidePhone,
    LucideMail,
    LucideLoader2,
    LucideEye,
    LucideGlobe,
    LucideSparkles,
    LucideLayers,
    LucideMessageSquare,
    LucideFileText,
    SearchInputComponent,
    FilterSelectComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-applications.html'
})
export class AdminApplicationsComponent {
  protected readonly authService = inject(AuthService);

  // Filter Signals for Applications
  protected readonly applicationStatusFilter = signal<string>('ALL');
  protected readonly applicationSearchQuery = signal<string>('');

  // Application Action State Signals
  protected readonly processingApplicationId = signal<string | null>(null);
  protected readonly isRejectModalOpen = signal<boolean>(false);
  protected readonly targetApplication = signal<InstructorApplication | null>(null);
  protected readonly rejectionReason = signal<string>('');

  // Application Detail Modal State
  protected readonly isDetailModalOpen = signal<boolean>(false);
  protected readonly selectedApplicationDetail = signal<InstructorApplication | null>(null);

  protected readonly appFilterOptions: FilterOption[] = [
    { value: 'ALL', label: 'Todas las Solicitudes' },
    { value: 'PENDING', label: 'Pendientes de Revisión' },
    { value: 'APPROVED', label: 'Aprobadas' },
    { value: 'REJECTED', label: 'Rechazadas' }
  ];

  protected readonly filteredApplications = computed(() => {
    const query = this.applicationSearchQuery().toLowerCase().trim();
    const filter = this.applicationStatusFilter();
    const apps = this.authService.instructorApplications();

    return apps.filter(a => {
      const matchesStatus = filter === 'ALL' || a.status === filter;
      const matchesQuery = !query ||
        a.userName.toLowerCase().includes(query) ||
        a.userEmail.toLowerCase().includes(query) ||
        (a.title && a.title.toLowerCase().includes(query)) ||
        (a.specialties && a.specialties.some(s => s.toLowerCase().includes(query)));
      return matchesStatus && matchesQuery;
    });
  });

  /** Aprobación directa de postulación de profesor */
  async approveApplication(app: InstructorApplication): Promise<void> {
    if (this.processingApplicationId()) return;

    this.processingApplicationId.set(app.id);
    try {
      await this.authService.approveInstructorApplication(app);
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (err) {
      console.error('Error aprobando postulación de profesor:', err);
    } finally {
      this.processingApplicationId.set(null);
    }
  }

  /** Abrir modal de rechazo con feedback opcional */
  openRejectModal(app: InstructorApplication): void {
    this.targetApplication.set(app);
    this.rejectionReason.set('');
    this.isRejectModalOpen.set(true);
  }

  closeRejectModal(): void {
    if (this.processingApplicationId()) return;
    this.isRejectModalOpen.set(false);
    this.targetApplication.set(null);
    this.rejectionReason.set('');
  }

  /** Confirmar rechazo de postulación */
  async confirmRejectApplication(): Promise<void> {
    const app = this.targetApplication();
    if (!app || this.processingApplicationId()) return;

    this.processingApplicationId.set(app.id);
    try {
      await this.authService.rejectInstructorApplication(
        app.id, 
        app.userId, 
        this.rejectionReason().trim() || 'El perfil no cumple con los requisitos docentes requeridos en este momento.'
      );
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (err) {
      console.error('Error rechazando postulación de profesor:', err);
    } finally {
      this.processingApplicationId.set(null);
      this.isRejectModalOpen.set(false);
      this.targetApplication.set(null);
      this.rejectionReason.set('');
    }
  }

  openDetailModal(app: InstructorApplication): void {
    this.selectedApplicationDetail.set(app);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
    this.selectedApplicationDetail.set(null);
  }

  getWhatsAppUrl(phone?: string): string | null {
    if (!phone) return null;
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    return digitsOnly.length >= 7 ? `https://wa.me/${digitsOnly}` : null;
  }
}
