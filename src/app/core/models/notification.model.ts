import { Timestamp } from 'firebase/firestore';

export type NotificationType = 
  | 'PURCHASE_INSTRUCTOR'      // Notificación al profesor cuando un alumno compra su curso
  | 'PURCHASE_STUDENT'         // Confirmación al estudiante de su matrícula/compra
  | 'NEW_INSTRUCTOR_APPLY'     // Al admin: alguien postuló a ser profesor
  | 'INSTRUCTOR_APPROVED'      // Al usuario: fue aprobado como docente
  | 'INSTRUCTOR_REJECTED'      // Al usuario: postulación rechazada con feedback
  | 'COURSE_PUBLISHED'         // Al admin: un profesor publicó un curso nuevo
  | 'NEW_ENROLLMENT'           // Al profesor: nuevo estudiante inscrito
  | 'NEW_DISCUSSION_REPLY'     // Al estudiante/profesor: respuesta en foro
  | 'SYSTEM';                  // Avisos generales de la plataforma

export interface AppNotification {
  id: string;
  userId: string;              // UID del destinatario (o 'ADMIN_ROLE' para todos los admins)
  recipientRole?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'ALL';
  type: NotificationType;
  title: string;
  message: string;
  link?: string;               // URL a donde redirige al hacer clic (ej. /admin/users, /instructor/courses)
  read: boolean;
  createdAt: Timestamp;
  metadata?: {
    courseId?: string;
    courseTitle?: string;
    studentName?: string;
    amount?: number;
    applicantId?: string;
    applicantName?: string;
    [key: string]: any;
  };
}

export type CreateNotificationDto = Omit<AppNotification, 'id' | 'createdAt' | 'read'> & {
  createdAt?: Timestamp;
  read?: boolean;
};
