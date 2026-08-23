import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';
import { 
  LucideBell, 
  LucideChevronDown, 
  LucideLogOut,
  LucideMenu
} from '@lucide/angular';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    SidebarComponent,
    LucideBell,
    LucideChevronDown,
    LucideLogOut,
    LucideMenu
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html'
})
export class App {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoginRoute = signal<boolean>(false);
  protected readonly showDropdown = signal<boolean>(false);
  protected readonly isMobileSidebarOpen = signal<boolean>(false);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isLoginRoute.set(url.startsWith('/login'));
      this.isMobileSidebarOpen.set(false);
      this.showDropdown.set(false);
    });
  }
}
