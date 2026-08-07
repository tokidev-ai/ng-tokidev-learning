import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-mentorships',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-4xl mx-auto space-y-12">
        
        <!-- Header -->
        <div class="text-center space-y-4 max-w-2xl mx-auto">
          <span class="px-3 py-1 bg-[#DA2984]/20 text-[#DA2984] text-xs font-extrabold uppercase rounded-full border border-[#DA2984]/30">
            Mentoría de Alto Rendimiento
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight">Lleva tu Carrera al Siguiente Nivel</h1>
          <p class="text-xs md:text-sm text-slate-400">
            Acompañamiento 1-a-1 de la mano de profesionales activos de la industria. Diseñamos un plan de desarrollo para potenciar tu perfil tecnológico.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          <!-- Benefits List -->
          <div class="md:col-span-6 space-y-6">
            <h2 class="text-xl font-bold text-white">¿Qué Incluye el Programa?</h2>
            
            <div class="space-y-4">
              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-xl bg-[#A406E9]/20 text-[#A406E9] flex items-center justify-center text-sm shrink-0 border border-[#A406E9]/30">
                  <i class="fa-solid fa-calendar-check"></i>
                </div>
                <div>
                  <h4 class="font-bold text-xs text-white">Sesiones Semanales</h4>
                  <p class="text-[11px] text-slate-400 leading-normal">Videollamadas semanales de 45 minutos para resolver bloqueos de código y arquitectura.</p>
                </div>
              </div>

              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-xl bg-[#DA2984]/20 text-[#DA2984] flex items-center justify-center text-sm shrink-0 border border-[#DA2984]/30">
                  <i class="fa-solid fa-code"></i>
                </div>
                <div>
                  <h4 class="font-bold text-xs text-white">Revisión de Código Asíncrona</h4>
                  <p class="text-[11px] text-slate-400 leading-normal">Acceso a un canal privado de Slack para revisión de tus PRs y preguntas puntuales.</p>
                </div>
              </div>

              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-xl bg-[#FA743F]/20 text-[#FA743F] flex items-center justify-center text-sm shrink-0 border border-[#FA743F]/30">
                  <i class="fa-solid fa-route"></i>
                </div>
                <div>
                  <h4 class="font-bold text-xs text-white">Ruta de Aprendizaje Propia</h4>
                  <p class="text-[11px] text-slate-400 leading-normal">Elaboración de una ruta de estudio personalizada de acuerdo con tu perfil y metas profesionales.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA Panel Card (Replaces Form) -->
          <div class="md:col-span-6 flex flex-col justify-between">
            <div class="glass-card p-6 md:p-8 rounded-3xl space-y-6 flex flex-col justify-between h-full border border-white/10 relative overflow-hidden">
              <div class="absolute -top-10 -right-10 w-24 h-24 bg-[#DA2984]/15 rounded-full blur-xl"></div>
              
              <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DA2984] to-[#FA743F] flex items-center justify-center text-white text-xl">
                  <i class="fa-solid fa-user-tie"></i>
                </div>
                <div class="space-y-2">
                  <h3 class="text-lg font-bold text-white leading-snug">¿Listo para iniciar tu postulación?</h3>
                  <p class="text-xs text-slate-400 leading-relaxed">
                    Hemos trasladado nuestro proceso de selección a una plataforma dedicada para brindarte una atención más rápida y personalizada. 
                  </p>
                  <p class="text-xs text-slate-400 leading-relaxed">
                    Haz clic a continuación para rellenar tu perfil de postulación en nuestro formulario externo.
                  </p>
                </div>
              </div>

              @if (isRedirecting()) {
                <div class="pt-4 flex items-center justify-center gap-2 text-xs font-bold text-[#FA743F] animate-pulse">
                  <i class="fa-solid fa-spinner animate-spin"></i> Redireccionando a la página de contacto...
                </div>
              } @else {
                <div class="pt-4">
                  <button 
                    type="button"
                    (click)="triggerRedirect()"
                    class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold tracking-wider uppercase text-white shadow-lg shadow-[#DA2984]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    Postularse en Formulario Externo <i class="fa-solid fa-arrow-up-right-from-square"></i>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Student Reviews context (lost in index call, highlighted in call transcription) -->
        <div class="space-y-6 pt-6">
          <h2 class="text-lg font-bold text-white text-center">Experiencias de Mentorados</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
              <p class="text-[11px] text-slate-300 italic leading-relaxed">
                "La mentoría personalizada con Rodrigo me permitió pasar de júnior a lead developer en menos de un año. El feedback directo sobre mi código fue clave."
              </p>
              <div class="flex items-center gap-2">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Alan" class="w-6 h-6 rounded-full object-cover" />
                <span class="text-[10px] font-bold text-white">Alan Castro <span class="text-slate-500 font-normal block">Full Stack Engineer</span></span>
              </div>
            </div>

            <div class="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
              <p class="text-[11px] text-slate-300 italic leading-relaxed">
                "El soporte continuo en Slack me destrabó decenas de veces en producción. No es solo teoría, es acompañamiento profesional real."
              </p>
              <div class="flex items-center gap-2">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Laura" class="w-6 h-6 rounded-full object-cover" />
                <span class="text-[10px] font-bold text-white">Laura Méndez <span class="text-slate-500 font-normal block">Freelance Web Dev</span></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class MentorshipsComponent {
  protected readonly isRedirecting = signal(false);

  triggerRedirect(): void {
    this.isRedirecting.set(true);
    setTimeout(() => {
      this.isRedirecting.set(false);
      // Simulate external opening
      window.open('https://tokidev.io/mentorship-apply', '_blank');
    }, 1500);
  }
}
