import { Injectable, signal, computed } from '@angular/core';
import { Course, LearningPath, Lesson } from '../models/course.model';
import { CommentThread } from '../models/discussion.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  readonly learningPaths = signal<LearningPath[]>([
    {
      id: 'path_claude_5days',
      title: '5 días de Claude & Agentes',
      subtitle: 'Masterclass de Agentes de Código, Prompt Engineering y Automatización',
      badge: 'Ruta Destacada',
      progressPercentage: 35,
      totalModules: 24,
      totalSessions: 5,
      days: [
        {
          id: 'day_1',
          dayNumber: 1,
          title: 'DÍA 1 • Fundamentos y Configuración Inicial',
          startDate: 'Disponible ahora',
          totalLessons: 7,
          completedLessons: 7,
          isLocked: false,
          lessons: [
            {
              id: 'les_101',
              moduleId: 'mod_101',
              moduleCode: 'MÓDULO 0',
              title: 'Introducción a la Inteligencia Artificial Aplicada',
              durationMinutes: 21,
              type: 'VIDEO',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              isCompleted: true,
              isLocked: false,
              summary: 'Visión general de modelos modernos, casos de uso prácticos y flujo de trabajo.'
            },
            {
              id: 'les_102',
              moduleId: 'mod_102',
              moduleCode: 'MÓDULO 1',
              title: 'Estructuración de Prompts de Alta Precisión',
              durationMinutes: 10,
              type: 'HTML',
              isCompleted: true,
              isLocked: false,
              summary: 'Guía paso a paso sobre cómo estructurar contexto, parámetros y salidas esperadas.'
            },
            {
              id: 'les_103',
              moduleId: 'mod_103',
              moduleCode: 'MÓDULO 2',
              title: 'Conectores e Integraciones con Herramientas',
              durationMinutes: 8,
              type: 'HTML',
              isCompleted: true,
              isLocked: false
            },
            {
              id: 'les_104',
              moduleId: 'mod_104',
              moduleCode: 'MÓDULO 3',
              title: 'Gestión Eficiente de Contexto y Recursos',
              durationMinutes: 12,
              type: 'HTML',
              isCompleted: true,
              isLocked: false
            },
            {
              id: 'les_105',
              moduleId: 'mod_105',
              moduleCode: 'MÓDULO 4',
              title: 'Asistentes Digitales en tu Flujo de Trabajo',
              durationMinutes: 8,
              type: 'VIDEO',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              isCompleted: true,
              isLocked: false
            },
            {
              id: 'les_106',
              moduleId: 'mod_106',
              moduleCode: 'MÓDULO 5',
              title: 'Configuración Avanzada de Contexto y Carpetas',
              durationMinutes: 15,
              type: 'HTML',
              isCompleted: true,
              isLocked: false
            },
            {
              id: 'les_107',
              moduleId: 'mod_107',
              moduleCode: 'MÓDULO 6',
              title: 'Ejercicio Práctico del Día 1: Brief de Progreso Automático',
              durationMinutes: 14,
              type: 'VIDEO',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              isCompleted: true,
              isLocked: false
            }
          ]
        },
        {
          id: 'day_2',
          dayNumber: 2,
          title: 'DÍA 2 • Personalización y Habilidades Específicas',
          startDate: 'En progreso',
          totalLessons: 5,
          completedLessons: 1,
          isLocked: false,
          lessons: [
            {
              id: 'les_201',
              moduleId: 'mod_201',
              moduleCode: 'MÓDULO 1000',
              title: 'Qué son las habilidades personalizadas (Skills)',
              durationMinutes: 15,
              type: 'VIDEO',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
              isCompleted: true,
              isLocked: false,
              summary: 'Concepto de Skills, personalización de instrucciones y flujos de trabajo automatizados.'
            },
            {
              id: 'les_202',
              moduleId: 'mod_202',
              moduleCode: 'MÓDULO 1001',
              title: 'Creación de instrucciones adaptadas a tu metodología',
              durationMinutes: 10,
              type: 'HTML',
              isCompleted: false,
              isLocked: false,
              summary: 'Definición de estándares y guías reutilizables.'
            },
            {
              id: 'les_203',
              moduleId: 'mod_203',
              moduleCode: 'MÓDULO 1002',
              title: 'Tu primera habilidad personalizada paso a paso',
              durationMinutes: 2,
              type: 'VIDEO',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
              isCompleted: false,
              isLocked: false
            },
            {
              id: 'les_204',
              moduleId: 'mod_204',
              moduleCode: 'MÓDULO 1003',
              title: 'Carga de documentación y archivos de referencia',
              durationMinutes: 18,
              type: 'EXERCISE',
              isCompleted: false,
              isLocked: false
            },
            {
              id: 'les_205',
              moduleId: 'mod_205',
              moduleCode: 'MÓDULO 1004',
              title: 'Desafío del Día 2: Automatización de Revisión',
              durationMinutes: 20,
              type: 'EXERCISE',
              isCompleted: false,
              isLocked: false
            }
          ]
        },
        {
          id: 'day_3',
          dayNumber: 3,
          title: 'DÍA 3 • Integraciones y Protocolos de Datos',
          startDate: 'Próximamente',
          totalLessons: 4,
          completedLessons: 0,
          isLocked: false,
          lessons: [
            {
              id: 'les_301',
              moduleId: 'mod_301',
              moduleCode: 'MÓDULO 2000',
              title: 'Conexión con Fuentes de Datos y APIs',
              durationMinutes: 25,
              type: 'VIDEO',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutback2012.mp4',
              isCompleted: false,
              isLocked: false
            }
          ]
        }
      ]
    },
    {
      id: 'path_ui_ux',
      title: 'Diseño de Interfaces & UX Digital',
      subtitle: 'Crea Experiencias Digitales de Alto Impacto y Sistemas de Diseño',
      badge: 'Nuevo',
      progressPercentage: 0,
      totalModules: 16,
      totalSessions: 4,
      days: []
    }
  ]);

  readonly activePathId = signal<string>('path_claude_5days');
  readonly selectedDayNumber = signal<number>(2);
  readonly activeLessonId = signal<string>('les_101');

  readonly coursesCatalog = signal<Course[]>([
    {
      id: 'course_claude_ai',
      title: '5 días de Inteligencia Artificial & Automatización',
      description: 'Aprende a dominar herramientas de IA, estructurar respuestas de alta precisión y automatizar tus tareas diarias.',
      instructorName: 'Lorenley Martínez',
      instructorTitle: 'Especialista en IA & Automatización',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      reviewsCount: 1420,
      studentsCount: 5890,
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      category: 'Inteligencia Artificial',
      level: 'Todos los niveles',
      durationHours: 14,
      learningPathId: 'path_claude_5days',
      isFeatured: true,
      price: 3.99
    },
    {
      id: 'course_angular_21',
      title: 'Desarrollo Web Moderno con Angular 21',
      description: 'Aprende a construir plataformas y sitios web dinámicos, rápidos y reactivos con las últimas tendencias.',
      instructorName: 'Rodrigo TokiDev',
      instructorTitle: 'Arquitecto Digital & Lead Developer',
      instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 4.95,
      reviewsCount: 890,
      studentsCount: 3410,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
      category: 'Desarrollo Web',
      level: 'Intermedio',
      durationHours: 22,
      learningPathId: 'path_angular_master',
      isFeatured: true,
      price: 4.99
    },
    {
      id: 'course_ui_design',
      title: 'Diseño de Productos Digitales & UI/UX',
      description: 'Aprende principios de diseño visual, paletas de colores, composición de interfaces y prototipado interactivo.',
      instructorName: 'Sofía Ramírez',
      instructorTitle: 'Product Designer & UI Specialist',
      instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      rating: 4.88,
      reviewsCount: 650,
      studentsCount: 2800,
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
      category: 'Diseño & Producto',
      level: 'Principiante',
      durationHours: 12,
      learningPathId: 'path_ui_ux',
      isFeatured: true,
      price: 3.50
    }
  ]);

  readonly commentsStore = signal<CommentThread[]>([
    {
      id: 'comm_1',
      lessonId: 'les_101',
      authorName: 'María Susana Vásquez',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      authorRole: 'Estudiante',
      timeAgo: 'hace 7m',
      content: 'Excelente explicación inicial. Me quedó muy claro cómo organizar las prioridades en el primer ejercicio.',
      likesCount: 5,
      isUserLiked: false,
      replies: [
        {
          id: 'rep_1',
          authorName: 'Lorenley Martínez',
          authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
          authorRole: 'Profesor',
          timeAgo: 'hace 3m',
          content: '¡Gracias María! Si tienes cualquier consulta durante el módulo 1 estamos aquí para ayudarte.',
          likesCount: 3,
          isUserLiked: true
        }
      ]
    }
  ]);

  readonly activePath = computed(() => {
    return this.learningPaths().find(p => p.id === this.activePathId()) || this.learningPaths()[0];
  });

  readonly selectedDay = computed(() => {
    const path = this.activePath();
    if (!path) return null;
    return path.days.find(d => d.dayNumber === this.selectedDayNumber()) || path.days[0];
  });

  readonly activeLesson = computed(() => {
    const path = this.activePath();
    if (!path) return null;
    for (const day of path.days) {
      const match = day.lessons.find(l => l.id === this.activeLessonId());
      if (match) return match;
    }
    return path.days[0]?.lessons[0] || null;
  });

  readonly activeLessonComments = computed(() => {
    const lesson = this.activeLesson();
    if (!lesson) return [];
    return this.commentsStore().filter(c => c.lessonId === lesson.id);
  });

  selectPath(pathId: string): void {
    this.activePathId.set(pathId);
  }

  selectDay(dayNumber: number): void {
    this.selectedDayNumber.set(dayNumber);
  }

  selectLesson(lessonId: string): void {
    this.activeLessonId.set(lessonId);
  }

  toggleLessonCompletion(lessonId: string): void {
    this.learningPaths.update(paths => {
      return paths.map(path => ({
        ...path,
        days: path.days.map(day => ({
          ...day,
          lessons: day.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              return { ...lesson, isCompleted: !lesson.isCompleted };
            }
            return lesson;
          })
        }))
      }));
    });
  }

  addComment(lessonId: string, content: string, authorName: string, authorAvatar: string): void {
    const newComment: CommentThread = {
      id: `comm_${Date.now()}`,
      lessonId,
      authorName,
      authorAvatar,
      authorRole: 'Estudiante',
      timeAgo: 'Justo ahora',
      content,
      likesCount: 0,
      isUserLiked: false,
      replies: []
    };

    this.commentsStore.update(comments => [newComment, ...comments]);
  }

  toggleLikeComment(commentId: string): void {
    this.commentsStore.update(comments => {
      return comments.map(c => {
        if (c.id === commentId) {
          const isLiked = !c.isUserLiked;
          return {
            ...c,
            isUserLiked: isLiked,
            likesCount: isLiked ? c.likesCount + 1 : c.likesCount - 1
          };
        }
        return c;
      });
    });
  }

  createCourse(courseData: {
    title: string;
    description: string;
    category: string;
    level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos los niveles';
    price: number;
    instructorName: string;
    instructorAvatar: string;
  }): string {
    const courseId = `course_${Date.now()}`;
    const pathId = `path_${Date.now()}`;

    const newCourse: Course = {
      id: courseId,
      title: courseData.title,
      description: courseData.description,
      instructorName: courseData.instructorName,
      instructorTitle: 'Especialista / Mentor',
      instructorAvatar: courseData.instructorAvatar,
      rating: 5.0,
      reviewsCount: 0,
      studentsCount: 0,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
      category: courseData.category,
      level: courseData.level,
      durationHours: 0,
      learningPathId: pathId,
      isFeatured: false,
      price: courseData.price
    };

    const newPath: LearningPath = {
      id: pathId,
      title: courseData.title,
      subtitle: courseData.description,
      badge: 'Nuevo',
      progressPercentage: 0,
      totalModules: 0,
      totalSessions: 0,
      days: []
    };

    this.coursesCatalog.update(courses => [...courses, newCourse]);
    this.learningPaths.update(paths => [...paths, newPath]);

    return courseId;
  }

  addLesson(courseId: string, lessonData: {
    dayNumber: number;
    title: string;
    type: 'VIDEO' | 'HTML' | 'EXERCISE';
    videoUrl?: string;
    summary?: string;
    durationMinutes: number;
    resourceName?: string;
  }): void {
    const course = this.coursesCatalog().find(c => c.id === courseId);
    if (!course) return;

    const pathId = course.learningPathId;

    this.learningPaths.update(paths => {
      return paths.map(path => {
        if (path.id !== pathId) return path;

        const days = [...path.days];
        let day = days.find(d => d.dayNumber === lessonData.dayNumber);

        const newLesson: Lesson = {
          id: `les_${Date.now()}`,
          moduleId: `mod_${Date.now()}`,
          moduleCode: `DÍA ${lessonData.dayNumber}`,
          title: lessonData.title,
          durationMinutes: lessonData.durationMinutes,
          type: lessonData.type,
          videoUrl: lessonData.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          isCompleted: false,
          isLocked: false,
          summary: lessonData.summary,
          resourceName: lessonData.resourceName
        };

        if (day) {
          const updatedLessons = [...day.lessons, newLesson];
          const dayIndex = days.indexOf(day);
          days[dayIndex] = {
            ...day,
            lessons: updatedLessons,
            totalLessons: updatedLessons.length
          };
        } else {
          days.push({
            id: `day_${Date.now()}`,
            dayNumber: lessonData.dayNumber,
            title: `DÍA ${lessonData.dayNumber} • Temas Nuevos`,
            startDate: 'Disponible ahora',
            totalLessons: 1,
            completedLessons: 0,
            isLocked: false,
            lessons: [newLesson]
          });
        }

        days.sort((a, b) => a.dayNumber - b.dayNumber);
        const totalLessonsCount = days.reduce((sum, d) => sum + d.lessons.length, 0);

        return {
          ...path,
          days,
          totalModules: totalLessonsCount
        };
      });
    });

    this.coursesCatalog.update(courses => {
      return courses.map(c => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          durationHours: c.durationHours + Math.ceil(lessonData.durationMinutes / 60)
        };
      });
    });
  }
}
