import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly currentUser = signal<UserProfile>({
    id: 'usr_1001',
    name: 'Rodrigo TokiDev',
    email: 'rodrigo@tokidev.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'ADMIN', // Set as admin initially to easily test the admin panel
    activePathId: 'path_claude_5days',
    completedLessonsCount: 4,
    inProgressCount: 1,
    averageProgressScore: 35,
    streakDays: 7
  });

  readonly users = signal<UserProfile[]>([
    {
      id: 'usr_1001',
      name: 'Rodrigo TokiDev',
      email: 'rodrigo@tokidev.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'ADMIN',
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
    }
  ]);

  readonly currentRole = computed(() => this.currentUser().role);
  readonly isInstructor = computed(() => this.currentUser().role === 'INSTRUCTOR');
  readonly isStudent = computed(() => this.currentUser().role === 'STUDENT');
  readonly isAdmin = computed(() => this.currentUser().role === 'ADMIN');

  setRole(newRole: UserRole): void {
    this.currentUser.update(user => {
      const updated = { ...user, role: newRole };
      // Also update within the users list
      this.users.update(list => list.map(u => u.id === user.id ? updated : u));
      return updated;
    });
  }

  updateUserRole(userId: string, newRole: UserRole): void {
    this.users.update(list => {
      return list.map(u => {
        if (u.id === userId) {
          const updated = { ...u, role: newRole };
          // If the edited user is the current user, update current user signal too
          if (userId === this.currentUser().id) {
            this.currentUser.set(updated);
          }
          return updated;
        }
        return u;
      });
    });
  }

  updateProgressStats(completed: number, inProgress: number, averageScore: number): void {
    this.currentUser.update(user => {
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
