import { Component, ChangeDetectionStrategy, inject, signal, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { 
  LucideGraduationCap, 
  LucideFolderOpen, 
  LucideLogOut, 
  LucideChevronDown
} from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink, 
    RouterLinkActive, 
    LucideGraduationCap, 
    LucideFolderOpen, 
    LucideLogOut, 
    LucideChevronDown
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

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showDropdown.update(v => !v);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
    }
  }
}
