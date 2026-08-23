import { Timestamp } from 'firebase/firestore';
import { UserRole } from './user.model';

// ──────────────────────────────────────────
// Backward compatibility: CommentThread (mock)
// Se mantiene para que course.service.ts no rompa mientras migra a Firestore
// ──────────────────────────────────────────
export interface Reply {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole | 'Estudiante' | 'Profesor' | 'Tutor';
  timeAgo?: string;
  content: string;
  likesCount: number;
  isUserLiked?: boolean;
  likedBy?: string[];
  createdAt?: Timestamp;
}

export interface CommentThread {
  id: string;
  lessonId: string;
  authorId?: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole | 'Estudiante' | 'Profesor' | 'Tutor';
  timeAgo?: string;
  content: string;
  likesCount: number;
  isUserLiked?: boolean;
  replies: Reply[];
  likedBy?: string[];
  createdAt?: Timestamp;
}

// ──────────────────────────────────────────
// Nuevo modelo para Firestore (colección: discussions)
// ──────────────────────────────────────────
export interface Discussion {
  id: string;
  lessonId: string;
  pathId: string;
  authorId: string;      // users/{id}
  authorName: string;    // Desnormalizado
  authorAvatar: string;  // Desnormalizado
  authorRole: UserRole;
  content: string;
  likesCount: number;
  likedBy: string[];     // Array de userIds
  createdAt: Timestamp;
}

// ──────────────────────────────────────────
// Inscripción de estudiante en una ruta (colección: enrollments)
// ──────────────────────────────────────────
export interface Enrollment {
  id: string;
  userId: string;    // users/{id}
  pathId: string;    // learningPaths/{id}
  enrolledAt: Timestamp;
  progressPercentage: number;
  status: 'active' | 'blocked' | 'completed' | 'paused' | 'revoked';
}

export interface EnrolledStudentItem {
  enrollmentId: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  enrolledAt: Timestamp | null;
  enrolledDateFormatted: string;
  progressPercentage: number;
  status: 'active' | 'blocked' | 'completed' | 'paused';
}

// ──────────────────────────────────────────
// Progreso de estudiante por lección (colección: lessonProgress)
// ID del documento: "{userId}_{lessonId}"
// ──────────────────────────────────────────
export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  pathId: string;
  moduleId: string;
  isCompleted: boolean;
  completedAt?: Timestamp;
  lastWatchedSeconds?: number;
}
