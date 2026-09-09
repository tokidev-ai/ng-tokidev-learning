import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile, UserRole, InstructorApplication } from '../models/user.model';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { 
  Timestamp, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  Unsubscribe,
  addDoc,
  orderBy,
  query
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';

export interface InstructorRegistrationData {
  name: string;
  email: string;
  password: string;
  avatarFile?: File | null;
  phone?: string;
  title: string;
  experienceYears: number;
  specialties: string[];
  bio: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  courseProposal: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  private usersListenerUnsubscribe: Unsubscribe | null = null;
  private applicationsListenerUnsubscribe: Unsubscribe | null = null;

  readonly isLoggedIn = signal<boolean>(false);
  readonly currentUser = signal<UserProfile | null>(null);

  readonly users = signal<UserProfile[]>([]);
  readonly instructorApplications = signal<InstructorApplication[]>([]);

  readonly pendingApplicationsCount = computed(() => {
    return this.instructorApplications().filter(a => a.status === 'PENDING').length;
  });

  // Resolver que bloquea las guards hasta que Firebase Auth resuelva el estado inicial
  private resolveReady!: (value: UserProfile | null) => void;
  readonly isReady = new Promise<UserProfile | null>((resolve) => {
    this.resolveReady = resolve;
  });

  readonly currentRole = computed(() => this.currentUser()?.role || null);
  readonly isInstructor = computed(() => this.currentUser()?.role === 'INSTRUCTOR');
  readonly isStudent = computed(() => this.currentUser()?.role === 'STUDENT');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly isApplicationPending = computed(() => this.currentUser()?.instructorApplicationStatus === 'PENDING');
  readonly isApplicationRejected = computed(() => this.currentUser()?.instructorApplicationStatus === 'REJECTED');

  constructor() {
    // Escuchar cambios de autenticación
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener el perfil real de Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const profile = { id: userDoc.id, ...userDoc.data() } as UserProfile;
            this.currentUser.set(profile);
          } else {
            // Si el perfil no existe, crearlo como estudiante por defecto
            const defaultProfile: UserProfile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Estudiante Nuevo',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              role: 'STUDENT',
              activePathId: 'path_angular_firebase',
              streakDays: 0,
              createdAt: Timestamp.now(),
              completedLessonsCount: 0,
              inProgressCount: 0,
              averageProgressScore: 0
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), defaultProfile);
            this.currentUser.set(defaultProfile);
          }
          
          this.isLoggedIn.set(true);
          
          // Si el rol es ADMIN, escuchar la colección de usuarios y solicitudes en tiempo real
          if (this.currentUser()?.role === 'ADMIN') {
            this.startAdminListeners();
          }
          
          this.resolveReady(this.currentUser());
        } catch (err) {
          console.error('Error al cargar perfil de usuario desde Firestore:', err);
          this.resolveReady(null);
        }
      } else {
        this.stopAdminListeners();
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
        this.resolveReady(null);
      }
    });
  }

  async login(email: string, password: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (userDoc.exists()) {
      const profile = { id: userDoc.id, ...userDoc.data() } as UserProfile;
      this.currentUser.set(profile);
      this.isLoggedIn.set(true);
      return profile;
    }
    throw new Error('No se encontró el perfil de usuario en la base de datos.');
  }

  /** Registro normal como Estudiante: acceso directo e inmediato */
  async register(email: string, password: string, name: string): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const defaultProfile: UserProfile = {
      id: cred.user.uid,
      name: name,
      email: email,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      role: 'STUDENT',
      activePathId: 'path_angular_firebase',
      streakDays: 1,
      createdAt: Timestamp.now(),
      completedLessonsCount: 0,
      inProgressCount: 0,
      averageProgressScore: 0
    };
    await setDoc(doc(db, 'users', cred.user.uid), defaultProfile);
    this.currentUser.set(defaultProfile);
    this.isLoggedIn.set(true);
    return defaultProfile;
  }

  /** Registro como Postulante a Profesor: cuenta en espera de aprobación */
  async registerAsInstructorCandidate(data: InstructorRegistrationData): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    
    let avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.name)}`;
    if (data.avatarFile) {
      try {
        const path = `instructors/avatars/${cred.user.uid}_${Date.now()}_${data.avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        avatarUrl = await this.storageService.uploadFilePromise(path, data.avatarFile);
      } catch (uploadErr) {
        console.warn('No se pudo subir la foto del profesor a Firebase Storage, usando avatar por defecto:', uploadErr);
      }
    }
    
    // Perfil inicial con instructorApplicationStatus: 'PENDING'
    const candidateProfile: UserProfile = {
      id: cred.user.uid,
      name: data.name,
      email: data.email,
      avatar: avatarUrl,
      role: 'STUDENT',
      phone: data.phone || '',
      title: data.title,
      bio: data.bio,
      specialties: data.specialties,
      linkedinUrl: data.linkedinUrl || '',
      githubUrl: data.githubUrl || '',
      portfolioUrl: data.portfolioUrl || '',
      instructorApplicationStatus: 'PENDING',
      createdAt: Timestamp.now(),
      completedLessonsCount: 0,
      inProgressCount: 0,
      averageProgressScore: 0
    };

    // 1. Guardar perfil en 'users'
    await setDoc(doc(db, 'users', cred.user.uid), candidateProfile);

    // 2. Crear documento de postulación en 'instructorApplications'
    const applicationData: Omit<InstructorApplication, 'id'> = {
      userId: cred.user.uid,
      userName: data.name,
      userEmail: data.email,
      userAvatar: avatarUrl,
      phone: data.phone || '',
      title: data.title,
      experienceYears: data.experienceYears,
      specialties: data.specialties,
      bio: data.bio,
      linkedinUrl: data.linkedinUrl || '',
      githubUrl: data.githubUrl || '',
      portfolioUrl: data.portfolioUrl || '',
      courseProposal: data.courseProposal,
      status: 'PENDING',
      createdAt: Timestamp.now(),
      reviewedAt: null,
      reviewedBy: null,
      adminFeedback: ''
    };

    await addDoc(collection(db, 'instructorApplications'), applicationData);

    // 3. Crear notificación para Administradores
    await addDoc(collection(db, 'notifications'), {
      userId: 'ADMIN_ROLE',
      recipientRole: 'ADMIN',
      type: 'NEW_INSTRUCTOR_APPLY',
      title: '📋 Nueva postulación docente',
      message: `${data.name} (${data.email}) ha solicitado ser profesor de "${data.title}".`,
      link: '/admin/users',
      read: false,
      createdAt: Timestamp.now(),
      metadata: {
        applicantId: cred.user.uid,
        applicantName: data.name,
        applicantEmail: data.email,
        title: data.title
      }
    }).catch(err => console.warn('Error creando notificación de postulación:', err));

    this.currentUser.set(candidateProfile);
    this.isLoggedIn.set(true);
    return candidateProfile;
  }

  async logout(): Promise<void> {
    await signOut(auth);
    this.router.navigate(['/login']);
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
  }

  async updateUserStatus(userId: string, status: 'active' | 'disabled'): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { status });
  }

  /** Aprobación de postulación de profesor por el Administrador */
  async approveInstructorApplication(application: InstructorApplication): Promise<void> {
    const adminUser = this.currentUser();
    const now = Timestamp.now();

    // 1. Actualizar el estado de la solicitud en 'instructorApplications'
    await updateDoc(doc(db, 'instructorApplications', application.id), {
      status: 'APPROVED',
      reviewedAt: now,
      reviewedBy: adminUser?.id || 'admin',
      adminFeedback: 'Solicitud aprobada por el administrador.'
    });

    // 2. Promover al usuario en 'users' a rol INSTRUCTOR y pasar sus datos profesionales
    await updateDoc(doc(db, 'users', application.userId), {
      role: 'INSTRUCTOR',
      instructorApplicationStatus: 'APPROVED',
      title: application.title,
      bio: application.bio,
      specialties: application.specialties,
      linkedinUrl: application.linkedinUrl || '',
      githubUrl: application.githubUrl || '',
      portfolioUrl: application.portfolioUrl || '',
      adminFeedback: ''
    });

    // 3. Crear notificación para el postulante aprobado
    await addDoc(collection(db, 'notifications'), {
      userId: application.userId,
      recipientRole: 'INSTRUCTOR',
      type: 'INSTRUCTOR_APPROVED',
      title: '🎉 ¡Postulación Aprobada!',
      message: '¡Felicitaciones! Tu cuenta ha sido habilitada como Profesor TokiDev. Ya puedes publicar y gestionar tus cursos.',
      link: '/instructor',
      read: false,
      createdAt: now,
      metadata: {
        applicantName: application.userName
      }
    }).catch(err => console.warn('Error creando notificación de aprobación:', err));

    // Si el usuario actual es el afectado, actualizar la señal local
    if (this.currentUser()?.id === application.userId) {
      this.currentUser.update(curr => curr ? ({
        ...curr,
        role: 'INSTRUCTOR',
        instructorApplicationStatus: 'APPROVED',
        title: application.title,
        bio: application.bio,
        specialties: application.specialties,
        linkedinUrl: application.linkedinUrl || '',
        githubUrl: application.githubUrl || '',
        portfolioUrl: application.portfolioUrl || ''
      }) : null);
    }
  }

  /** Rechazo de postulación de profesor por el Administrador */
  async rejectInstructorApplication(applicationId: string, userId: string, feedback?: string): Promise<void> {
    const adminUser = this.currentUser();
    const now = Timestamp.now();
    const reason = feedback?.trim() || 'Tu perfil no cumple con los requisitos actuales de la plataforma.';

    // 1. Actualizar en 'instructorApplications'
    await updateDoc(doc(db, 'instructorApplications', applicationId), {
      status: 'REJECTED',
      reviewedAt: now,
      reviewedBy: adminUser?.id || 'admin',
      adminFeedback: reason
    });

    // 2. Actualizar en 'users'
    await updateDoc(doc(db, 'users', userId), {
      instructorApplicationStatus: 'REJECTED',
      adminFeedback: reason
    });

    // 3. Crear notificación para el postulante con el feedback
    await addDoc(collection(db, 'notifications'), {
      userId: userId,
      recipientRole: 'STUDENT',
      type: 'INSTRUCTOR_REJECTED',
      title: 'ℹ️ Estado de tu postulación docente',
      message: `Tu solicitud fue revisada: ${reason}`,
      link: '/instructor-application-status',
      read: false,
      createdAt: now,
      metadata: {
        feedback: reason
      }
    }).catch(err => console.warn('Error creando notificación de rechazo:', err));

    // Si el usuario actual es el afectado, actualizar la señal local
    if (this.currentUser()?.id === userId) {
      this.currentUser.update(curr => curr ? ({
        ...curr,
        instructorApplicationStatus: 'REJECTED',
        adminFeedback: reason
      }) : null);
    }
  }

  private startAdminListeners(): void {
    this.stopAdminListeners();

    // 1. Escuchar usuarios
    this.usersListenerUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
      this.users.set(list);
    });

    // 2. Escuchar solicitudes de profesores ordenadas por fecha
    const applicationsQuery = query(collection(db, 'instructorApplications'), orderBy('createdAt', 'desc'));
    this.applicationsListenerUnsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InstructorApplication));
      this.instructorApplications.set(list);
    }, (error) => {
      console.warn('Listener de solicitudes sin índice o permisos:', error);
      // Fallback a colección sin orderBy si faltase índice
      onSnapshot(collection(db, 'instructorApplications'), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as InstructorApplication));
        this.instructorApplications.set(list);
      });
    });
  }

  private stopAdminListeners(): void {
    if (this.usersListenerUnsubscribe) {
      this.usersListenerUnsubscribe();
      this.usersListenerUnsubscribe = null;
    }
    if (this.applicationsListenerUnsubscribe) {
      this.applicationsListenerUnsubscribe();
      this.applicationsListenerUnsubscribe = null;
    }
  }
}

