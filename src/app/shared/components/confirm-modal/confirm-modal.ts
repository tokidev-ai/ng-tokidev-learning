import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LucideAlertTriangle, LucideX, LucideLoader2 } from '@lucide/angular';

@Component({
  selector: 'app-confirm-modal',
  imports: [LucideAlertTriangle, LucideX, LucideLoader2],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-modal.html'
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
