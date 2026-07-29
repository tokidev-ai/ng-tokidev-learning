import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly currentUser = signal<UserProfile>({
    id: 'usr_1001',
    name: 'Rodrigo',
    email: 'rodrigo@tokidev.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'STUDENT',
    activePathId: 'path_claude_5days',
    completedLessonsCount: 4,
    inProgressCount: 1,
    averageProgressScore: 35,
    streakDays: 7
  });

  readonly currentRole = computed(() => this.currentUser().role);
  readonly isInstructor = computed(() => this.currentUser().role === 'INSTRUCTOR');
  readonly isStudent = computed(() => this.currentUser().role === 'STUDENT');

  setRole(newRole: UserRole): void {
    this.currentUser.update(user => ({
      ...user,
      role: newRole
    }));
  }

  updateProgressStats(completed: number, inProgress: number, averageScore: number): void {
    this.currentUser.update(user => ({
      ...user,
      completedLessonsCount: completed,
      inProgressCount: inProgress,
      averageProgressScore: averageScore
    }));
  }
}
