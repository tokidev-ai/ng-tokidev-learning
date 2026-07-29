export type LessonType = 'VIDEO' | 'HTML' | 'EXERCISE';

export interface Lesson {
  id: string;
  moduleId: string;
  moduleCode: string;
  title: string;
  durationMinutes: number;
  type: LessonType;
  videoUrl?: string;
  isCompleted: boolean;
  isLocked: boolean;
  summary?: string;
  codeSnippet?: string;
}

export interface DayModule {
  id: string;
  dayNumber: number;
  title: string;
  startDate: string;
  totalLessons: number;
  completedLessons: number;
  isLocked: boolean;
  lessons: Lesson[];
}

export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  progressPercentage: number;
  totalModules: number;
  totalSessions: number;
  days: DayModule[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  thumbnail: string;
  category: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos los niveles';
  durationHours: number;
  learningPathId: string;
  isFeatured?: boolean;
}
