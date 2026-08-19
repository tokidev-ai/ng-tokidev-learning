import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LucideAlertTriangle, LucideX, LucideLoader2 } from '@lucide/angular';

@Component({
  selector: 'app-confirm-modal',
  imports: [LucideAlertTriangle, LucideX, LucideLoader2],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <!-- Backdrop Overlay -->
      <div 
        (click)="!isLoading() && onCancel()"
        class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        
        <!-- Modal Card Dialog -->
        <div 
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
          class="glass-card w-full max-w-md rounded-3xl p-6 border border-white/10 bg-[#0F0D24]/95 shadow-2xl space-y-6 animate-scale-up">
          
          <!-- Top Icon & Close Button -->
          <div class="flex items-start justify-between">
            <div 
              class="w-12 h-12 rounded-2xl flex items-center justify-center border"
              [class]="danger() ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' : 'bg-[#A406E9]/15 border-[#A406E9]/30 text-[#A406E9]'">
              <svg lucideAlertTriangle class="w-6 h-6"></svg>
            </div>
            
            <button 
              type="button" 
              (click)="onCancel()"
              [disabled]="isLoading()"
              aria-label="Cerrar modal"
              class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <svg lucideX class="w-4 h-4"></svg>
            </button>
          </div>

          <!-- Content Title & Message -->
          <div class="space-y-2">
            <h3 class="text-lg font-black text-white tracking-tight">
              {{ title() }}
            </h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              {{ message() }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button"
              (click)="onCancel()"
              [disabled]="isLoading()"
              class="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {{ cancelText() }}
            </button>

            <button 
              type="button"
              (click)="onConfirm()"
              [disabled]="isLoading()"
              class="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all cursor-pointer shadow-lg flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              [class]="danger() ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:opacity-90 shadow-rose-600/20' : 'bg-gradient-to-r from-[#A406E9] to-[#DA2984] hover:opacity-90 shadow-[#A406E9]/20'">
              @if (isLoading()) {
                <svg lucideLoader2 class="w-3.5 h-3.5 animate-spin"></svg>
                <span>{{ loadingText() }}</span>
              } @else {
                <span>{{ confirmText() }}</span>
              }
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('¿Confirmar acción?');
  readonly message = input<string>('¿Estás seguro de que deseas continuar con esta operación?');
  readonly confirmText = input<string>('Confirmar');
  readonly cancelText = input<string>('Cancelar');
  readonly loadingText = input<string>('Procesando...');
  readonly isLoading = input<boolean>(false);
  readonly danger = input<boolean>(true);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    if (!this.isLoading()) {
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    if (!this.isLoading()) {
      this.cancelled.emit();
    }
  }
}
