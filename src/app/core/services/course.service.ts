import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Course, LearningPath, DayModule, Lesson } from '../models/course.model';
import { CommentThread, Enrollment, LessonProgress, Discussion } from '../models/discussion.model';
import { db } from '../firebase/firebase';
import { AuthService } from './auth.service';
import { slugify, matchSlug } from '../../shared/utils/slug.utils';
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
  setDoc,
  increment,
  deleteDoc
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

  // Rutas de aprendizaje en las que el usuario está inscrito (o todas si es Admin/Profesor)
  readonly learningPaths = computed(() => {
    const user = this.authService.currentUser();
    const paths = this.allLearningPaths();
    const enrollments = this.myEnrollments();

    if (!user) return paths;
    if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
      return paths;
    }

    // Para estudiantes: ÚNICAMENTE las rutas en las que está efectivamente matriculado
    const studentEnrolledPaths: LearningPath[] = [];
    for (const enrollment of enrollments) {
      if (enrollment.status === 'revoked') continue;
      const path = paths.find(p => p.id === enrollment.pathId);
      if (path) {
        studentEnrolledPaths.push({
          ...path,
          progressPercentage: enrollment.progressPercentage || 0
        });
      }
    }
    return studentEnrolledPaths;
  });

  // Lista detallada de cursos inscritos para el estudiante
  readonly enrolledCourses = computed(() => {
    const enrollments = this.myEnrollments();
    const catalog = this.coursesCatalog();

    return enrollments
      .filter(e => e.status !== 'revoked')
      .map(enrollment => {
        const course = catalog.find(c => c.learningPathId === enrollment.pathId);
        return {
          enrollment,
          course: course || null,
          progressPercentage: enrollment.progressPercentage || 0,
          status: enrollment.status
        };
      })
      .filter(item => item.course !== null) as Array<{
        enrollment: Enrollment;
        course: Course;
        progressPercentage: number;
        status: string;
      }>;
  });

  isEnrolledInCourse(courseId: string): boolean {
    const course = this.coursesCatalog().find(c => c.id === courseId);
    if (!course) return false;
    return this.myEnrollments().some(e => e.pathId === course.learningPathId && e.status !== 'revoked');
  }

  isEnrolledInPath(pathId: string): boolean {
    return this.myEnrollments().some(e => e.pathId === pathId && e.status !== 'revoked');
  }

  readonly activePathId = signal<string | null>(null);
  readonly selectedDayNumber = signal<number>(1);
  readonly activeLessonId = signal<string | null>(null);

  // Estructura de módulos/lecciones cargados dinámicamente para la ruta activa
  readonly activePathDetails = signal<DayModule[]>([]);

  readonly activePath = computed<LearningPath | null>(() => {
    const paths = this.learningPaths();
    const activeId = this.activePathId();
    const path = activeId ? paths.find(p => p.id === activeId) : (paths[0] || null);
    if (!path) {
      if (activeId) {
        const course = this.coursesCatalog().find(c => c.learningPathId === activeId);
        return {
          id: activeId,
          title: course?.title || 'Aula Virtual',
          subtitle: course?.description || '',
          badge: course?.level || 'PRO',
          totalModules: this.activePathDetails().length || 1,
          totalSessions: this.activePathDetails().reduce((sum, d) => sum + (d.lessons?.length || 0), 0) || 1,
          progressPercentage: 0,
          days: this.activePathDetails()
        };
      }
      return null;
    }

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
        where('lessonId', '==', activeLesson.id)
      );

      const unsubscribeDiscussions = onSnapshot(discussionsQuery, (snapshot) => {
        const list = snapshot.docs.map(dDoc => {
          const data = dDoc.data();
          return {
            id: dDoc.id,
            lessonId: data['lessonId'],
            authorName: data['authorName'],
            authorAvatar: data['authorAvatar'],
            authorRole: data['authorRole'] === 'STUDENT' ? 'Estudiante' : data['authorRole'] === 'INSTRUCTOR' ? 'Profesor' : 'Superadmin',
            content: data['content'],
            likesCount: data['likesCount'] || 0,
            isUserLiked: data['likedBy']?.includes(this.authService.currentUser()?.id || '') || false,
            replies: data['replies'] || [],
            likedBy: data['likedBy'] || [],
            createdAt: data['createdAt']
          } as CommentThread;
        }).sort((a, b) => {
          const tA = (a.createdAt as any)?.toMillis?.() || (a.createdAt as any)?.seconds || 0;
          const tB = (b.createdAt as any)?.toMillis?.() || (b.createdAt as any)?.seconds || 0;
          return tB - tA;
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

  // Buscar LearningPath o Curso por ID o por Slug legible (ej: "angular-21" o "path_1788128453167")
  resolvePathId(slugOrId?: string | null): string | null {
    if (!slugOrId) return null;
    const clean = slugOrId.trim();

    // 1. Coincidencia exacta con ID de ruta
    const directPath = this.allLearningPaths().find(p => p.id === clean);
    if (directPath) return directPath.id;

    // 2. Coincidencia con ID de curso o learningPathId
    const directCourse = this.coursesCatalog().find(c => c.id === clean || c.learningPathId === clean);
    if (directCourse) return directCourse.learningPathId || directCourse.id;

    // 3. Coincidencia por Slug de título de curso (ej: "angular-21" -> "Angular 21")
    const matchedCourse = this.coursesCatalog().find(c => matchSlug(c.title, clean));
    if (matchedCourse) return matchedCourse.learningPathId || matchedCourse.id;

    // 4. Coincidencia por Slug de título de ruta
    const matchedPath = this.allLearningPaths().find(p => matchSlug(p.title, clean));
    if (matchedPath) return matchedPath.id;

    return clean;
  }

  // Buscar lección por ID o por Slug dentro de una ruta (ej: "configuracion-del-entorno")
  resolveLessonId(path: LearningPath | null, lessonSlugOrId?: string | null): string | null {
    if (!lessonSlugOrId || !path || !path.days) return null;
    const clean = lessonSlugOrId.trim();

    const allLessons = path.days.flatMap(d => d.lessons || []);
    // 1. Coincidencia exacta por ID
    const directLesson = allLessons.find(l => l.id === clean);
    if (directLesson) return directLesson.id;

    // 2. Coincidencia por Slug de título de lección
    const matchedLesson = allLessons.find(l => matchSlug(l.title, clean));
    if (matchedLesson) return matchedLesson.id;

    return null;
  }

  // Obtener el slug legible para una ruta o curso
  getPathSlug(pathOrCourseId?: string | null): string {
    if (!pathOrCourseId) return '';
    const course = this.coursesCatalog().find(c => c.id === pathOrCourseId || c.learningPathId === pathOrCourseId);
    if (course) return slugify(course.title);

    const path = this.allLearningPaths().find(p => p.id === pathOrCourseId);
    if (path) return slugify(path.title);

    return slugify(pathOrCourseId);
  }

  // Obtener el slug legible para una lección
  getLessonSlug(lesson?: Lesson | null): string {
    if (!lesson) return '';
    return slugify(lesson.title);
  }

  // Obtener el slug legible para un módulo
  getModuleSlug(module?: DayModule | { dayNumber?: number; title?: string } | null): string {
    if (!module) return 'modulo-1';
    const title = (module.title || '').trim();
    if (/^m[oó]dulo/i.test(title)) {
      return slugify(title);
    }
    return slugify(`modulo-${module.dayNumber || 1}-${title}`);
  }

  // Buscar módulo por ID o por Slug dentro de una ruta
  resolveModuleId(path: LearningPath | null, moduleSlugOrId?: string | null): string | null {
    if (!moduleSlugOrId || !path || !path.days) return null;
    const clean = moduleSlugOrId.trim();

    // 1. Coincidencia exacta por ID
    const directModule = path.days.find(d => d.id === clean);
    if (directModule) return directModule.id;

    // 2. Coincidencia por Slug de título
    const matchedModule = path.days.find(d => matchSlug(this.getModuleSlug(d), clean) || matchSlug(d.title, clean));
    if (matchedModule) return matchedModule.id;

    return null;
  }

  async toggleLessonCompletion(lessonId: string): Promise<void> {
    const user = this.authService.currentUser();
    const activePath = this.activePath();
    const activeDay = this.selectedDay();
    if (!user || !activePath) return;

    const progressDocId = `${user.id}_${lessonId}`;
    const progressRef = doc(db, 'lessonProgress', progressDocId);

    // Buscar si ya existe el progreso
    const currentProgress = this.myLessonProgress().find(p => p.lessonId === lessonId);
    const isCompleted = currentProgress ? !currentProgress.isCompleted : true;

    // Actualizar señal local inmediatamente para reactividad instantánea
    this.myLessonProgress.update(prev => {
      const idx = prev.findIndex(p => p.lessonId === lessonId);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], isCompleted, completedAt: Timestamp.now() };
        return copy;
      }
      return [...prev, {
        id: progressDocId,
        userId: user.id,
        lessonId: lessonId,
        pathId: activePath.id,
        moduleId: activeDay?.id || '',
        isCompleted: isCompleted,
        completedAt: Timestamp.now()
      }];
    });

    // 1. Guardar el progreso en Firestore
    await setDoc(progressRef, {
      id: progressDocId,
      userId: user.id,
      lessonId: lessonId,
      pathId: activePath.id,
      moduleId: activeDay?.id || '',
      isCompleted: isCompleted,
      completedAt: isCompleted ? Timestamp.now() : null
    }, { merge: true });

    // 2. Calcular y actualizar el porcentaje global de progreso en la inscripción (enrollment)
    try {
      const allPathLessonsQuery = query(collection(db, 'learningPaths', activePath.id, 'modules'));
      const modulesSnapshot = await getDocs(allPathLessonsQuery);
      
      let totalLessonsCount = 0;
      for (const mDoc of modulesSnapshot.docs) {
        const lQuery = collection(db, 'learningPaths', activePath.id, 'modules', mDoc.id, 'lessons');
        const lSnapshot = await getDocs(lQuery);
        totalLessonsCount += lSnapshot.size;
      }

      if (totalLessonsCount > 0) {
        const pathCompletedQuery = query(
          collection(db, 'lessonProgress'),
          where('userId', '==', user.id),
          where('pathId', '==', activePath.id),
          where('isCompleted', '==', true)
        );
        const completedSnapshot = await getDocs(pathCompletedQuery);
        const completedCount = completedSnapshot.size;
        
        const newPercentage = Math.round((completedCount / totalLessonsCount) * 100);

        // Actualizar el documento de inscripción con setDoc (merge) seguro
        const enrollmentDocId = `${user.id}_${activePath.id}`;
        await setDoc(doc(db, 'enrollments', enrollmentDocId), {
          userId: user.id,
          pathId: activePath.id,
          progressPercentage: newPercentage,
          status: 'active',
          updatedAt: Timestamp.now()
        }, { merge: true });

        // Actualizar señal local de inscripciones
        this.myEnrollments.update(enrollments => {
          const idx = enrollments.findIndex(e => e.pathId === activePath.id);
          if (idx > -1) {
            const copy = [...enrollments];
            copy[idx] = { ...copy[idx], progressPercentage: newPercentage };
            return copy;
          }
          return enrollments;
        });
      }
    } catch (err) {
      console.warn('Progreso guardado pero no se pudo recalcular porcentaje de inscripción:', err);
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

    // Incrementar contador de alumnos en el curso correspondiente si existe
    const targetCourse = this.coursesCatalog().find(c => c.learningPathId === pathId);
    if (targetCourse) {
      const courseRef = doc(db, 'courses', targetCourse.id);
      await updateDoc(courseRef, {
        studentsCount: increment(1)
      }).catch(err => console.error('Error actualizando contador de alumnos del curso:', err));
    }
  }

  async addCourseReview(courseId: string, rating: number, comment: string): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    const reviewDocRef = doc(db, 'courses', courseId, 'reviews', user.id);
    await setDoc(reviewDocRef, {
      id: user.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating: Math.min(5, Math.max(1, rating)),
      comment: comment.trim(),
      createdAt: Timestamp.now()
    }, { merge: true });

    // Recalcular rating promedio ponderado del curso
    const reviewsSnapshot = await getDocs(collection(db, 'courses', courseId, 'reviews'));
    if (reviewsSnapshot.size > 0) {
      const allRatings = reviewsSnapshot.docs.map(d => (d.data()['rating'] as number) || 5);
      const sum = allRatings.reduce((acc, curr) => acc + curr, 0);
      const avgRating = Number((sum / allRatings.length).toFixed(1));
      
      await updateDoc(doc(db, 'courses', courseId), {
        rating: avgRating,
        reviewsCount: reviewsSnapshot.size
      }).catch(err => console.error('Error actualizando rating promedio del curso:', err));
    }
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
      rating: 0.0,
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

  async saveFullCourseWithCurriculum(params: {
    courseId?: string | null;
    title: string;
    description: string;
    category: string;
    level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos los niveles';
    price: number;
    thumbnail?: string;
    modules: Array<{
      order: number;
      title: string;
      description?: string;
      lessons: Array<{
        title: string;
        durationMinutes: number;
        description?: string;
        summary?: string;
        resourceName?: string;
        resourceUrl?: string;
        videoUrl?: string;
        videoFileName?: string;
      }>;
    }>;
  }): Promise<string> {
    const user = this.authService.currentUser();
    const isEdit = !!params.courseId;
    const existingCourse = isEdit ? this.coursesCatalog().find(c => c.id === params.courseId) : null;
    
    const courseId = params.courseId || `course_${Date.now()}`;
    const pathId = existingCourse?.learningPathId || `path_${Date.now()}`;

    // Calcular duración total en horas
    const totalMinutes = params.modules.reduce((sum, m) => {
      return sum + m.lessons.reduce((lSum, l) => lSum + (l.durationMinutes || 10), 0);
    }, 0);
    const durationHours = Math.max(1, Math.ceil(totalMinutes / 60));

    const defaultThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80';

    const courseData: Course = {
      id: courseId,
      title: params.title,
      description: params.description,
      instructorId: existingCourse?.instructorId || user?.id || '',
      instructorName: existingCourse?.instructorName || user?.name || 'Profesor TokiDev',
      instructorTitle: existingCourse?.instructorTitle || 'Especialista / Mentor',
      instructorAvatar: existingCourse?.instructorAvatar || user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      rating: existingCourse?.rating || 0.0,
      reviewsCount: existingCourse?.reviewsCount || 0,
      studentsCount: existingCourse?.studentsCount || 0,
      thumbnail: params.thumbnail || existingCourse?.thumbnail || defaultThumb,
      category: params.category,
      level: params.level,
      durationHours: durationHours,
      learningPathId: pathId,
      isFeatured: existingCourse?.isFeatured || false,
      price: params.price
    };

    const builtDays: DayModule[] = [];

    // Guardar documento del curso en Firestore
    await setDoc(doc(db, 'courses', courseId), courseData);
    
    // Guardar módulos y lecciones en Firestore
    for (let mIdx = 0; mIdx < params.modules.length; mIdx++) {
      const mod = params.modules[mIdx];
      const moduleId = `mod_${pathId}_${mIdx + 1}`;
      const moduleRef = doc(db, 'learningPaths', pathId, 'modules', moduleId);

      const builtLessons: Lesson[] = [];

      for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
        const les = mod.lessons[lIdx];
        const lessonId = `les_${moduleId}_${lIdx + 1}`;
        const lessonRef = doc(db, 'learningPaths', pathId, 'modules', moduleId, 'lessons', lessonId);

        const lessonPayload: Lesson = {
          id: lessonId,
          title: les.title || `Clase ${lIdx + 1}`,
          durationMinutes: les.durationMinutes || 10,
          type: les.videoUrl ? 'VIDEO' : 'HTML',
          videoUrl: les.videoUrl || '',
          resourceUrl: les.resourceUrl || '',
          isCompleted: false,
          isLocked: false,
          summary: les.description || les.summary || '',
          resourceName: les.resourceName || ''
        };

        await setDoc(lessonRef, { ...lessonPayload, order: lIdx + 1 });
        builtLessons.push(lessonPayload);
      }

      const dayModulePayload: DayModule = {
        id: moduleId,
        dayNumber: mIdx + 1,
        title: mod.title || `Módulo ${mIdx + 1}`,
        startDate: 'Disponible ahora',
        totalLessons: builtLessons.length,
        completedLessons: 0,
        isLocked: false,
        description: mod.description || '',
        lessons: builtLessons
      };

      await setDoc(moduleRef, {
        id: moduleId,
        dayNumber: mIdx + 1,
        title: mod.title || `Módulo ${mIdx + 1}`,
        startDate: 'Disponible ahora',
        totalLessons: builtLessons.length,
        completedLessons: 0,
        isLocked: false,
        description: mod.description || '',
        order: mIdx + 1
      });

      builtDays.push(dayModulePayload);
    }

    const pathData: LearningPath = {
      id: pathId,
      title: params.title,
      subtitle: params.description,
      badge: 'Nuevo',
      progressPercentage: 0,
      totalModules: builtDays.length,
      totalSessions: builtDays.reduce((acc, d) => acc + d.lessons.length, 0),
      days: builtDays
    };

    await setDoc(doc(db, 'learningPaths', pathId), {
      id: pathId,
      title: params.title,
      subtitle: params.description,
      badge: 'Nuevo',
      progressPercentage: 0,
      totalModules: builtDays.length,
      totalSessions: builtDays.reduce((acc, d) => acc + d.lessons.length, 0)
    });

    // Actualización optimista de señales
    this.coursesCatalog.update(courses => {
      const idx = courses.findIndex(c => c.id === courseId);
      if (idx >= 0) {
        const copy = [...courses];
        copy[idx] = courseData;
        return copy;
      }
      return [courseData, ...courses];
    });

    this.allLearningPaths.update(paths => {
      const idx = paths.findIndex(p => p.id === pathId);
      if (idx >= 0) {
        const copy = [...paths];
        copy[idx] = pathData;
        return copy;
      }
      return [pathData, ...paths];
    });

    this.activePathId.set(pathId);
    this.activePathDetails.set(builtDays);

    return courseId;
  }

  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<void> {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, courseData);
    
    // Si se actualizó título o descripción, sincronizar con la LearningPath
    const course = this.coursesCatalog().find(c => c.id === courseId);
    if (course && (courseData.title || courseData.description)) {
      const pathRef = doc(db, 'learningPaths', course.learningPathId);
      await updateDoc(pathRef, {
        ...(courseData.title ? { title: courseData.title } : {}),
        ...(courseData.description ? { subtitle: courseData.description } : {})
      }).catch(err => console.error('Error sincronizando learningPath:', err));
    }

    // Optimistic UI update
    this.coursesCatalog.update(courses =>
      courses.map(c => c.id === courseId ? { ...c, ...courseData } : c)
    );
  }

  async deleteCourse(courseId: string): Promise<void> {
    const course = this.coursesCatalog().find(c => c.id === courseId);
    if (course) {
      await deleteDoc(doc(db, 'courses', courseId));
      if (course.learningPathId) {
        await deleteDoc(doc(db, 'learningPaths', course.learningPathId)).catch(err => console.error(err));
      }
    }
    // Optimistic UI update
    this.coursesCatalog.update(courses => courses.filter(c => c.id !== courseId));
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

  async updateEnrollmentStatus(enrollmentId: string, status: 'active' | 'blocked'): Promise<void> {
    await updateDoc(doc(db, 'enrollments', enrollmentId), {
      status
    });
  }

  async unenrollStudent(enrollmentId: string, courseId?: string): Promise<void> {
    await deleteDoc(doc(db, 'enrollments', enrollmentId));
    if (courseId) {
      await updateDoc(doc(db, 'courses', courseId), {
        studentsCount: increment(-1)
      }).catch(err => console.error(err));
      
      this.coursesCatalog.update(courses => courses.map(c => {
        if (c.id === courseId) {
          return { ...c, studentsCount: Math.max(0, (c.studentsCount || 1) - 1) };
        }
        return c;
      }));
    }
  }
}
