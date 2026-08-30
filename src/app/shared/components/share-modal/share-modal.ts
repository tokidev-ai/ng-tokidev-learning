import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { 
  LucideX, 
  LucideShare2, 
  LucideCopy, 
  LucideCheck, 
  LucideSparkles
} from '@lucide/angular';

@Component({
  selector: 'app-share-modal',
  imports: [
    LucideX, 
    LucideShare2, 
    LucideCopy, 
    LucideCheck, 
    LucideSparkles
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './share-modal.html'
})
export class ShareModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('Compartir Curso');
  readonly courseTitle = input<string>('');
  readonly courseThumbnail = input<string>('');
  readonly courseCategory = input<string>('');
  readonly shareUrl = input<string>('');

  readonly closed = output<void>();

  protected readonly copied = signal<boolean>(false);

  get encodedUrl(): string {
    return encodeURIComponent(this.shareUrl() || window.location.href);
  }

  get shareMessage(): string {
    const title = this.courseTitle() || 'este increíble curso';
    return `🚀 ¡Te invito a aprender conmigo en TokiDev Learning! Descubre el curso: "${title}".`;
  }

  get encodedMessage(): string {
    return encodeURIComponent(this.shareMessage);
  }

  get whatsappUrl(): string {
    return `https://api.whatsapp.com/send?text=${this.encodedMessage}%20${this.encodedUrl}`;
  }

  get linkedinUrl(): string {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${this.encodedUrl}`;
  }

  get twitterUrl(): string {
    return `https://twitter.com/intent/tweet?text=${this.encodedMessage}&url=${this.encodedUrl}`;
  }

  get facebookUrl(): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${this.encodedUrl}`;
  }

  get telegramUrl(): string {
    return `https://t.me/share/url?url=${this.encodedUrl}&text=${this.encodedMessage}`;
  }

  copyLink(): void {
    const url = this.shareUrl() || window.location.href;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2500);
      });
    }
  }

  close(): void {
    this.closed.emit();
  }
}
