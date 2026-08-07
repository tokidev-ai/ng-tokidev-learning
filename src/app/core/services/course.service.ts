import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Course, LearningPath, DayModule, Lesson } from '../models/course.model';
import { CommentThread, Enrollment, LessonProgress, Discussion } from '../models/discussion.model';
import { db } from '../firebase/firebase';
import { AuthService } from './auth.service';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  Timestamp, 
  orderBy,
  setDoc
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly authService = inject(AuthService);

  // Catálogo completo de cursos
  readonly coursesCatalog = signal<Course[]>([]);
  
  // Todas las rutas de aprendizaje disponibles en la plataforma
  private readonly allLearningPaths = signal<LearningPath[]>([]);

  // Inscripciones del usuario actual
  readonly myEnrollments = signal<Enrollment[]>([]);

  // Progreso de lecciones del usuario actual
  readonly myLessonProgress = signal<LessonProgress[]>([]);

  // Rutas de aprendizaje en las que el estudiante está inscrito (con su progreso real)
  readonly learningPaths = computed(() => {
    const user = this.authService.currentUser();
    const paths = this.allLearningPaths();
    const enrollments = this.myEnrollments();

    if (!user) return [];
    if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
      // Admin y Profesores ven todas las rutas
      return paths;
    }

    // Estudiantes solo ven las rutas en las que están inscritos
    return enrollments.map(enrollment => {
      const path = paths.find(p => p.id === enrollment.pathId);
      if (!path) return null;
      return {
        ...path,
        progressPercentage: enrollment.progressPercentage
      };
    }).filter((p): p is LearningPath => p !== null);
  });

  readonly activePathId = signal<string | null>(null);
  readonly selectedDayNumber = signal<number>(1);
  readonly activeLessonId = signal<string | null>(null);

  // Estructura de módulos/lecciones cargados dinámicamente para la ruta activa
  readonly activePathDetails = signal<DayModule[]>([]);

  readonly activePath = computed(() => {
    const paths = this.learningPaths();
    const activeId = this.activePathId();
    const path = paths.find(p => p.id === activeId) || paths[0] || null;
    if (!path) return null;

    // Inyectar los días/módulos cargados dinámicamente desde Firestore
    return {
      ...path,
      days: this.activePathDetails()
    };
  });

  readonly selectedDay = computed(() => {
    const path = this.activePath();
    if (!path) return null;
    return path.days.find(d => d.dayNumber === this.selectedDayNumber()) || path.days[0] || null;
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

  // Hilos de discusión de la lección activa (cargados en tiempo real)
  readonly activeLessonComments = signal<CommentThread[]>([]);

  constructor() {
    // 1. Escuchar el catálogo de cursos de Firestore
    onSnapshot(collection(db, 'courses'), (snapshot) => {
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      this.coursesCatalog.set(courses);
    });

    // 2. Escuchar todas las rutas de aprendizaje de Firestore
    onSnapshot(collection(db, 'learningPaths'), (snapshot) => {
      const paths = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), days: [] as DayModule[] } as LearningPath));
      this.allLearningPaths.set(paths);
    });

    // 3. Reactividad en base al usuario autenticado (escuchar sus inscripciones y progreso)
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        // Escuchar inscripciones del estudiante
        const enrollmentsQuery = query(collection(db, 'enrollments'), where('userId', '==', user.id));
        const unsubscribeEnrollments = onSnapshot(enrollmentsQuery, (snapshot) => {
          const enrollments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
          this.myEnrollments.set(enrollments);
        });

        // Escuchar progreso de lecciones del estudiante
        const progressQuery = query(collection(db, 'lessonProgress'), where('userId', '==', user.id));
        const unsubscribeProgress = onSnapshot(progressQuery, (snapshot) => {
          const progress = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonProgress));
          this.myLessonProgress.set(progress);
        });

        return () => {
          unsubscribeEnrollments();
          unsubscribeProgress();
        };
      } else {
        this.myEnrollments.set([]);
        this.myLessonProgress.set([]);
        return;
      }
    });

    // 4. Reactividad de carga dinámica de lecciones para la ruta activa
    effect(() => {
      const activeId = this.activePathId();
      const user = this.authService.currentUser();
      if (!activeId) return;

      // Cargar módulos (subcolección modules)
      const modulesQuery = query(collection(db, 'learningPaths', activeId, 'modules'), orderBy('order', 'asc'));
      const unsubscribeModules = onSnapshot(modulesQuery, async (modulesSnapshot) => {
        const modulesList: DayModule[] = [];

        for (const moduleDoc of modulesSnapshot.docs) {
          const moduleData = moduleDoc.data();
          
          // Cargar lecciones por módulo (subcolección lessons)
          const lessonsQuery = query(collection(db, 'learningPaths', activeId, 'modules', moduleDoc.id, 'lessons'), orderBy('order', 'asc'));
          const lessonsSnapshot = await getDocs(lessonsQuery);
          
          const lessonsList = lessonsSnapshot.docs.map(lessonDoc => {
            const lessonData = lessonDoc.data();
            // Determinar si el estudiante actual ya completó esta lección
            const progress = this.myLessonProgress().find(p => p.lessonId === lessonDoc.id);
            return {
              id: lessonDoc.id,
              ...lessonData,
              isCompleted: progress ? progress.isCompleted : false,
              isLocked: false // Lógica de bloqueo personalizable
            } as Lesson;
          });

          // Calcular lecciones completadas en este módulo
          const completedCount = lessonsList.filter(l => l.isCompleted).length;

          modulesList.push({
            id: moduleDoc.id,
            dayNumber: moduleData['dayNumber'] || 1,
            title: moduleData['title'] || '',
            startDate: moduleData['startDate'] || 'Disponible',
            totalLessons: lessonsList.length,
            completedLessons: completedCount,
            isLocked: moduleData['isLocked'] || false,
            description: moduleData['description'] || '',
            lessons: lessonsList
          });
        }

        this.activePathDetails.set(modulesList);
      });

      return () => {
        unsubscribeModules();
      };
    });

    // 5. Reactividad de comentarios en tiempo real para la lección activa
    effect(() => {
      const activeLesson = this.activeLesson();
      if (!activeLesson) {
        this.activeLessonComments.set([]);
        return;
      }

      // Escuchar discusiones asociadas a esta lección
      const discussionsQuery = query(
        collection(db, 'discussions'),
        where('lessonId', '==', activeLesson.id),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeDiscussions = onSnapshot(discussionsQuery, (snapshot) => {
        const list = snapshot.docs.map(dDoc => {
          const data = dDoc.data();
          const userId = data['authorId'];
          
          // Mapear discusiones de Firestore al formato CommentThread esperado en la UI
          return {
            id: dDoc.id,
            lessonId: data['lessonId'],
            authorName: data['authorName'],
            authorAvatar: data['authorAvatar'],
            authorRole: data['authorRole'] === 'STUDENT' ? 'Estudiante' : data['authorRole'] === 'INSTRUCTOR' ? 'Profesor' : 'Superadmin',
            content: data['content'],
            likesCount: data['likesCount'] || 0,
            isUserLiked: data['likedBy']?.includes(this.authService.currentUser()?.id || '') || false,
            replies: data['replies'] || [], // Cargar respuestas desde Firestore
            likedBy: data['likedBy'] || [],
            createdAt: data['createdAt']
          } as CommentThread;
        });

        this.activeLessonComments.set(list);
      });

      return () => {
        unsubscribeDiscussions();
      };
    });
  }

  selectPath(pathId: string): void {
    this.activePathId.set(pathId);
  }

  selectDay(dayNumber: number): void {
    this.selectedDayNumber.set(dayNumber);
  }

  selectLesson(lessonId: string): void {
    this.activeLessonId.set(lessonId);
  }

  async toggleLessonCompletion(lessonId: string): Promise<void> {
    const user = this.authService.currentUser();
    const activePath = this.activePath();
    const activeDay = this.selectedDay();
    if (!user || !activePath || !activeDay) return;

    const progressDocId = `${user.id}_${lessonId}`;
    const progressRef = doc(db, 'lessonProgress', progressDocId);

    // Buscar si ya existe el progreso
    const currentProgress = this.myLessonProgress().find(p => p.lessonId === lessonId);
    const isCompleted = currentProgress ? !currentProgress.isCompleted : true;

    // 1. Guardar el progreso en Firestore
    await setDoc(progressRef, {
      id: progressDocId,
      userId: user.id,
      lessonId: lessonId,
      pathId: activePath.id,
      moduleId: activeDay.id,
      isCompleted: isCompleted,
      completedAt: isCompleted ? Timestamp.now() : null
    }, { merge: true });

    // 2. Calcular y actualizar el porcentaje global de progreso en la inscripción (enrollment)
    // Obtener todas las lecciones de la ruta actual
    const allPathLessonsQuery = query(collection(db, 'learningPaths', activePath.id, 'modules'));
    const modulesSnapshot = await getDocs(allPathLessonsQuery);
    
    let totalLessonsCount = 0;
    for (const mDoc of modulesSnapshot.docs) {
      const lQuery = collection(db, 'learningPaths', activePath.id, 'modules', mDoc.id, 'lessons');
      const lSnapshot = await getDocs(lQuery);
      totalLessonsCount += lSnapshot.size;
    }

    if (totalLessonsCount > 0) {
      // Contar lecciones completadas reales en esta ruta
      const pathCompletedQuery = query(
        collection(db, 'lessonProgress'),
        where('userId', '==', user.id),
        where('pathId', '==', activePath.id),
        where('isCompleted', '==', true)
      );
      const completedSnapshot = await getDocs(pathCompletedQuery);
      const completedCount = completedSnapshot.size;
      
      const newPercentage = Math.round((completedCount / totalLessonsCount) * 100);

      // Actualizar el documento de inscripción
      const enrollmentDocId = `${user.id}_${activePath.id}`;
      await updateDoc(doc(db, 'enrollments', enrollmentDocId), {
        progressPercentage: newPercentage
      });
    }
  }

  async addComment(lessonId: string, content: string, authorName: string, authorAvatar: string): Promise<void> {
    const user = this.authService.currentUser();
    const activePath = this.activePath();
    if (!user || !activePath) return;

    const newDiscussion = {
      lessonId,
      pathId: activePath.id,
      authorId: user.id,
      authorName,
      authorAvatar,
      authorRole: user.role,
      content,
      likesCount: 0,
      likedBy: [],
      createdAt: Timestamp.now()
    };

    await addDoc(collection(db, 'discussions'), newDiscussion);
  }

  async toggleLikeComment(commentId: string): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    const commentRef = doc(db, 'discussions', commentId);
    const comments = this.activeLessonComments();
    const target = comments.find(c => c.id === commentId);
    if (!target) return;

    const likedBy = target.likedBy ? [...target.likedBy] : [];
    const index = likedBy.indexOf(user.id);
    
    if (index > -1) {
      likedBy.splice(index, 1);
    } else {
      likedBy.push(user.id);
    }

    await updateDoc(commentRef, {
      likedBy,
      likesCount: likedBy.length
    });
  }

  async enrollInPath(pathId: string): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    const enrollmentId = `${user.id}_${pathId}`;
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);

    await setDoc(enrollmentRef, {
      id: enrollmentId,
      userId: user.id,
      pathId: pathId,
      enrolledAt: Timestamp.now(),
      progressPercentage: 0,
      status: 'active'
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
    const user = this.authService.currentUser();
    const courseId = `course_${Date.now()}`;
    const pathId = `path_${Date.now()}`;

    const newCourse: Course = {
      id: courseId,
      title: courseData.title,
      description: courseData.description,
      instructorId: user?.id || '',
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
      days: [] as DayModule[]
    };

    // Escribir en Firestore de forma asíncrona
    setDoc(doc(db, 'courses', courseId), newCourse).catch(err => console.error(err));
    setDoc(doc(db, 'learningPaths', pathId), newPath).catch(err => console.error(err));

    // Actualizar señales de forma síncrona para compatibilidad (Optimistic UI)
    this.coursesCatalog.update(courses => [...courses, newCourse]);
    this.allLearningPaths.update(paths => [...paths, newPath]);

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
    const moduleId = `mod_day${lessonData.dayNumber}_${Date.now()}`;
    const lessonId = `les_${Date.now()}`;

    const moduleRef = doc(db, 'learningPaths', pathId, 'modules', moduleId);
    const lessonRef = doc(db, 'learningPaths', pathId, 'modules', moduleId, 'lessons', lessonId);

    // Escribir/actualizar módulo
    setDoc(moduleRef, {
      id: moduleId,
      dayNumber: lessonData.dayNumber,
      title: `DÍA ${lessonData.dayNumber} • Temas`,
      startDate: 'Disponible ahora',
      totalLessons: 1,
      completedLessons: 0,
      isLocked: false,
      description: 'Módulo creado desde el panel.',
      order: lessonData.dayNumber
    }, { merge: true }).catch(err => console.error(err));

    // Escribir lección
    setDoc(lessonRef, {
      id: lessonId,
      title: lessonData.title,
      durationMinutes: lessonData.durationMinutes,
      type: lessonData.type,
      videoUrl: lessonData.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isCompleted: false,
      isLocked: false,
      summary: lessonData.summary || '',
      resourceName: lessonData.resourceName || ''
    }).catch(err => console.error(err));

    // Actualizar las horas del curso
    updateDoc(doc(db, 'courses', courseId), {
      durationHours: course.durationHours + Math.ceil(lessonData.durationMinutes / 60)
    }).catch(err => console.error(err));
  }

  async addReply(commentId: string, reply: {
    authorName: string;
    authorAvatar: string;
    authorRole: string;
    content: string;
  }): Promise<void> {
    const commentRef = doc(db, 'discussions', commentId);
    const target = this.activeLessonComments().find(c => c.id === commentId);
    if (!target) return;
    const replies = [...(target.replies || []), {
      id: `rep_${Date.now()}`,
      authorName: reply.authorName,
      authorAvatar: reply.authorAvatar,
      authorRole: reply.authorRole,
      timeAgo: 'Justo ahora',
      content: reply.content,
      likesCount: 0,
      isUserLiked: false
    }];
    await updateDoc(commentRef, { replies });
  }
}
