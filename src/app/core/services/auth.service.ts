import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile, UserRole } from '../models/user.model';
import { Router } from '@angular/router';
import { Timestamp, doc, getDoc, setDoc, updateDoc, collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private usersListenerUnsubscribe: Unsubscribe | null = null;

  readonly isLoggedIn = signal<boolean>(false);
  readonly currentUser = signal<UserProfile | null>(null);

  readonly users = signal<UserProfile[]>([]);

  // Resolver que bloquea las guards hasta que Firebase Auth resuelva el estado inicial
  private resolveReady!: (value: UserProfile | null) => void;
  readonly isReady = new Promise<UserProfile | null>((resolve) => {
    this.resolveReady = resolve;
  });

  readonly currentRole = computed(() => this.currentUser()?.role || null);
  readonly isInstructor = computed(() => this.currentUser()?.role === 'INSTRUCTOR');
  readonly isStudent = computed(() => this.currentUser()?.role === 'STUDENT');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

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
          
          // Si el rol es ADMIN, escuchar la colección de usuarios en tiempo real
          if (this.currentUser()?.role === 'ADMIN') {
            this.startUsersListener();
          }
          
          this.resolveReady(this.currentUser());
        } catch (err) {
          console.error('Error al cargar perfil de usuario desde Firestore:', err);
          this.resolveReady(null);
        }
      } else {
        this.stopUsersListener();
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

  private startUsersListener(): void {
    this.stopUsersListener();
    this.usersListenerUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
      this.users.set(list);
    });
  }

  private stopUsersListener(): void {
    if (this.usersListenerUnsubscribe) {
      this.usersListenerUnsubscribe();
      this.usersListenerUnsubscribe = null;
    }
  }
}
