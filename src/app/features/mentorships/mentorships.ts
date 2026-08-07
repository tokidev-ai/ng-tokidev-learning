import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-mentorships',
  imports: [ReactiveFormsModule],
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

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <!-- Benefits List -->
          <div class="md:col-span-5 space-y-6">
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

            <!-- Testimonial lost from main page -->
            <div class="glass-card p-4 rounded-2xl border border-[#DA2984]/20 space-y-3">
              <p class="text-[11px] text-slate-300 italic leading-relaxed">
                "La mentoría personalizada con Rodrigo me permitió pasar de júnior a lead developer en menos de un año. El feedback directo sobre mi código fue clave."
              </p>
              <div class="flex items-center gap-2">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Alan" class="w-6 h-6 rounded-full object-cover" />
                <span class="text-[10px] font-bold text-white">Alan Castro <span class="text-slate-500 font-normal block">Full Stack Engineer</span></span>
              </div>
            </div>
          </div>

          <!-- Application Form -->
          <div class="md:col-span-7">
            <div class="glass-card p-6 md:p-8 rounded-3xl space-y-6">
              
              @if (isSubmitted()) {
                <div class="text-center py-10 space-y-4">
                  <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-emerald-500/10">
                    <i class="fa-solid fa-paper-plane"></i>
                  </div>
                  <div class="space-y-1">
                    <h3 class="text-xl font-bold text-white">¡Aplicación Recibida!</h3>
                    <p class="text-xs text-slate-400 max-w-sm mx-auto">Revisaremos tu perfil y te contactaremos en un plazo máximo de 48 horas para agendar la primera llamada de diagnóstico.</p>
                  </div>
                  <button 
                    type="button" 
                    (click)="isSubmitted.set(false)" 
                    class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-bold text-slate-300">
                    Volver a Aplicar
                  </button>
                </div>
              } @else {
                <div class="space-y-1">
                  <h3 class="text-lg font-bold text-white">Postular al Programa</h3>
                  <p class="text-[11px] text-slate-400">Cupos limitados por trimestre. Rellena los datos para postularte.</p>
                </div>

                <form [formGroup]="mentorForm" (ngSubmit)="submitApplication()" class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold uppercase text-slate-400">Nombre Completo</label>
                    <input 
                      type="text" 
                      formControlName="fullName"
                      placeholder="Ej. Rodrigo TokiDev" 
                      class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                    @if (mentorForm.get('fullName')?.touched && mentorForm.get('fullName')?.invalid) {
                      <span class="text-[10px] text-rose-500 font-bold block">Tu nombre es requerido.</span>
                    }
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold uppercase text-slate-400">Correo Electrónico</label>
                      <input 
                        type="email" 
                        formControlName="email"
                        placeholder="tu-correo@ejemplo.com" 
                        class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                      @if (mentorForm.get('email')?.touched && mentorForm.get('email')?.invalid) {
                        <span class="text-[10px] text-rose-500 font-bold block">Un correo válido es requerido.</span>
                      }
                    </div>

                    <div class="space-y-1.5">
                      <label class="text-xs font-bold uppercase text-slate-400">Perfil LinkedIn / GitHub</label>
                      <input 
                        type="url" 
                        formControlName="profileUrl"
                        placeholder="https://linkedin.com/in/nombre" 
                        class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-bold uppercase text-slate-400">¿Qué área te interesa profundizar?</label>
                    <select 
                      formControlName="topic"
                      class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors">
                      <option value="Desarrollo Web Frontend (Angular/React)">Desarrollo Web Frontend (Angular/React)</option>
                      <option value="Arquitectura Backend y Cloud">Arquitectura Backend y Cloud</option>
                      <option value="Inteligencia Artificial y Prompt Engineering">Inteligencia Artificial y Prompt Engineering</option>
                      <option value="Liderazgo Técnico o Tech Lead Readiness">Liderazgo Técnico o Tech Lead Readiness</option>
                    </select>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-bold uppercase text-slate-400">¿Cuál es tu principal motivación?</label>
                    <textarea 
                      formControlName="motivation"
                      placeholder="Cuéntanos un poco sobre tu nivel de experiencia actual y qué esperas lograr con la mentoría..." 
                      rows="3"
                      class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors resize-none"></textarea>
                    @if (mentorForm.get('motivation')?.touched && mentorForm.get('motivation')?.invalid) {
                      <span class="text-[10px] text-rose-500 font-bold block">Por favor cuéntanos tus objetivos de mentoría.</span>
                    }
                  </div>

                  <div class="pt-2">
                    <button 
                      type="submit"
                      [disabled]="mentorForm.invalid"
                      class="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold tracking-wider uppercase text-white shadow-lg shadow-[#DA2984]/30 cursor-pointer disabled:opacity-40 transition-all hover:opacity-95">
                      Enviar Solicitud de Postulación
                    </button>
                  </div>
                </form>
              }

            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class MentorshipsComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly isSubmitted = signal(false);

  protected readonly mentorForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    profileUrl: [''],
    topic: ['Desarrollo Web Frontend (Angular/React)', Validators.required],
    motivation: ['', [Validators.required, Validators.minLength(20)]]
  });

  submitApplication(): void {
    if (this.mentorForm.valid) {
      this.isSubmitted.set(true);
    }
  }
}
