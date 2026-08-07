import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, UserProfile } from '../../../core/models/user.model';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-[#DA2984]/20 text-[#DA2984] text-xs font-extrabold uppercase rounded-full border border-[#DA2984]/30">
              Admin / Usuarios
            </span>
          </div>
          <h1 class="text-3xl font-black text-white">Gestión de Cuentas & Permisos</h1>
          <p class="text-xs text-slate-400">Administra niveles de acceso de estudiantes, registra profesores de forma manual y gestiona el estado de las cuentas.</p>
        </div>

        <!-- Users Management Card -->
        <div class="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 class="text-sm font-extrabold uppercase text-slate-400 tracking-wider">Usuarios Registrados</h3>
            
            <!-- Quick Filter -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400">Filtrar por Rol:</span>
              <select 
                [formControl]="roleFilterControl"
                class="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#DA2984]">
                <option value="ALL">Todos los Usuarios</option>
                <option value="ADMIN">Superadmin</option>
                <option value="INSTRUCTOR">Profesor</option>
                <option value="STUDENT">Estudiante</option>
              </select>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-slate-400 font-extrabold uppercase">
                  <th class="py-3.5 px-4">Usuario</th>
                  <th class="py-3.5 px-4">Email</th>
                  <th class="py-3.5 px-4">Estado</th>
                  <th class="py-3.5 px-4">Rol Asignado</th>
                  <th class="py-3.5 px-4 text-right">Modificar Rol</th>
                  <th class="py-3.5 px-4 text-right">Seguridad</th>
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.id) {
                  <tr class="border-b border-white/5 hover:bg-slate-900/40 transition-colors">
                    
                    <!-- Col 1: Identity -->
                    <td class="py-3.5 px-4 flex items-center gap-3">
                      <img [src]="user.avatar" [alt]="user.name" class="w-8 h-8 rounded-full object-cover border border-white/10" />
                      <div>
                        <span class="font-bold text-white block">{{ user.name }}</span>
                        <span class="text-[9px] text-slate-500 font-mono">ID: {{ user.id }}</span>
                      </div>
                    </td>
                    
                    <!-- Col 2: Email -->
                    <td class="py-3.5 px-4 text-slate-300 font-mono">{{ user.email }}</td>
                    
                    <!-- Col 3: Status -->
                    <td class="py-3.5 px-4">
                      <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[9px] uppercase">Activo</span>
                    </td>
                    
                    <!-- Col 4: Role -->
                    <td class="py-3.5 px-4">
                      @if (user.role === 'ADMIN') {
                        <span class="px-2 py-0.5 rounded bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold uppercase text-[9px]">Superadmin</span>
                      } @else if (user.role === 'INSTRUCTOR') {
                        <span class="px-2 py-0.5 rounded bg-[#FA743F]/25 text-[#FA743F] border border-[#FA743F]/30 font-bold uppercase text-[9px]">Profesor</span>
                      } @else {
                        <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5 uppercase text-[9px]">Estudiante</span>
                      }
                    </td>
                    
                    <!-- Col 5: Actions to Alter Role -->
                    <td class="py-3.5 px-4 text-right">
                      @if (user.id !== authService.currentUser()?.id) {
                        <div class="inline-block relative">
                          <select 
                            [value]="user.role"
                            (change)="onRoleChange(user.id, $event)"
                            class="bg-[#131127] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#DA2984] hover:bg-slate-800/60 transition-colors cursor-pointer appearance-none pr-8">
                            @for (role of rolesList; track role.value) {
                              <option [value]="role.value">{{ role.label }}</option>
                            }
                          </select>
                          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      } @else {
                        <span class="text-[10px] text-slate-500 italic pr-3">Mi cuenta</span>
                      }
                    </td>

                    <!-- Col 6: Security Baneo/Deshabilitación -->
                    <td class="py-3.5 px-4 text-right">
                      @if (user.id !== authService.currentUser()?.id) {
                        <button 
                          type="button"
                          (click)="banUser(user.name)"
                          class="px-2.5 py-1 rounded bg-slate-950 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-[10px] font-bold uppercase transition-colors cursor-pointer">
                          Deshabilitar
                        </button>
                      }
                    </td>

                  </tr>
                }
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  `
})
export class AdminUsersComponent {
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly roleFilterControl = this.fb.control('ALL');

  protected readonly rolesList: { value: UserRole; label: string }[] = [
    { value: 'STUDENT', label: 'Estudiante' },
    { value: 'INSTRUCTOR', label: 'Profesor' },
    { value: 'ADMIN', label: 'Superadmin' }
  ];

  protected readonly filteredUsers = computed(() => {
    const filter = this.roleFilterControl.value || 'ALL';
    const users = this.authService.users();
    if (filter === 'ALL') return users;
    return users.filter(u => u.role === filter);
  });

  changeRole(userId: string, role: string): void {
    this.authService.updateUserRole(userId, role as UserRole);
  }

  onRoleChange(userId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      this.changeRole(userId, selectElement.value);
    }
  }

  banUser(userName: string): void {
    alert(`Seguridad: Cuenta de usuario (${userName}) bloqueada y deshabilitada provisionalmente.`);
  }
}
