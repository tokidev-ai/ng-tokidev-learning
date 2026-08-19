import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { 
  LucideLayoutDashboard, 
  LucideBookOpen, 
  LucideGitFork, 
  LucideUsers, 
  LucideLogOut, 
  LucideMenu, 
  LucideX, 
  LucidePlusCircle,
  LucideSparkles
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
    LucideMenu, 
    LucideX, 
    LucidePlusCircle,
    LucideSparkles
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  protected readonly authService = inject(AuthService);
  protected readonly mobileOpen = signal(false);
}
