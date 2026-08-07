import { Timestamp } from 'firebase/firestore';

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

/**
 * Perfil de usuario unificado.
 * El campo `id` coincide con el Firebase Auth UID y el document ID en Firestore.
 *
 * Campos por rol:
 *  - STUDENT:    activePathId, streakDays
 *  - INSTRUCTOR: bio, title, specialties
 *  - ADMIN:      (sin campos extra)
 *
 * Nota: Durante la transición del mock a Firestore, los campos se vuelven
 * opcionales para permitir compatibilidad hacia atrás.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  createdAt: Timestamp | null;

  // Campos de STUDENT
  activePathId?: string | null;
  streakDays?: number;
  // Stats de progreso — en Firestore vendrán calculados de lessonProgress
  // Se mantienen opcionales durante la transición del mock
  completedLessonsCount?: number;
  inProgressCount?: number;
  averageProgressScore?: number;

  // Campos de INSTRUCTOR
  bio?: string;
  title?: string;
  specialties?: string[];
}

// Re-exports por compatibilidad con código existente
export type StudentProfile = UserProfile & { role: 'STUDENT' };
export type InstructorProfile = UserProfile & { role: 'INSTRUCTOR' };
export type AdminProfile = UserProfile & { role: 'ADMIN' };
