export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  activePathId: string;
  completedLessonsCount: number;
  inProgressCount: number;
  averageProgressScore: number;
  streakDays: number;
}
