import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, UserProfile, InstructorApplication } from '../../../core/models/user.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  LucideUserCheck, 
  LucideUserX, 
  LucideClock, 
  LucideCheckCircle2, 
  LucideXCircle, 
  LucideBriefcase, 
  LucideExternalLink, 
  LucidePhone, 
  LucideMail, 
  LucideLoader2, 
  LucideUsers,
  LucideEye,
  LucideGlobe,
  LucideSparkles,
  LucideLayers,
  LucideMessageSquare,
  LucideFileText
} from '@lucide/angular';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input';
import { FilterSelectComponent, FilterOption } from '../../../shared/components/filter-select/filter-select';

@Component({
  selector: 'app-admin-users',
  imports: [
    RouterLink,
    FormsModule,
    LucideUserCheck,
    LucideUserX,
    LucideClock,
    LucideCheckCircle2,
    LucideXCircle,
    LucideBriefcase,
    LucideExternalLink,
    LucidePhone,
    LucideMail,
    LucideLoader2,
    LucideUsers,
    LucideEye,
    LucideGlobe,
    LucideSparkles,
    LucideLayers,
    LucideMessageSquare,
    LucideFileText,
    ConfirmModalComponent,
    SearchInputComponent,
    FilterSelectComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-users.html'
})
export class AdminUsersComponent {
  protected readonly authService = inject(AuthService);

  // Tab State: 'users' or 'applications'
  protected readonly activeTab = signal<'users' | 'applications'>('users');

  // Search and Filter Signals for Users
  protected readonly searchQuery = signal<string>('');
  protected readonly roleFilter = signal<string>('ALL');

  // Filter Signals for Applications
  protected readonly applicationStatusFilter = signal<string>('ALL');
  protected readonly applicationSearchQuery = signal<string>('');

  // Ban/Unban Modal State Signals
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly isProcessingAction = signal<boolean>(false);
  protected readonly targetUser = signal<UserProfile | null>(null);

  // Application Action State Signals
  protected readonly processingApplicationId = signal<string | null>(null);
  protected readonly isRejectModalOpen = signal<boolean>(false);
  protected readonly targetApplication = signal<InstructorApplication | null>(null);
  protected readonly rejectionReason = signal<string>('');

  // Application Detail Modal State
  protected readonly isDetailModalOpen = signal<boolean>(false);
  protected readonly selectedApplicationDetail = signal<InstructorApplication | null>(null);

  protected readonly filterOptions: FilterOption[] = [
    { value: 'ALL', label: 'Todos los Roles' },
    { value: 'ADMIN', label: 'Superadmin' },
    { value: 'INSTRUCTOR', label: 'Profesor' },
    { value: 'STUDENT', label: 'Estudiante' }
  ];

  protected readonly appFilterOptions: FilterOption[] = [
    { value: 'ALL', label: 'Todas las Solicitudes' },
    { value: 'PENDING', label: 'Pendientes de Revisión' },
    { value: 'APPROVED', label: 'Aprobadas' },
    { value: 'REJECTED', label: 'Rechazadas' }
  ];

  protected readonly modalTitle = computed(() => {
    const u = this.targetUser();
    if (!u) return 'Confirmar acción';
    return u.status === 'disabled'
      ? `¿Reactivar cuenta de ${u.name}?`
      : `¿Deshabilitar cuenta de ${u.name}?`;
  });

  protected readonly modalMessage = computed(() => {
    const u = this.targetUser();
    if (!u) return '';
    return u.status === 'disabled'
      ? `El usuario ${u.email} recuperará el acceso inmediato a la plataforma y a sus cursos.`
      : `El usuario ${u.email} perderá temporalmente el acceso para iniciar sesión y acceder a las rutas de estudio. Podrás reactivarlo en cualquier momento.`;
  });

  protected readonly modalConfirmBtnText = computed(() => {
    return this.targetUser()?.status === 'disabled' ? 'Reactivar Usuario' : 'Deshabilitar Usuario';
  });

  protected readonly modalLoadingText = computed(() => {
    return this.targetUser()?.status === 'disabled' ? 'Reactivando...' : 'Deshabilitando...';
  });

  protected readonly rolesList: { value: UserRole; label: string }[] = [
    { value: 'STUDENT', label: 'Estudiante' },
    { value: 'INSTRUCTOR', label: 'Profesor' },
    { value: 'ADMIN', label: 'Superadmin' }
  ];

  protected readonly filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.roleFilter();
    const users = this.authService.users();

    return users.filter(u => {
      const matchesRole = role === 'ALL' || u.role === role;
      const matchesQuery = !query || 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query) || 
        u.id.toLowerCase().includes(query);
      return matchesRole && matchesQuery;
    });
  });

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

  async onRoleChange(userId: string, event: Event): Promise<void> {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      await this.authService.updateUserRole(userId, selectElement.value as UserRole);
    }
  }

  openConfirmModal(user: UserProfile): void {
    this.targetUser.set(user);
    this.isProcessingAction.set(false);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    if (this.isProcessingAction()) return;
    this.isModalOpen.set(false);
    this.targetUser.set(null);
  }

  async confirmUserStatusChange(): Promise<void> {
    const u = this.targetUser();
    if (!u || this.isProcessingAction()) return;

    this.isProcessingAction.set(true);
    try {
      const newStatus = u.status === 'disabled' ? 'active' : 'disabled';
      await this.authService.updateUserStatus(u.id, newStatus);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Error actualizando estado del usuario:', err);
    } finally {
      this.isProcessingAction.set(false);
      this.isModalOpen.set(false);
      this.targetUser.set(null);
    }
  }

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

