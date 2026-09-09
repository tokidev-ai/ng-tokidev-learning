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
  status?: 'active' | 'disabled';
  createdAt: Timestamp | null;

  // Campos de STUDENT
  activePathId?: string | null;
  streakDays?: number;
  // Stats de progreso — en Firestore vendrán calculados de lessonProgress
  // Se mantienen opcionales durante la transición del mock
  completedLessonsCount?: number;
  inProgressCount?: number;
  averageProgressScore?: number;

  // Campos de INSTRUCTOR y Postulación
  bio?: string;
  title?: string;
  specialties?: string[];
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  instructorApplicationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string;
}

export interface InstructorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  phone?: string;
  title: string;
  experienceYears: number;
  specialties: string[];
  bio: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  courseProposal: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Timestamp;
  reviewedAt?: Timestamp | null;
  reviewedBy?: string | null;
  adminFeedback?: string;
}


// Re-exports por compatibilidad con código existente
export type StudentProfile = UserProfile & { role: 'STUDENT' };
export type InstructorProfile = UserProfile & { role: 'INSTRUCTOR' };
export type AdminProfile = UserProfile & { role: 'ADMIN' };

