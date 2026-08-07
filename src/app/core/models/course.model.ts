import { Timestamp } from 'firebase/firestore';

// ──────────────────────────────────────────
// Rutas de aprendizaje (colección: learningPaths)
// ──────────────────────────────────────────
export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  totalModules: number;
  totalSessions: number;
  // progressPercentage es del estudiante, vendrá de enrollments en Firestore
  // Se mantiene en el modelo durante la transición del mock
  progressPercentage: number;
  // days es el array plano del mock. En Firestore se reemplaza por subcolección modules/
  days: DayModule[];
  createdAt?: Timestamp;
}

// ──────────────────────────────────────────
// Módulos / Días
// (mock: dentro de LearningPath.days)
// (Firestore: subcolección learningPaths/{id}/modules)
// ──────────────────────────────────────────
export interface DayModule {
  id: string;
  dayNumber: number;
  title: string;
  startDate: string;
  totalLessons: number;
  completedLessons: number;
  description?: string;
  order?: number;
  isLocked: boolean;
  // lessons es el array plano del mock. En Firestore se reemplaza por subcolección lessons/
  lessons: Lesson[];
}

// ──────────────────────────────────────────
// Tipos de lección
// ──────────────────────────────────────────
export type LessonType = 'VIDEO' | 'HTML' | 'EXERCISE';

// ──────────────────────────────────────────
// Lecciones
// (mock: dentro de DayModule.lessons)
// (Firestore: subcolección modules/{id}/lessons)
// ──────────────────────────────────────────
export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  type: LessonType;
  videoUrl?: string;
  resourceUrl?: string;    // PDF u otro recurso (URL de Firebase Storage)
  summary?: string;
  codeSnippet?: string;
  resourceName?: string;
  order?: number;
  // Campos del mock en memoria
  moduleId?: string;
  moduleCode?: string;
  isCompleted: boolean;
  isLocked: boolean;
}

// ──────────────────────────────────────────
// Cursos del catálogo (colección: courses)
// ──────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId?: string;      // Referencia a users/{id} en Firestore
  instructorName: string;     // Desnormalizado para listados
  instructorTitle?: string;   // Título del instructor
  instructorAvatar: string;   // Desnormalizado para listados
  learningPathId: string;     // Referencia a learningPaths/{id}
  category: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos los niveles';
  durationHours: number;
  thumbnail: string;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  isFeatured?: boolean;
  price: number;
  createdAt?: Timestamp;
}
