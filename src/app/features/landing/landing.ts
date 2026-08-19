import { Component, ChangeDetectionStrategy, inject, effect, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth.service';
import { 
  LucideRocket, 
  LucideArrowRight,
  LucideStar,
  LucideChevronDown,
  LucideZap,
  LucideCode,
  LucideTerminal,
  LucideCheckCircle2
} from '@lucide/angular';

@Component({
  selector: 'app-landing',
  imports: [
    RouterLink, 
    LucideRocket, 
    LucideArrowRight,
    LucideStar,
    LucideChevronDown,
    LucideZap,
    LucideCode,
    LucideTerminal,
    LucideCheckCircle2
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 space-y-24 pb-24 overflow-hidden select-none">
      
      <!-- HERO SECTION -->
      <section class="relative pt-10 lg:pt-16 px-4 lg:px-8">
        <!-- Soft Glow Ambient Spheres -->
        <div class="absolute top-10 left-1/3 -translate-x-1/2 w-[600px] h-[500px] bg-[#A406E9]/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div class="absolute top-30 right-10 w-[400px] h-[400px] bg-[#DA2984]/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <!-- Hero Text Column -->
          <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <!-- Headline -->
            <h1 class="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Domina el desarrollo con <span class="text-brand-gradient">expertos.</span>
            </h1>

            <!-- Subtitle -->
            <p class="text-base md:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              Acelera tu carrera en tecnología con proyectos reales, mentoría en vivo y una comunidad activa de desarrolladores de élite.
            </p>

            <!-- Single Action CTA (Comenzar Ahora) -->
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a 
                routerLink="/student/dashboard" 
                class="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-[#A406E9] via-[#DA2984] to-[#FA743F] text-white font-extrabold text-xs tracking-wider uppercase hover:opacity-95 transition-all shadow-xl shadow-[#A406E9]/30 flex items-center justify-center gap-2">
                <span>COMENZAR AHORA</span>
                <svg lucideArrowRight class="w-4 h-4"></svg>
              </a>
            </div>

            <!-- Social Proof Rating -->
            <div class="pt-4 flex items-center justify-center lg:justify-start gap-4 border-t border-white/5 text-xs text-slate-400 font-medium">
              <div class="flex items-center gap-1 text-amber-400">
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
              </div>
              <span><strong class="text-white">4.9/5.0</strong> por más de <strong class="text-white">10,000+ estudiantes</strong></span>
            </div>

          </div>

          <!-- Hero Right Column: Student Over-The-Shoulder View -->
          <div class="lg:col-span-5 relative">
            <div class="bg-[#151333] rounded-3xl border border-white/15 shadow-2xl overflow-hidden group hover:border-[#A406E9]/40 transition-all">
              
              <!-- Window Controls Bar -->
              <div class="bg-[#0F0D24] px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div class="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>tokidev.learning/classroom</span>
                </div>
              </div>

              <!-- Main Student Image Frame -->
              <div class="relative aspect-video sm:aspect-[16/10] overflow-hidden bg-slate-950">
                <img 
                  src="/images/hero-student-over-shoulder.jpg" 
                  alt="Estudiante TokiDev Learning en clase virtual" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95" />
                <div class="absolute inset-0 bg-gradient-to-t from-[#0F0D24] via-transparent to-transparent pointer-events-none"></div>
              </div>

              <!-- Card Bottom Info -->
              <div class="p-5 space-y-3 bg-[#0F0D24]">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-200 font-bold text-xs">
                    Clases prácticas interactivas y mentoría guiada
                  </span>
                  <span class="text-[11px] text-emerald-400 font-bold font-mono shrink-0">
                    A tu propio ritmo
                  </span>
                </div>

                <a routerLink="/student/dashboard" class="w-full py-3 rounded-xl bg-gradient-to-r from-[#A406E9] to-[#DA2984] hover:opacity-90 text-white font-extrabold text-xs text-center block transition-all shadow-md">
                  Explorar Cursos
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- FEATURED COURSES SECTION (with rich thumbnail images) -->
      <section class="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        <div class="flex items-center justify-between border-b border-white/10 pb-4">
          <div class="space-y-1">
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">Cursos Destacados</h2>
            <p class="text-xs text-slate-400">Conocimiento práctico diseñado para proyectos del mundo real.</p>
          </div>
          <a routerLink="/catalog" class="text-xs font-bold text-[#A406E9] hover:underline flex items-center gap-1">
            <span>VER TODOS</span>
            <svg lucideArrowRight class="w-3.5 h-3.5"></svg>
          </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Large Featured Card (Left) -->
          <div class="lg:col-span-8 glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-[#A406E9]/40 transition-all">
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono font-bold rounded-lg uppercase">
                Avanzado
              </span>
              <svg lucideRocket class="w-5 h-5 text-slate-400 group-hover:text-[#A406E9] transition-colors"></svg>
            </div>

            <div class="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-900 via-[#1C1635] to-[#0B0A17] overflow-hidden border border-white/10 p-6 flex flex-col justify-end">
              <img 
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" 
                alt="Arquitectura Microservicios"
                class="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-500" />
              <div class="relative z-10 space-y-2">
                <h3 class="text-2xl font-extrabold text-white group-hover:text-[#A406E9] transition-colors">
                  Arquitectura Microservicios
                </h3>
                <p class="text-xs text-slate-300 max-w-lg leading-relaxed font-normal">
                  Diseña y despliega sistemas escalables usando Docker, Kubernetes y patrones modernos.
                </p>
              </div>
            </div>

            <div class="space-y-1.5 pt-2">
              <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                <div class="bg-brand-gradient h-full rounded-full" style="width: 75%"></div>
              </div>
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>75% LLENO</span>
                <span>Inscripciones Abiertas</span>
              </div>
            </div>
          </div>

          <!-- Small Cards (Right Grid with Images) -->
          <div class="lg:col-span-4 flex flex-col gap-6">
            
            <!-- React Server Components -->
            <div class="glass-card rounded-3xl p-5 border border-white/10 space-y-4 hover:border-[#DA2984]/40 transition-all flex flex-col justify-between flex-1 group">
              <div class="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80" 
                  alt="React Server Components"
                  class="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div class="space-y-1">
                <span class="px-2.5 py-0.5 bg-white/5 border border-white/10 text-[#DA2984] text-[10px] font-mono font-bold rounded-md uppercase">
                  Intermedio
                </span>
                <h3 class="text-base font-extrabold text-white group-hover:text-[#DA2984] transition-colors">
                  React Server Components
                </h3>
                <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  Optimiza el rendimiento con Next.js y Server Actions.
                </p>
              </div>
            </div>

            <!-- Go para Backend -->
            <div class="glass-card rounded-3xl p-5 border border-white/10 space-y-4 hover:border-[#FA743F]/40 transition-all flex flex-col justify-between flex-1 group">
              <div class="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80" 
                  alt="Go para Backend"
                  class="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div class="space-y-1">
                <span class="px-2.5 py-0.5 bg-white/5 border border-white/10 text-[#FA743F] text-[10px] font-mono font-bold rounded-md uppercase">
                  Principiante
                </span>
                <h3 class="text-base font-extrabold text-white group-hover:text-[#FA743F] transition-colors">
                  Go para Backend
                </h3>
                <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  Concurrencia extrema y microservicios de alto desempeño.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- SECTION: SOBRE TOKIDEV -->
      <section class="max-w-7xl mx-auto px-4 lg:px-8">
        <div class="glass-card rounded-3xl p-8 md:p-12 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <!-- TokiDev Profile & Workspace Image Column -->
          <div class="lg:col-span-6 relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl group bg-slate-950">
            <img 
              src="/images/tokidev-creator.jpg" 
              alt="TokiDev - Desarrollador y Creador de TokiDev Learning" 
              class="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700 opacity-95" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0B0A17]/80 via-transparent to-transparent pointer-events-none"></div>
            
            <!-- Floating Overlay Badge -->
            <div class="absolute bottom-4 left-4 right-4 bg-[#0F0D24]/90 backdrop-blur-md border border-white/15 p-3.5 rounded-xl flex items-center justify-between text-xs">
              <div class="flex items-center gap-2.5 font-mono text-slate-200">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="font-bold text-white">TokiDev</span>
                <span class="text-[10px] text-slate-400 font-normal">| Instructor & Creador</span>
              </div>
              <span class="text-[11px] text-[#A406E9] font-bold">@tokidev</span>
            </div>
          </div>

          <!-- Content Column: TokiDev Bio & Mission -->
          <div class="lg:col-span-6 space-y-6">
            <div class="space-y-2">
              <span class="text-xs font-mono uppercase tracking-wider text-[#A406E9] font-bold">SOBRE TOKIDEV</span>
              <h2 class="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Apasionado por el Código, Dedicado a Formar Desarrolladores.
              </h2>
            </div>

            <p class="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
              ¡Hola! Soy <strong class="text-white">TokiDev</strong>, desarrollador de software y educador apasionado por la tecnología. Creé TokiDev Learning con un propósito claro: enseñar programación como realmente se trabaja en la industria, combinando rutas estructuradas por días, proyectos del mundo real y explicaciones directas sin rodeos.
            </p>

            <!-- Personal Pillars Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-[#A406E9]/40 transition-colors">
                <div class="flex items-center gap-2 text-xs font-bold text-white">
                  <svg lucideCode class="w-4 h-4 text-[#A406E9]"></svg>
                  <span>Desarrollador Activo</span>
                </div>
                <p class="text-[11px] text-slate-400 leading-snug">Construyo software real diariamente y enseño estándares profesionales de la industria.</p>
              </div>

              <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-[#DA2984]/40 transition-colors">
                <div class="flex items-center gap-2 text-xs font-bold text-white">
                  <svg lucideZap class="w-4 h-4 text-[#DA2984]"></svg>
                  <span>Metodología por Días</span>
                </div>
                <p class="text-[11px] text-slate-400 leading-snug">Lecciones paso a paso divididas por jornadas acotadas para evitar la frustración.</p>
              </div>

              <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-[#FA743F]/40 transition-colors">
                <div class="flex items-center gap-2 text-xs font-bold text-white">
                  <svg lucideTerminal class="w-4 h-4 text-[#FA743F]"></svg>
                  <span>Proyectos Portafolio</span>
                </div>
                <p class="text-[11px] text-slate-400 leading-snug">Enfoque 100% práctico para crear aplicaciones que sorprendan a los reclutadores.</p>
              </div>

              <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-emerald-400/40 transition-colors">
                <div class="flex items-center gap-2 text-xs font-bold text-white">
                  <svg lucideCheckCircle2 class="w-4 h-4 text-emerald-400"></svg>
                  <span>Mentoría Cercana</span>
                </div>
                <p class="text-[11px] text-slate-400 leading-snug">Acompaño y respondo dudas directamente en la comunidad de estudiantes.</p>
              </div>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div class="space-y-0.5">
                <span class="text-2xl md:text-3xl font-extrabold text-white">10K+</span>
                <span class="text-[11px] text-slate-400 block font-medium">Estudiantes Guiados</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-2xl md:text-3xl font-extrabold text-white">150+</span>
                <span class="text-[11px] text-slate-400 block font-medium">Lecciones Creadas</span>
              </div>
              <div class="space-y-0.5">
                <span class="text-2xl md:text-3xl font-extrabold text-white">4.9★</span>
                <span class="text-[11px] text-slate-400 block font-medium">Valoración Media</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- SECTION: TESTIMONIOS DE NUESTROS ESTUDIANTES (con fotos) -->
      <section class="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <span class="text-xs font-mono uppercase tracking-wider text-[#DA2984] font-bold">TESTIMONIOS REALES</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-white">¿Qué Dicen Nuestros Estudiantes?</h2>
          <p class="text-xs md:text-sm text-slate-400">Descubre cómo TokiDev Learning ha impulsado sus carreras tecnológicas.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Testimonial 1 -->
          <div class="glass-card p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center gap-1 text-amber-400 text-xs">
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed font-normal italic">
                "Pasé de no saber cómo estructurar una aplicación profesional a conseguir mi primer trabajo como Fullstack Developer. El enfoque por días cambia las reglas del juego."
              </p>
            </div>

            <div class="flex items-center gap-3 pt-3 border-t border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                alt="Carlos Mendoza" 
                class="w-10 h-10 rounded-full object-cover border border-white/20" />
              <div>
                <h4 class="font-bold text-xs text-white">Carlos Mendoza</h4>
                <span class="text-[10px] text-slate-400">Fullstack Engineer en TechLabs</span>
              </div>
            </div>
          </div>

          <!-- Testimonial 2 -->
          <div class="glass-card p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center gap-1 text-amber-400 text-xs">
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed font-normal italic">
                "Los cursos van directo al grano sin videos interminables de 40 horas de teoría pura. La sección de discusión con profesores responde en minutos."
              </p>
            </div>

            <div class="flex items-center gap-3 pt-3 border-t border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" 
                alt="Sofía Arismendi" 
                class="w-10 h-10 rounded-full object-cover border border-white/20" />
              <div>
                <h4 class="font-bold text-xs text-white">Sofía Arismendi</h4>
                <span class="text-[10px] text-slate-400">Backend Developer</span>
              </div>
            </div>
          </div>

          <!-- Testimonial 3 -->
          <div class="glass-card p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center gap-1 text-amber-400 text-xs">
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
                <svg lucideStar class="w-4 h-4 fill-amber-400"></svg>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed font-normal italic">
                "Lo que más destaco es la claridad de los ejercicios prácticos. Creas proyectos reales que luego puedes presentar en tu portafolio profesional."
              </p>
            </div>

            <div class="flex items-center gap-3 pt-3 border-t border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" 
                alt="Mateo Villalba" 
                class="w-10 h-10 rounded-full object-cover border border-white/20" />
              <div>
                <h4 class="font-bold text-xs text-white">Mateo Villalba</h4>
                <span class="text-[10px] text-slate-400">Frontend Developer</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- SECTION: PREGUNTAS FRECUENTES (FAQ Accordion) -->
      <section class="max-w-4xl mx-auto px-4 space-y-8">
        <div class="text-center space-y-3">
          <span class="text-xs font-mono uppercase tracking-wider text-[#FA743F] font-bold">PREGUNTAS FRECUENTES</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-white">¿Tienes Alguna Duda?</h2>
          <p class="text-xs md:text-sm text-slate-400">Respuestas rápidas a las consultas más habituales.</p>
        </div>

        <div class="space-y-4">
          @for (faq of faqs; track faq.id) {
            <div class="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all">
              <button 
                type="button"
                (click)="toggleFaq(faq.id)"
                class="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-[#A406E9] transition-colors cursor-pointer">
                <span>{{ faq.question }}</span>
                <svg lucideChevronDown 
                     class="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200"
                     [class.rotate-180]="openFaqId() === faq.id"></svg>
              </button>

              @if (openFaqId() === faq.id) {
                <div class="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-fade-in font-normal">
                  {{ faq.answer }}
                </div>
              }
            </div>
          }
        </div>
      </section>

    </div>
  `
})
export class LandingComponent {
  protected readonly courseService = inject(CourseService);
  protected readonly openFaqId = signal<number | null>(1);

  protected readonly faqs = [
    {
      id: 1,
      question: '¿Necesito conocimientos previos de programación para comenzar?',
      answer: 'No necesariamente. En TokiDev Learning disponemos de rutas estructuradas que inician desde los conceptos fundamentales de desarrollo web hasta temas de nivel avanzado en arquitectura de software.'
    },
    {
      id: 2,
      question: '¿Cómo funciona la metodología de estudio por días?',
      answer: 'Cada curso está organizado por módulos y días de estudio con objetivos claros y acotados. Esto te permite avanzar de forma constante sin acumular dudas ni sentir sobrecarga de información.'
    },
    {
      id: 3,
      question: '¿Puedo realizar preguntas o consultar dudas a los profesores?',
      answer: '¡Sí! Cada clase cuenta con un panel interactivo de discusión donde puedes publicar tus consultas y recibir respuestas de profesores y de la comunidad.'
    },
    {
      id: 4,
      question: '¿Al finalizar los cursos obtengo un certificado?',
      answer: 'Efectivamente. Al completar el 100% del temario y las prácticas de una ruta, la plataforma te otorga un certificado digital que acredita tus habilidades.'
    }
  ];

  constructor() {
    const authService = inject(AuthService);
    const router = inject(Router);

    effect(() => {
      const user = authService.currentUser();
      if (user) {
        if (user.role === 'STUDENT') {
          router.navigate(['/student/dashboard']);
        } else if (user.role === 'INSTRUCTOR') {
          router.navigate(['/instructor']);
        } else if (user.role === 'ADMIN') {
          router.navigate(['/admin']);
        }
      }
    });
  }

  toggleFaq(faqId: number): void {
    this.openFaqId.update(current => current === faqId ? null : faqId);
  }
}
