import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LucideSearch, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-search-input',
  imports: [LucideSearch, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full">
      <input 
        type="text"
        [value]="value()"
        (input)="onInput($event)"
        [placeholder]="placeholder()"
        class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none pl-9 pr-8 py-2 rounded-xl text-xs text-white placeholder:text-slate-500 transition-colors" />
      
      <svg lucideSearch class="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none"></svg>

      @if (value()) {
        <button 
          type="button"
          (click)="clear()"
          aria-label="Limpiar búsqueda"
          class="absolute right-2.5 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer">
          <svg lucideX class="w-3.5 h-3.5"></svg>
        </button>
      }
    </div>
  `
})
export class SearchInputComponent {
  readonly value = input<string>('');
  readonly placeholder = input<string>('Buscar...');
  readonly valueChange = output<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  clear(): void {
    this.valueChange.emit('');
  }
}
