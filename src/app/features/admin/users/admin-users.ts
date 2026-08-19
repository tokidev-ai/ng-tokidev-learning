import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, UserProfile } from '../../../core/models/user.model';
import { RouterLink } from '@angular/router';
import { LucideUserCheck, LucideUserX } from '@lucide/angular';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input';
import { FilterSelectComponent, FilterOption } from '../../../shared/components/filter-select/filter-select';

@Component({
  selector: 'app-admin-users',
  imports: [
    RouterLink,
    LucideUserCheck,
    LucideUserX,
    ConfirmModalComponent,
    SearchInputComponent,
    FilterSelectComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-users.html'
})
export class AdminUsersComponent {
  protected readonly authService = inject(AuthService);

  // Search and Filter Signals
  protected readonly searchQuery = signal<string>('');
  protected readonly roleFilter = signal<string>('ALL');

  // Modal State Signals
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly isProcessingAction = signal<boolean>(false);
  protected readonly targetUser = signal<UserProfile | null>(null);

  protected readonly filterOptions: FilterOption[] = [
    { value: 'ALL', label: 'Todos los Roles' },
    { value: 'ADMIN', label: 'Superadmin' },
    { value: 'INSTRUCTOR', label: 'Profesor' },
    { value: 'STUDENT', label: 'Estudiante' }
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
}
