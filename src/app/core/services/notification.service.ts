import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp, 
  writeBatch,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { AuthService } from './auth.service';
import { AppNotification, CreateNotificationDto } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly authService = inject(AuthService);
  private unsubscribe: Unsubscribe | null = null;

  readonly notifications = signal<AppNotification[]>([]);

  // Contador de notificaciones no leídas
  readonly unreadCount = computed(() => 
    this.notifications().filter(n => !n.read).length
  );

  // Notificaciones no leídas
  readonly unreadNotifications = computed(() =>
    this.notifications().filter(n => !n.read)
  );

  constructor() {
    // Sincronizar automáticamente cuando el usuario inicia o cierra sesión
    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.id) {
        this.listenUserNotifications(user.id, user.role);
      } else {
        this.clearListener();
      }
    });
  }

  private listenUserNotifications(userId: string, role: string): void {
    this.clearListener();

    const notifsRef = collection(db, 'notifications');
    const isAdmin = role?.toUpperCase() === 'ADMIN';
    const targetUserIds = isAdmin 
      ? [userId, 'ADMIN_ROLE', 'admin', 'ADMIN'] 
      : [userId];

    // Consultar directamente por userId(s) para evitar problemas de índices compuestos
    const userQuery = query(
      notifsRef,
      where('userId', 'in', targetUserIds)
    );

    this.unsubscribe = onSnapshot(userQuery, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as AppNotification[];

      // Ordenar en memoria por createdAt descendente
      list.sort((a, b) => {
        const getMs = (val: any) => {
          if (!val) return 0;
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (typeof val.toDate === 'function') return val.toDate().getTime();
          if (val instanceof Date) return val.getTime();
          return new Date(val).getTime() || 0;
        };
        return getMs(b.createdAt) - getMs(a.createdAt);
      });

      this.notifications.set(list);
    }, (error) => {
      console.error('[NotificationService] Error escuchando notificaciones:', error);
    });
  }

  /** Crear una nueva notificación en Firestore */
  async createNotification(dto: CreateNotificationDto): Promise<string> {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...dto,
      read: dto.read ?? false,
      createdAt: dto.createdAt ?? Timestamp.now()
    });
    return docRef.id;
  }

  /** Marcar una notificación como leída */
  async markAsRead(notificationId: string): Promise<void> {
    this.notifications.update(list => 
      list.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (err) {
      console.error('[NotificationService] Error actualizando notificación a leída:', err);
    }
  }

  /** Marcar todas las notificaciones no leídas como leídas */
  async markAllAsRead(): Promise<void> {
    const unread = this.notifications().filter(n => !n.read);
    if (unread.length === 0) return;

    this.notifications.update(list => list.map(n => ({ ...n, read: true })));

    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('[NotificationService] Error marcando todas las notificaciones como leídas:', err);
    }
  }

  /** Eliminar una notificación */
  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications.update(list => list.filter(n => n.id !== notificationId));
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (err) {
      console.error('[NotificationService] Error eliminando notificación:', err);
    }
  }

  private clearListener(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.notifications.set([]);
  }
}
