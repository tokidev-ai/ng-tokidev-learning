import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile, UserRole } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);

  readonly isLoggedIn = signal<boolean>(false);
  readonly currentUser = signal<UserProfile | null>(null);

  readonly users = signal<UserProfile[]>([
    {
      id: 'usr_1001',
      name: 'Rodrigo TokiDev',
      email: 'rodrigo@tokidev.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'STUDENT',
      activePathId: 'path_claude_5days',
      completedLessonsCount: 4,
      inProgressCount: 1,
      averageProgressScore: 35,
      streakDays: 7
    },
    {
      id: 'usr_1002',
      name: 'Lorenley Martínez',
      email: 'lorenley@tokidev.io',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      role: 'INSTRUCTOR',
      activePathId: 'path_claude_5days',
      completedLessonsCount: 24,
      inProgressCount: 0,
      averageProgressScore: 100,
      streakDays: 20
    },
    {
      id: 'usr_1003',
      name: 'Sofía Ramírez',
      email: 'sofia@tokidev.io',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      role: 'INSTRUCTOR',
      activePathId: 'path_ui_ux',
      completedLessonsCount: 16,
      inProgressCount: 0,
      averageProgressScore: 100,
      streakDays: 14
    },
    {
      id: 'usr_1004',
      name: 'María Susana Vásquez',
      email: 'm.susana@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      role: 'STUDENT',
      activePathId: 'path_claude_5days',
      completedLessonsCount: 7,
      inProgressCount: 2,
      averageProgressScore: 45,
      streakDays: 5
    },
    {
      id: 'usr_1005',
      name: 'Juan Carlos Pérez',
      email: 'j.carlos@hotmail.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      role: 'STUDENT',
      activePathId: 'path_angular_master',
      completedLessonsCount: 0,
      inProgressCount: 1,
      averageProgressScore: 5,
      streakDays: 1
    },
    {
      id: 'usr_admin',
      name: 'Iván TokiDev (Superadmin)',
      email: 'ivan@tokidev.io',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'ADMIN',
      activePathId: 'path_claude_5days',
      completedLessonsCount: 0,
      inProgressCount: 0,
      averageProgressScore: 0,
      streakDays: 10
    }
  ]);

  readonly currentRole = computed(() => this.currentUser()?.role || null);
  readonly isInstructor = computed(() => this.currentUser()?.role === 'INSTRUCTOR');
  readonly isStudent = computed(() => this.currentUser()?.role === 'STUDENT');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  login(userId: string): boolean {
    const user = this.users().find(u => u.id === userId);
    if (user) {
      this.currentUser.set(user);
      this.isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  setRole(newRole: UserRole): void {
    const current = this.currentUser();
    if (!current) return;
    
    this.currentUser.update(user => {
      if (!user) return null;
      const updated = { ...user, role: newRole };
      this.users.update(list => list.map(u => u.id === user.id ? updated : u));
      return updated;
    });
  }

  updateUserRole(userId: string, newRole: UserRole): void {
    this.users.update(list => {
      return list.map(u => {
        if (u.id === userId) {
          const updated = { ...u, role: newRole };
          if (userId === this.currentUser()?.id) {
            this.currentUser.set(updated);
          }
          return updated;
        }
        return u;
      });
    });
  }

  updateProgressStats(completed: number, inProgress: number, averageScore: number): void {
    const current = this.currentUser();
    if (!current) return;

    this.currentUser.update(user => {
      if (!user) return null;
      const updated = {
        ...user,
        completedLessonsCount: completed,
        inProgressCount: inProgress,
        averageProgressScore: averageScore
      };
      this.users.update(list => list.map(u => u.id === user.id ? updated : u));
      return updated;
    });
  }
}
