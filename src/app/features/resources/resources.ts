import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'ZIP' | 'CODE';
  size: string;
  downloads: number;
}

@Component({
  selector: 'app-resources',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-5xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="text-center space-y-3 max-w-2xl mx-auto">
          <span class="px-3 py-1 bg-[#A406E9]/20 text-[#A406E9] text-xs font-extrabold uppercase rounded-full border border-[#A406E9]/30">
            Recursos Premium Gratuitos
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight">Potencia tu Aprendizaje</h1>
          <p class="text-xs md:text-sm text-slate-400">Plantillas, cheatsheets y guías descargables listas para acelerar tus proyectos en desarrollo web e IA.</p>
        </div>

        <!-- Resources Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          @for (item of resources(); track item.id) {
            <div class="glass-card rounded-2xl p-5 flex flex-col justify-between hover:border-[#DA2984]/40 transition-all group">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-[9px] font-mono font-bold text-slate-400">
                    {{ item.type }} • {{ item.size }}
                  </span>
                  <span class="text-[10px] text-slate-500 font-medium">
                    <i class="fa-solid fa-download mr-1"></i> {{ item.downloads }} descargas
                  </span>
                </div>
                <h3 class="font-extrabold text-base text-white group-hover:text-[#DA2984] transition-colors">
                  {{ item.title }}
                </h3>
                <p class="text-xs text-slate-400 leading-relaxed">
                  {{ item.description }}
                </p>
              </div>

              <div class="pt-5 mt-auto">
                <button 
                  type="button"
                  (click)="download(item.title)"
                  class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#DA2984]/10 border border-white/10 hover:border-[#DA2984]/40 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <i class="fa-solid fa-cloud-arrow-down"></i>
                  Descargar Ahora
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Download Success Toast -->
        @if (toastMessage()) {
          <div class="fixed bottom-5 right-5 z-50 bg-[#131127] border border-emerald-500/30 text-white rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-fade-in">
            <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm shrink-0">
              <i class="fa-solid fa-check"></i>
            </div>
            <div class="text-left text-xs">
              <span class="font-bold block">Descarga iniciada</span>
              <span class="text-slate-400">{{ toastMessage() }}</span>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class ResourcesComponent {
  protected readonly toastMessage = signal<string | null>(null);

  protected readonly resources = signal<ResourceItem[]>([
    {
      id: 'res_1',
      title: 'Cheatsheet de Prompting con Claude',
      description: 'Aprende a usar XML tags, estructuración de roles y técnicas avanzadas de prompt engineering para tus agentes de código.',
      type: 'PDF',
      size: '2.4 MB',
      downloads: 4500
    },
    {
      id: 'res_2',
      title: 'Plantilla de Sistema de Diseño en Tailwind CSS v4',
      description: 'Una plantilla base con configuraciones preestablecidas de colores premium, tipografías y sombras listas para copiar y pegar.',
      type: 'ZIP',
      size: '1.8 MB',
      downloads: 3200
    },
    {
      id: 'res_3',
      title: 'Guía Avanzada de Signals en Angular 20+',
      description: 'Ejemplos prácticos sobre cómo manejar estados derivados, computed values y efectos secundarios con señales nativas.',
      type: 'PDF',
      size: '4.1 MB',
      downloads: 6100
    }
  ]);

  download(title: string): void {
    this.toastMessage.set(title);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
