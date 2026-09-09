import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { 
  LucideClock, 
  LucideXCircle, 
  LucideCheckCircle2, 
  LucideLogOut, 
  LucideSparkles, 
  LucideArrowRight,
  LucideLoader2
} from '@lucide/angular';

@Component({
  selector: 'app-instructor-application-status',
  imports: [
    LucideClock,
    LucideXCircle,
    LucideCheckCircle2,
    LucideLogOut,
    LucideSparkles,
    LucideArrowRight,
    LucideLoader2
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './application-status.html'
})
export class ApplicationStatusComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoggingOut = signal<boolean>(false);

  protected readonly user = computed(() => this.authService.currentUser());
  
  protected readonly status = computed(() => {
    const u = this.user();
    if (!u) return 'NONE';
    if (u.role === 'INSTRUCTOR' || u.instructorApplicationStatus === 'APPROVED') return 'APPROVED';
    if (u.instructorApplicationStatus === 'REJECTED') return 'REJECTED';
    if (u.instructorApplicationStatus === 'PENDING') return 'PENDING';
    return 'NONE';
  });

  async logout(): Promise<void> {
    this.isLoggingOut.set(true);
    try {
      await this.authService.logout();
    } finally {
      this.isLoggingOut.set(false);
    }
  }

  goToInstructorPanel(): void {
    this.router.navigate(['/instructor']);
  }
}
