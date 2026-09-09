import { Component, ChangeDetectionStrategy, inject, signal, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models/notification.model';
import { 
  LucideBell, 
  LucideCheckCheck, 
  LucideDollarSign, 
  LucideBookOpen, 
  LucideUserCheck, 
  LucideSparkles, 
  LucideInfo, 
  LucideTrash2, 
  LucideMessageSquare, 
  LucideGraduationCap 
} from '@lucide/angular';

@Component({
  selector: 'app-notification-bell',
  imports: [
    LucideBell, 
    LucideCheckCheck, 
    LucideDollarSign, 
    LucideBookOpen, 
    LucideUserCheck, 
    LucideSparkles, 
    LucideInfo, 
    LucideTrash2, 
    LucideMessageSquare, 
    LucideGraduationCap
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'relative block',
    '(document:click)': 'onDocumentClick($event)'
  },
  templateUrl: './notification-bell.html'
})
export class NotificationBellComponent {
  protected readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  protected readonly showNotifications = signal(false);

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotifications.update(v => !v);
  }

  async onNotificationClick(notification: AppNotification): Promise<void> {
    if (!notification.read) {
      await this.notificationService.markAsRead(notification.id);
    }
    this.showNotifications.set(false);

    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  async deleteNotification(event: MouseEvent, notificationId: string): Promise<void> {
    event.stopPropagation();
    await this.notificationService.deleteNotification(notificationId);
  }

  formatTimeAgo(createdAt: any): string {
    if (!createdAt) return 'Reciente';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showNotifications.set(false);
    }
  }
}
