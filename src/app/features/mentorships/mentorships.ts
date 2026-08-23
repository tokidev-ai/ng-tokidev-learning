import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { 
  LucideCalendarCheck, 
  LucideCode, 
  LucideGitFork, 
  LucideUserCheck, 
  LucideExternalLink, 
  LucideLoader2
} from '@lucide/angular';

@Component({
  selector: 'app-mentorships',
  imports: [
    LucideCalendarCheck, 
    LucideCode, 
    LucideGitFork, 
    LucideUserCheck, 
    LucideExternalLink, 
    LucideLoader2
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mentorships.html'
})
export class MentorshipsComponent {
  protected readonly isRedirecting = signal(false);

  triggerRedirect(): void {
    this.isRedirecting.set(true);
    setTimeout(() => {
      this.isRedirecting.set(false);
      window.open('https://tokidev.io/mentorship-apply', '_blank');
    }, 1500);
  }
}
