import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

export interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-filter-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2">
      @if (label()) {
        <span class="text-xs text-slate-400 font-medium whitespace-nowrap">{{ label() }}</span>
      }
      <div class="relative">
        <select 
          [value]="value()"
          (change)="onChange($event)"
          class="bg-slate-900 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-xs text-white outline-none focus:border-[#DA2984] cursor-pointer hover:bg-slate-800 transition-colors appearance-none">
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value" [selected]="opt.value === value()">
              {{ opt.label }}
            </option>
          }
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  `
})
export class FilterSelectComponent {
  readonly value = input<string>('');
  readonly label = input<string>('');
  readonly options = input<FilterOption[]>([]);
  readonly valueChange = output<string>();

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit(target.value);
  }
}
