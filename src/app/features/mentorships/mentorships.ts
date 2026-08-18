import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { 
  LucideCalendarCheck, 
  LucideCode, 
  LucideGitFork, 
  LucideUserCheck, 
  LucideExternalLink, 
  LucideLoader2, 
  LucideStar,
  LucideSparkles
} from '@lucide/angular';

@Component({
  selector: 'app-mentorships',
  imports: [
    LucideCalendarCheck, 
    LucideCode, 
    LucideGitFork, 
    LucideUserCheck, 
    LucideExternalLink, 
    LucideLoader2, 
    LucideStar,
    LucideSparkles
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8 select-none">
      <div class="max-w-5xl mx-auto space-y-12">
        
        <!-- Header -->
        <div class="text-center space-y-4 max-w-2xl mx-auto">
          <span class="px-3.5 py-1.5 bg-[#DA2984]/20 text-[#DA2984] text-xs font-extrabold uppercase tracking-wider rounded-full border border-[#DA2984]/30 inline-flex items-center gap-1.5">
            <svg lucideSparkles class="w-3.5 h-3.5"></svg>
            Mentoría de Alto Rendimiento
          </span>
          <h1 class="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Acelera tu Carrera con Mentoría TokiDev
          </h1>
          <p class="text-xs md:text-sm text-slate-400 font-medium">
            Acompañamiento 1-a-1 de la mano de ingenieros senior activos de la industria. Diseñamos un plan personalizado para potenciar tu perfil profesional.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          <!-- Beneficios del Programa -->
          <div class="md:col-span-6 space-y-6">
            <h2 class="text-xl font-extrabold text-white">¿Qué Incluye el Programa?</h2>
            
            <div class="space-y-4">
              <div class="flex gap-4 p-4 rounded-2xl glass-card border border-white/5">
                <div class="w-10 h-10 rounded-xl bg-[#A406E9]/20 text-[#A406E9] flex items-center justify-center text-sm shrink-0 border border-[#A406E9]/30">
                  <svg lucideCalendarCheck class="w-5 h-5"></svg>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white">Sesiones 1-a-1 Semanales</h4>
                  <p class="text-xs text-slate-400 leading-relaxed mt-0.5">Videollamadas semanales de 45 minutos para resolver bloqueos de código, arquitectura e inserción laboral.</p>
                </div>
              </div>

              <div class="flex gap-4 p-4 rounded-2xl glass-card border border-white/5">
                <div class="w-10 h-10 rounded-xl bg-[#DA2984]/20 text-[#DA2984] flex items-center justify-center text-sm shrink-0 border border-[#DA2984]/30">
                  <svg lucideCode class="w-5 h-5"></svg>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white">Revisión de Código Asíncrona</h4>
                  <p class="text-xs text-slate-400 leading-relaxed mt-0.5">Acceso a un canal privado en Discord/Slack para revisión de tus PRs y preguntas diarias.</p>
                </div>
              </div>

              <div class="flex gap-4 p-4 rounded-2xl glass-card border border-white/5">
                <div class="w-10 h-10 rounded-xl bg-[#FA743F]/20 text-[#FA743F] flex items-center justify-center text-sm shrink-0 border border-[#FA743F]/30">
                  <svg lucideGitFork class="w-5 h-5"></svg>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white">Ruta Personalizada</h4>
                  <p class="text-xs text-slate-400 leading-relaxed mt-0.5">Elaboración de una ruta de estudio y proyectos reales adaptados a tus metas profesionales.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tarjeta de Acción / Postulación -->
          <div class="md:col-span-6 flex flex-col justify-between">
            <div class="glass-card p-6 md:p-8 rounded-3xl space-y-6 flex flex-col justify-between h-full border border-white/10 relative overflow-hidden">
              <div class="absolute -top-10 -right-10 w-32 h-32 bg-[#DA2984]/15 rounded-full blur-2xl pointer-events-none"></div>
              
              <div class="space-y-4 relative z-10">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DA2984] to-[#FA743F] flex items-center justify-center text-white text-xl shadow-lg">
                  <svg lucideUserCheck class="w-6 h-6"></svg>
                </div>
                <div class="space-y-2">
                  <h3 class="text-xl font-extrabold text-white leading-snug">¿Listo para postular a tu Mentoría TokiDev?</h3>
                  <p class="text-xs text-slate-300 leading-relaxed font-normal">
                    Contamos con cupos limitados por mes para garantizar la máxima dedicación con cada mentorado.
                  </p>
                  <p class="text-xs text-slate-400 leading-relaxed font-normal">
                    Haz clic a continuación para enviar tu postulación a través de nuestro formulario oficial.
                  </p>
                </div>
              </div>

              @if (isRedirecting()) {
                <div class="pt-4 flex items-center justify-center gap-2 text-xs font-extrabold text-[#FA743F] animate-pulse">
                  <svg lucideLoader2 class="w-4 h-4 animate-spin"></svg>
                  <span>Redireccionando al formulario de postulación...</span>
                </div>
              } @else {
                <div class="pt-4 relative z-10">
                  <button 
                    type="button"
                    (click)="triggerRedirect()"
                    class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#A406E9] via-[#DA2984] to-[#FA743F] text-xs font-extrabold tracking-wider uppercase text-white shadow-xl shadow-[#DA2984]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span>Postular a Mentoría TokiDev</span>
                    <svg lucideExternalLink class="w-4 h-4"></svg>
                  </button>
                </div>
              }
            </div>
          </div>

        </div>

        <!-- Opiniones de Mentorados -->
        <div class="space-y-6 pt-6">
          <div class="text-center space-y-1">
            <h2 class="text-xl font-extrabold text-white">Experiencias de Mentorados</h2>
            <p class="text-xs text-slate-400">Resultados reales de desarrolladores que entrenaron con TokiDev.</p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div class="flex items-center gap-1 text-amber-400 text-xs">
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
              </div>
              <p class="text-xs text-slate-300 italic leading-relaxed">
                "La mentoría personalizada con el equipo TokiDev me permitió pasar de júnior a Lead Developer en menos de un año. El feedback directo sobre mi código fue clave."
              </p>
              <div class="flex items-center gap-3 pt-2 border-t border-white/5">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Alan" class="w-8 h-8 rounded-full object-cover border border-white/20" />
                <div>
                  <span class="text-xs font-bold text-white block">Alan Castro</span>
                  <span class="text-[10px] text-slate-400">Full Stack Engineer</span>
                </div>
              </div>
            </div>

            <div class="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div class="flex items-center gap-1 text-amber-400 text-xs">
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
              </div>
              <p class="text-xs text-slate-300 italic leading-relaxed">
                "El soporte continuo me destrabó decenas de veces en producción. No es solo teoría, es acompañamiento profesional continuo en casos reales."
              </p>
              <div class="flex items-center gap-3 pt-2 border-t border-white/5">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Laura" class="w-8 h-8 rounded-full object-cover border border-white/20" />
                <div>
                  <span class="text-xs font-bold text-white block">Laura Méndez</span>
                  <span class="text-[10px] text-slate-400">Frontend Developer</span>
                </div>
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
      window.open('https://tokidev.io/mentorship-apply', '_blank');
    }, 1500);
  }
}
