import { Component, ChangeDetectionStrategy, inject, signal, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models/notification.model';
import { 
  LucideGraduationCap, 
  LucideFolderOpen, 
  LucideLogOut, 
  LucideChevronDown,
  LucideBell,
  LucideCheckCheck,
  LucideDollarSign,
  LucideBookOpen,
  LucideUserCheck,
  LucideSparkles,
  LucideInfo,
  LucideTrash2,
  LucideMessageSquare
} from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink, 
    RouterLinkActive, 
    LucideGraduationCap, 
    LucideFolderOpen, 
    LucideLogOut, 
    LucideChevronDown,
    LucideBell,
    LucideCheckCheck,
    LucideDollarSign,
    LucideBookOpen,
    LucideUserCheck,
    LucideSparkles,
    LucideInfo,
    LucideTrash2,
    LucideMessageSquare
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'sticky top-0 z-50 block w-full bg-[#0F0D24]/95 backdrop-blur-md border-b border-white/10 shadow-lg',
    '(document:click)': 'onDocumentClick($event)'
  },
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);
  protected readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  protected readonly showDropdown = signal(false);
  protected readonly showNotifications = signal(false);

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotifications.set(false);
    this.showDropdown.update(v => !v);
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.showDropdown.set(false);
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
      this.showDropdown.set(false);
      this.showNotifications.set(false);
    }
  }
}
