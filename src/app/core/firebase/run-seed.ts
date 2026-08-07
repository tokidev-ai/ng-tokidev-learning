/**
 * Script ejecutable en Node.js para correr el Seed de Firestore y crear usuarios en Firebase Auth.
 * Se ejecuta con: npx tsx --env-file=.env src/app/core/firebase/run-seed.ts
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// 1. Obtener configuración del entorno (inyectada por --env-file=.env)
const firebaseConfig = {
  apiKey:            process.env['NG_APP_FIREBASE_API_KEY'],
  authDomain:        process.env['NG_APP_FIREBASE_AUTH_DOMAIN'],
  projectId:         process.env['NG_APP_FIREBASE_PROJECT_ID'],
  storageBucket:     process.env['NG_APP_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: process.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'],
  appId:             process.env['NG_APP_FIREBASE_APP_ID'],
  measurementId:     process.env['NG_APP_FIREBASE_MEASUREMENT_ID']
};

console.log('Using config for project:', firebaseConfig.projectId);

if (!firebaseConfig.projectId || firebaseConfig.projectId.includes('TU_PROJECT_ID')) {
  console.error('❌ Error: El PROJECT_ID no está definido en el archivo .env o contiene valores de plantilla.');
  process.exit(1);
}

// 2. Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Cuentas de prueba con contraseña por defecto
const DEFAULT_PASSWORD = 'password123';

const usersToCreate = [
  {
    email: 'ivan@tokidev.io',
    name: 'Iván TokiDev',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    extra: {}
  },
  {
    email: 'lorenley@tokidev.io',
    name: 'Lorenley Martínez',
    role: 'INSTRUCTOR',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    extra: {
      bio: 'Full Stack Developer con 8 años de experiencia en Angular y Firebase.',
      title: 'Full Stack Developer & Educator',
      specialties: ['Angular', 'Firebase', 'TypeScript', 'UX']
    }
  },
  {
    email: 'rodrigo@tokidev.io',
    name: 'Rodrigo TokiDev',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    extra: {
      activePathId: 'path_angular_firebase',
      streakDays: 7,
      completedLessonsCount: 4,
      inProgressCount: 1,
      averageProgressScore: 35
    }
  }
];

async function getOrCreateAuthUser(email: string, name: string): Promise<string> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);
    console.log(`👤 Creado en Firebase Auth: ${email} (UID: ${cred.user.uid})`);
    return cred.user.uid;
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);
      console.log(`👤 Ya existía en Firebase Auth: ${email} (UID: ${cred.user.uid})`);
      return cred.user.uid;
    }
    throw err;
  }
}

async function run() {
  console.log('🌱 Iniciando seed de Firestore y Auth desde la terminal...');
  
  const resolvedUsers: { [key: string]: string } = {};

  // 1. Crear/Autenticar todos los usuarios en Auth
  try {
    for (const u of usersToCreate) {
      resolvedUsers[u.role] = await getOrCreateAuthUser(u.email, u.name);
      await signOut(auth); // Desloguearse para el siguiente ciclo
    }
  } catch (authErr: any) {
    console.error('❌ Error configurando usuarios en Firebase Auth:');
    console.error(authErr.message || authErr);
    process.exit(1);
  }

  const ADMIN_UID = resolvedUsers['ADMIN'];
  const INSTRUCTOR_UID = resolvedUsers['INSTRUCTOR'];
  const STUDENT_UID = resolvedUsers['STUDENT'];

  const PATH_ID      = 'path_angular_firebase';
  const COURSE_ID    = 'course_angular_firebase';
  const MODULE_1_ID  = 'module_day1';
  const LESSON_1_ID  = 'lesson_intro';
  const LESSON_2_ID  = 'lesson_firestore';
  const ENROLLMENT_ID = `${STUDENT_UID}_${PATH_ID}`;

  const batch = writeBatch(db);
  const now = Timestamp.now();

  // --- Escribir perfiles de usuarios a Firestore ---
  const admin = {
    id: ADMIN_UID,
    name: 'Iván TokiDev',
    email: 'ivan@tokidev.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'ADMIN',
    createdAt: now,
  };

  const instructor = {
    id: INSTRUCTOR_UID,
    name: 'Lorenley Martínez',
    email: 'lorenley@tokidev.io',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    role: 'INSTRUCTOR',
    bio: 'Full Stack Developer con 8 años de experiencia en Angular y Firebase.',
    title: 'Full Stack Developer & Educator',
    specialties: ['Angular', 'Firebase', 'TypeScript', 'UX'],
    createdAt: now,
  };

  const student = {
    id: STUDENT_UID,
    name: 'Rodrigo TokiDev',
    email: 'rodrigo@tokidev.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'STUDENT',
    activePathId: PATH_ID,
    streakDays: 7,
    completedLessonsCount: 4,
    inProgressCount: 1,
    averageProgressScore: 35,
    createdAt: now,
  };

  batch.set(doc(db, 'users', ADMIN_UID), admin);
  batch.set(doc(db, 'users', INSTRUCTOR_UID), instructor);
  batch.set(doc(db, 'users', STUDENT_UID), student);

  // --- Learning Path ---
  const learningPath = {
    id: PATH_ID,
    title: 'Angular + Firebase desde Cero',
    subtitle: 'Aprende a construir aplicaciones full stack con Angular y Firebase',
    badge: 'Ruta Destacada',
    totalModules: 2,
    totalSessions: 1,
    progressPercentage: 0,
    days: [],
    createdAt: now,
  };

  batch.set(doc(db, 'learningPaths', PATH_ID), learningPath);

  // --- Módulos ---
  const module1 = {
    id: MODULE_1_ID,
    dayNumber: 1,
    title: 'DÍA 1 • Introducción y Setup',
    startDate: 'Disponible ahora',
    totalLessons: 2,
    completedLessons: 0,
    isLocked: false,
    lessons: [],
    description: 'Configuramos el proyecto Angular y conectamos Firebase.',
    order: 1,
  };

  batch.set(doc(db, 'learningPaths', PATH_ID, 'modules', MODULE_1_ID), module1);

  // --- Lecciones ---
  const lesson1 = {
    id: LESSON_1_ID,
    title: 'Introducción a Angular y Firebase',
    durationMinutes: 15,
    type: 'VIDEO',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    summary: 'Visión general del stack Angular + Firebase y lo que construiremos.',
    isCompleted: false,
    isLocked: false,
    order: 1,
  };

  const lesson2 = {
    id: LESSON_2_ID,
    title: 'Conectando Firestore al proyecto',
    durationMinutes: 20,
    type: 'HTML',
    summary: 'Instalamos el SDK de Firebase y configuramos la conexión con Firestore.',
    isCompleted: false,
    isLocked: false,
    order: 2,
  };

  batch.set(doc(db, 'learningPaths', PATH_ID, 'modules', MODULE_1_ID, 'lessons', LESSON_1_ID), lesson1);
  batch.set(doc(db, 'learningPaths', PATH_ID, 'modules', MODULE_1_ID, 'lessons', LESSON_2_ID), lesson2);

  // --- Curso ---
  const course = {
    id: COURSE_ID,
    title: 'Angular + Firebase: App Full Stack desde Cero',
    description: 'Aprende a construir una plataforma de aprendizaje completa con Angular 21 y Firebase.',
    instructorId: INSTRUCTOR_UID,
    instructorName: 'Lorenley Martínez',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    learningPathId: PATH_ID,
    category: 'Desarrollo Web',
    level: 'Intermedio',
    durationHours: 12,
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=400&q=80',
    rating: 5.0,
    reviewsCount: 0,
    studentsCount: 1,
    isFeatured: true,
    price: 0,
    createdAt: now,
  };

  batch.set(doc(db, 'courses', COURSE_ID), course);

  // --- Enrollment ---
  const enrollment = {
    id: ENROLLMENT_ID,
    userId: STUDENT_UID,
    pathId: PATH_ID,
    enrolledAt: now,
    progressPercentage: 0,
    status: 'active',
  };

  batch.set(doc(db, 'enrollments', ENROLLMENT_ID), enrollment);

  // 3. Commit
  try {
    await batch.commit();
    console.log('✅ Seed completado exitosamente en Firestore.');
    console.log('  Contraseña común para todos los usuarios: password123');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error ejecutando el batch de Firestore:');
    console.error(err.message || err);
    process.exit(1);
  }
}

run();
