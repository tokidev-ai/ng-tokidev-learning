import { Component, ChangeDetectionStrategy, inject, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { 
  LucideLayoutDashboard, 
  LucideBookOpen, 
  LucideGitFork, 
  LucideUsers, 
  LucideLogOut, 
  LucideX, 
  LucidePlusCircle,
  LucideSparkles,
  LucideCompass,
  LucideGraduationCap,
  LucideTicket,
  LucideBarChart3,
  LucideDollarSign
} from '@lucide/angular';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink, 
    RouterLinkActive, 
    LucideLayoutDashboard, 
    LucideBookOpen, 
    LucideGitFork, 
    LucideUsers, 
    LucideLogOut, 
    LucideX, 
    LucidePlusCircle, 
    LucideSparkles,
    LucideCompass,
    LucideGraduationCap,
    LucideTicket,
    LucideBarChart3,
    LucideDollarSign
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  protected readonly authService = inject(AuthService);
  readonly isOpen = model<boolean>(false);

  closeSidebar(): void {
    this.isOpen.set(false);
  }
}
