import { Component, ChangeDetectionStrategy, inject, signal, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell';
import { 
  LucideGraduationCap, 
  LucideFolderOpen, 
  LucideLogOut, 
  LucideChevronDown,
  LucideMenu,
  LucideX,
  LucideHome,
  LucideCompass,
  LucideSparkles,
  LucideLogIn
} from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink, 
    RouterLinkActive, 
    NotificationBellComponent,
    LucideGraduationCap, 
    LucideFolderOpen, 
    LucideLogOut, 
    LucideChevronDown,
    LucideMenu,
    LucideX,
    LucideHome,
    LucideCompass,
    LucideSparkles,
    LucideLogIn
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
  private readonly elementRef = inject(ElementRef);
  protected readonly showDropdown = signal(false);
  protected readonly isMobileMenuOpen = signal(false);

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showDropdown.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
    }
  }
}
