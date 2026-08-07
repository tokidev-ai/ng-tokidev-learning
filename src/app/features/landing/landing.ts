import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../core/services/course.service';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 space-y-24 pb-20 overflow-hidden">
      
      <!-- HERO SECTION -->
      <section class="relative pt-10 lg:pt-16 px-4 lg:px-8">
        <!-- Soft Glow Spheres -->
        <div class="absolute top-10 left-1/3 -translate-x-1/2 w-[600px] h-[500px] bg-[#A406E9]/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div class="absolute top-30 right-10 w-[400px] h-[400px] bg-[#DA2984]/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <!-- Hero Text Column (Fixed Headline Flow) -->
          <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <!-- Balanced Headline Flow -->
            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Aprende Tecnología e IA
              <span class="text-brand-gradient block font-black pt-1">Paso a Paso, Día a Día</span>
            </h1>

            <!-- Clear Subtitle -->
            <p class="text-base md:text-lg text-slate-300 max-w-xl font-medium leading-relaxed">
              Formación dinámica estructurada por objetivos. Mira la lección, resuelve tus dudas en la comunidad y construye proyectos reales a tu propio ritmo.
            </p>

            <!-- Action CTAs -->
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a routerLink="/student/dashboard" 
                 class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#A406E9] via-[#DA2984] to-[#FA743F] text-white font-extrabold text-sm tracking-wide hover:opacity-95 transition-all shadow-xl shadow-[#A406E9]/25 flex items-center justify-center gap-3 group">
                <i class="fa-solid fa-play text-xs group-hover:scale-110 transition-transform"></i>
                Comenzar Mi Aprendizaje
              </a>

              <a routerLink="/catalog" 
                 class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-white/30 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <i class="fa-solid fa-compass text-slate-400 text-xs"></i>
                Explorar Cursos
              </a>
            </div>

            <!-- Social Proof -->
            <div class="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 border-t border-white/5">
              <div class="flex -space-x-2">
                <img class="inline-block h-8 w-8 rounded-full ring-2 ring-[#0B0A17] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="User" />
                <img class="inline-block h-8 w-8 rounded-full ring-2 ring-[#0B0A17] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="User" />
                <img class="inline-block h-8 w-8 rounded-full ring-2 ring-[#0B0A17] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="User" />
              </div>
              <div class="text-xs text-slate-300 font-semibold">
                <span class="text-amber-400 font-bold">★★★★★ 4.9/5</span> por más de <span class="text-white font-bold">10,000+ estudiantes</span>
              </div>
            </div>

          </div>

          <!-- Hero Right Column: Fixed Mockup (No Text Truncation) -->
          <div class="lg:col-span-5">
            <div class="bg-[#121026] rounded-3xl border border-white/15 shadow-2xl overflow-hidden group hover:border-[#A406E9]/40 transition-all">
              
              <!-- Window Header Controls -->
              <div class="bg-slate-950/80 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div class="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                  <i class="fa-solid fa-circle text-[8px] text-emerald-400 animate-pulse"></i>
                  <span>tokidev.learning/classroom</span>
                </div>
              </div>

              <!-- Interactive Video Frame Preview -->
              <div class="relative aspect-video bg-gradient-to-br from-slate-900 via-[#1C1635] to-[#0B0A17] p-5 flex flex-col justify-between overflow-hidden">
                
                <!-- Floating Badges -->
                <div class="flex items-center justify-between relative z-10">
                  <span class="px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-[11px] font-bold text-white border border-white/10">
                    DÍA 2 • LECCIÓN 1
                  </span>
                  <span class="px-2.5 py-1 bg-[#FA743F] text-white font-extrabold text-[11px] rounded-lg shadow-md shrink-0">
                    15 MIN
                  </span>
                </div>

                <!-- Play Button Center Overlay -->
                <div class="my-auto text-center relative z-10">
                  <a routerLink="/catalog" class="w-13 h-13 rounded-full bg-[#A406E9] hover:scale-110 text-white flex items-center justify-center mx-auto shadow-2xl shadow-[#A406E9]/50 transition-all cursor-pointer">
                    <i class="fa-solid fa-play text-base ml-1"></i>
                  </a>
                </div>

                <!-- Video Title Bottom Overlay -->
                <div class="relative z-10 space-y-0.5">
                  <span class="text-[10px] text-[#DA2984] font-mono uppercase tracking-wider font-bold block">REPRODUCIENDO AHORA</span>
                  <h4 class="font-bold text-xs sm:text-sm text-white leading-tight">Introducción a las Habilidades de IA & Automatización</h4>
                </div>

              </div>

              <!-- Card Bottom Info & Navigation (Fixed Flex Padding & No Cutoffs) -->
              <div class="p-5 space-y-4 bg-slate-900/80">
                <div class="flex items-center justify-between gap-2 text-xs border-b border-white/10 pb-3">
                  <div class="flex items-center gap-3 text-slate-300 font-bold text-[11px]">
                    <span class="text-[#A406E9] flex items-center gap-1"><i class="fa-solid fa-list-ul"></i> Temario</span>
                    <span class="text-slate-400 hover:text-white transition-colors flex items-center gap-1"><i class="fa-regular fa-comments"></i> Discusión</span>
                  </div>
                  <span class="text-[11px] text-emerald-400 font-bold font-mono shrink-0">35% Completado</span>
                </div>

                <a routerLink="/catalog" class="w-full py-3 rounded-xl bg-gradient-to-r from-[#A406E9] to-[#DA2984] hover:opacity-90 text-white font-extrabold text-xs text-center block transition-all shadow-md">
                  Explorar Temarios
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- FEATURES SECTION -->
      <section class="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <span class="text-xs font-extrabold uppercase tracking-wider text-[#A406E9]">¿POR QUÉ TOKIDEV LEARNING?</span>
          <h2 class="text-3xl md:text-5xl font-black text-white">La Forma Más Clara de Aprender</h2>
          <p class="text-sm text-slate-400">Avanza paso a paso sin perderte entre cientos de videos dispersos.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Feature 1 -->
          <div class="glass-card p-8 rounded-3xl space-y-4 hover:border-[#A406E9]/40 transition-all">
            <div class="w-12 h-12 rounded-2xl bg-[#A406E9]/20 border border-[#A406E9]/40 text-[#A406E9] flex items-center justify-center text-xl">
              <i class="fa-solid fa-calendar-day"></i>
            </div>
            <h3 class="text-xl font-bold text-white">Objetivos Diarios</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Cada lección está organizada por días y módulos para que sepas exactamente qué estudiar hoy.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="glass-card p-8 rounded-3xl space-y-4 hover:border-[#DA2984]/40 transition-all">
            <div class="w-12 h-12 rounded-2xl bg-[#DA2984]/20 border border-[#DA2984]/40 text-[#DA2984] flex items-center justify-center text-xl">
              <i class="fa-solid fa-comments"></i>
            </div>
            <h3 class="text-xl font-bold text-white">Preguntas y Discusión</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Publica tus dudas directamente en cada clase y recibe respuestas claras de profesores y otros estudiantes.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="glass-card p-8 rounded-3xl space-y-4 hover:border-[#FA743F]/40 transition-all">
            <div class="w-12 h-12 rounded-2xl bg-[#FA743F]/20 border border-[#FA743F]/40 text-[#FA743F] flex items-center justify-center text-xl">
              <i class="fa-solid fa-award"></i>
            </div>
            <h3 class="text-xl font-bold text-white">Proyectos Prácticos</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Aplica lo aprendido inmediatamente con ejercicios guiados que consolidan tu conocimiento.
            </p>
          </div>

        </div>
      </section>

      <!-- COURSES SHOWCASE -->
      <section class="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div class="space-y-1">
            <span class="text-xs font-extrabold uppercase tracking-wider text-[#FA743F]">RUTAS DISPONIBLES</span>
            <h2 class="text-3xl font-black text-white">Explora los Cursos</h2>
          </div>
          <a routerLink="/catalog" class="text-xs font-bold text-[#A406E9] hover:underline flex items-center gap-1">
            Ver catálogo completo <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Course Card 1: IA & Automatización -->
          <div class="glass-card rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group border border-white/10 hover:border-[#A406E9]/40">
            <div>
              <div class="relative h-44 bg-gradient-to-br from-[#121026] via-[#1F143D] to-[#0B0A17] p-6 flex flex-col justify-between overflow-hidden">
                <div class="flex items-center justify-between relative z-10">
                  <span class="px-3 py-1 bg-[#A406E9]/30 text-[#A406E9] font-extrabold text-[10px] uppercase rounded-full border border-[#A406E9]/40">
                    INTELIGENCIA ARTIFICIAL
                  </span>
                  <span class="px-2.5 py-1 bg-[#FA743F] text-white font-extrabold text-xs rounded-lg flex items-center gap-1 shadow-md">
                    <i class="fa-solid fa-star text-yellow-200"></i> 4.9
                  </span>
                </div>

                <div class="flex items-center gap-3 relative z-10">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A406E9] to-[#DA2984] flex items-center justify-center text-white text-xl shadow-lg">
                    <i class="fa-solid fa-brain"></i>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-white block">IA & Automatización</span>
                    <span class="text-[10px] text-slate-400 font-mono">24 MÓDULOS • 5 DÍAS</span>
                  </div>
                </div>
              </div>

              <div class="p-6 space-y-4">
                <h3 class="font-extrabold text-lg text-white group-hover:text-[#A406E9] transition-colors leading-snug">
                  5 días de Inteligencia Artificial & Automatización
                </h3>
                <p class="text-xs text-slate-400 leading-relaxed">
                  Aprende a dominar herramientas de IA, estructurar respuestas de alta precisión y automatizar tus tareas diarias.
                </p>

                <div class="flex items-center gap-3 pt-2">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" alt="Lorenley" class="w-8 h-8 rounded-full object-cover border-2 border-[#A406E9]" />
                  <div class="text-xs font-semibold text-slate-300">
                    Lorenley Martínez <span class="text-[10px] text-slate-500 font-normal block">Especialista en IA</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="px-6 pb-6 pt-3 border-t border-white/5 flex items-center justify-between">
              <span class="text-xs text-slate-400 font-mono">14 horas • Todos los niveles</span>
              <a routerLink="/catalog/course_claude_ai" class="px-5 py-2.5 rounded-xl bg-[#A406E9] hover:bg-[#B522FA] text-xs font-extrabold text-white transition-all shadow-md">
                Ver Curso
              </a>
            </div>
          </div>

          <!-- Course Card 2: Desarrollo Web -->
          <div class="glass-card rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group border border-white/10 hover:border-[#F53955]/40">
            <div>
              <div class="relative h-44 bg-gradient-to-br from-[#1F101A] via-[#2A1221] to-[#0B0A17] p-6 flex flex-col justify-between overflow-hidden">
                <div class="flex items-center justify-between relative z-10">
                  <span class="px-3 py-1 bg-[#F53955]/30 text-[#F53955] font-extrabold text-[10px] uppercase rounded-full border border-[#F53955]/40">
                    DESARROLLO WEB
                  </span>
                  <span class="px-2.5 py-1 bg-[#FA743F] text-white font-extrabold text-xs rounded-lg flex items-center gap-1 shadow-md">
                    <i class="fa-solid fa-star text-yellow-200"></i> 4.95
                  </span>
                </div>

                <div class="flex items-center gap-3 relative z-10">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F53955] to-[#DA2984] flex items-center justify-center text-white text-xl shadow-lg">
                    <i class="fa-solid fa-laptop-code"></i>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-white block">Desarrollo Web Moderno</span>
                    <span class="text-[10px] text-slate-400 font-mono">18 MÓDULOS • ANGULAR 21</span>
                  </div>
                </div>
              </div>

              <div class="p-6 space-y-4">
                <h3 class="font-extrabold text-lg text-white group-hover:text-[#F53955] transition-colors leading-snug">
                  Desarrollo Web Moderno con Angular 21
                </h3>
                <p class="text-xs text-slate-400 leading-relaxed">
                  Aprende a construir plataformas y sitios web dinámicos, rápidos y reactivos con las últimas tendencias.
                </p>

                <div class="flex items-center gap-3 pt-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Rodrigo" class="w-8 h-8 rounded-full object-cover border-2 border-[#F53955]" />
                  <div class="text-xs font-semibold text-slate-300">
                    Rodrigo TokiDev <span class="text-[10px] text-slate-500 font-normal block">Lead Developer</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="px-6 pb-6 pt-3 border-t border-white/5 flex items-center justify-between">
              <span class="text-xs text-slate-400 font-mono">22 horas • Intermedio</span>
              <a routerLink="/catalog/course_angular_21" class="px-5 py-2.5 rounded-xl bg-[#F53955] hover:bg-[#FF4D6D] text-xs font-extrabold text-white transition-all shadow-md">
                Ver Curso
              </a>
            </div>
          </div>

          <!-- Course Card 3: Diseño UI/UX -->
          <div class="glass-card rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group border border-white/10 hover:border-[#DA2984]/40">
            <div>
              <div class="relative h-44 bg-gradient-to-br from-[#1F1022] via-[#2D1333] to-[#0B0A17] p-6 flex flex-col justify-between overflow-hidden">
                <div class="flex items-center justify-between relative z-10">
                  <span class="px-3 py-1 bg-[#DA2984]/30 text-[#DA2984] font-extrabold text-[10px] uppercase rounded-full border border-[#DA2984]/40">
                    DISEÑO & PRODUCTO
                  </span>
                  <span class="px-2.5 py-1 bg-[#FA743F] text-white font-extrabold text-xs rounded-lg flex items-center gap-1 shadow-md">
                    <i class="fa-solid fa-star text-yellow-200"></i> 4.88
                  </span>
                </div>

                <div class="flex items-center gap-3 relative z-10">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DA2984] to-[#A406E9] flex items-center justify-center text-white text-xl shadow-lg">
                    <i class="fa-solid fa-palette"></i>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-white block">Diseño UI/UX Digital</span>
                    <span class="text-[10px] text-slate-400 font-mono">12 MÓDULOS • FIGMA & UI</span>
                  </div>
                </div>
              </div>

              <div class="p-6 space-y-4">
                <h3 class="font-extrabold text-lg text-white group-hover:text-[#DA2984] transition-colors leading-snug">
                  Diseño de Productos Digitales & UI/UX
                </h3>
                <p class="text-xs text-slate-400 leading-relaxed">
                  Aprende principios de diseño visual, paletas de colores, composición de interfaces y prototipado interactivo.
                </p>

                <div class="flex items-center gap-3 pt-2">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Sofía" class="w-8 h-8 rounded-full object-cover border-2 border-[#DA2984]" />
                  <div class="text-xs font-semibold text-slate-300">
                    Sofía Ramírez <span class="text-[10px] text-slate-500 font-normal block">Product Designer</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="px-6 pb-6 pt-3 border-t border-white/5 flex items-center justify-between">
              <span class="text-xs text-slate-400 font-mono">12 horas • Principiante</span>
              <a routerLink="/catalog/course_ui_design" class="px-5 py-2.5 rounded-xl bg-[#DA2984] hover:bg-[#EA3DA0] text-xs font-extrabold text-white transition-all shadow-md">
                Ver Curso
              </a>
            </div>
          </div>

        </div>
      </section>

      <!-- BRAND ABOUT SECTION (Acerca de) -->
      <section class="max-w-7xl mx-auto px-4 lg:px-8">
        <div class="glass-card rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border border-white/10">
          
          <div class="lg:col-span-5 relative">
            <div class="absolute -inset-1 bg-gradient-to-tr from-[#A406E9] to-[#FA743F] rounded-2xl blur opacity-30"></div>
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" 
              alt="Rodrigo TokiDev" 
              class="relative rounded-2xl object-cover w-full aspect-[4/3] shadow-2xl border border-white/15" />
          </div>

          <div class="lg:col-span-7 space-y-5">
            <span class="text-xs font-extrabold uppercase tracking-wider text-[#DA2984]">Acerca de TokiDev</span>
            <h2 class="text-2xl md:text-4xl font-black text-white">Metodología Basada en la Práctica Diaria</h2>
            <p class="text-xs md:text-sm text-slate-300 leading-relaxed">
              Hola, soy Rodrigo, arquitecto de software y fundador de <strong>TokiDev.learning</strong>. Mi objetivo es simplificar la formación técnica y de IA. Creo firmemente que la mejor manera de aprender desarrollo web no es ver interminables horas de video pasivamente, sino enfrentarse a desafíos prácticos todos los días.
            </p>
            <p class="text-xs md:text-sm text-slate-400 leading-relaxed">
              En esta plataforma diseñamos cursos compactos estructurados paso a paso para que logres metas reales en menor tiempo, acompañados de una comunidad activa donde nunca estarás solo.
            </p>

            <div class="pt-2 flex gap-4">
              <a 
                routerLink="/mentorships"
                class="px-5 py-2.5 rounded-xl bg-[#DA2984] hover:bg-[#EA3DA0] text-xs font-extrabold text-white transition-all shadow-md cursor-pointer">
                Conoce Mis Mentorías 1-a-1
              </a>
            </div>
          </div>
          
        </div>
      </section>

      <!-- TESTIMONIALS SECTION -->
      <section class="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
        <div class="text-center space-y-3 max-w-2xl mx-auto">
          <span class="text-xs font-extrabold uppercase tracking-wider text-[#A406E9]">TESTIMONIOS DE ESTUDIANTES</span>
          <h2 class="text-3xl font-black text-white">Casos de Éxito Reales</h2>
          <p class="text-xs text-slate-400">Descubre lo que opinan los alumnos que han transformado sus habilidades con nosotros.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div class="flex items-center gap-1 text-amber-400 text-xs">
              <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed italic">
              "Los 5 días de IA & Automatización cambiaron mi flujo de trabajo como freelance. Pude automatizar mi facturación y reportes semanales en tiempo récord."
            </p>
            <div class="flex items-center gap-3 pt-2">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Laura" class="w-8 h-8 rounded-full object-cover border border-white/10" />
              <div>
                <span class="font-bold text-xs text-white block">Laura Méndez</span>
                <span class="text-[10px] text-slate-500 font-mono">Freelance Developer</span>
              </div>
            </div>
          </div>

          <div class="glass-card p-6 rounded-2xl border border-[#DA2984]/30 space-y-4 relative">
            <span class="absolute -top-3 right-4 px-2 py-0.5 rounded bg-[#DA2984] text-white text-[9px] font-extrabold uppercase tracking-wider">RECOMENDADO</span>
            <div class="flex items-center gap-1 text-amber-400 text-xs">
              <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed italic">
              "El curso de Angular 21 es de lo mejor que he tomado. Muy directo al grano, implementando Signals y Standalone components desde el día 1."
            </p>
            <div class="flex items-center gap-3 pt-2">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" alt="Carlos" class="w-8 h-8 rounded-full object-cover border border-white/10" />
              <div>
                <span class="font-bold text-xs text-white block">Carlos Ortega</span>
                <span class="text-[10px] text-slate-500 font-mono">Frontend Engineer</span>
              </div>
            </div>
          </div>

          <div class="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div class="flex items-center gap-1 text-amber-400 text-xs">
              <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed italic">
              "Me encantó la posibilidad de publicar preguntas y recibir respuestas de calidad del mentor casi al instante. Comunidad súper sana."
            </p>
            <div class="flex items-center gap-3 pt-2">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Susana" class="w-8 h-8 rounded-full object-cover border border-white/10" />
              <div>
                <span class="font-bold text-xs text-white block">María Susana V.</span>
                <span class="text-[10px] text-slate-500 font-mono">Estudiante Activa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MENTORSHIPS SECTION -->
      <section id="mentorships-section" class="max-w-5xl mx-auto px-4 lg:px-8 space-y-12 pt-6">
        <div class="text-center space-y-3 max-w-2xl mx-auto">
          <span class="px-3 py-1 bg-[#DA2984]/20 text-[#DA2984] text-xs font-extrabold uppercase rounded-full border border-[#DA2984]/30">
            Mentoría de Alto Rendimiento 1-a-1
          </span>
          <h2 class="text-3xl md:text-4xl font-black text-white">Lleva tu Carrera al Siguiente Nivel</h2>
          <p class="text-xs md:text-sm text-slate-400">
            Acompañamiento personalizado de la mano de profesionales activos. Diseñamos un plan a tu medida para acelerar tu inserción o ascenso laboral.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-white">¿Qué incluye el programa de mentoría?</h3>
            <div class="space-y-4">
              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-xl bg-[#A406E9]/20 text-[#A406E9] flex items-center justify-center text-sm shrink-0 border border-[#A406E9]/30">
                  <i class="fa-solid fa-calendar-check"></i>
                </div>
                <div>
                  <h4 class="font-bold text-xs text-white">Sesiones Semanales</h4>
                  <p class="text-[11px] text-slate-400 leading-normal">Videollamadas 1-a-1 de 45 minutos para resolver bloqueos de código, arquitectura y desarrollo profesional.</p>
                </div>
              </div>

              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-xl bg-[#DA2984]/20 text-[#DA2984] flex items-center justify-center text-sm shrink-0 border border-[#DA2984]/30">
                  <i class="fa-solid fa-code"></i>
                </div>
                <div>
                  <h4 class="font-bold text-xs text-white">Revisión de Código</h4>
                  <p class="text-[11px] text-slate-400 leading-normal">Acceso directo para revisión de tus Pull Requests y dudas de diseño en tus proyectos personales o laborales.</p>
                </div>
              </div>

              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-xl bg-[#FA743F]/20 text-[#FA743F] flex items-center justify-center text-sm shrink-0 border border-[#FA743F]/30">
                  <i class="fa-solid fa-route"></i>
                </div>
                <div>
                  <h4 class="font-bold text-xs text-white">Ruta Estratégica</h4>
                  <p class="text-[11px] text-slate-400 leading-normal">Elaboración de una ruta de estudio y objetivos personalizados de acuerdo con tus metas profesionales de mediano y largo plazo.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DA2984] to-[#FA743F] flex items-center justify-center text-white text-xl">
                <i class="fa-solid fa-user-tie"></i>
              </div>
              <h3 class="text-base font-bold text-white">Proceso de Selección Activo</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Seleccionamos únicamente a 3 personas por mes para garantizar el máximo nivel de atención y foco personalizado.
              </p>
            </div>

            <div class="pt-6">
              <a 
                href="https://tokidev.io/mentorship-apply" 
                target="_blank"
                class="w-full py-3 rounded-2xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold tracking-wider uppercase text-white shadow-lg shadow-[#DA2984]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2">
                Postularse al Programa <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ SECTION -->
      <section class="max-w-4xl mx-auto px-4 lg:px-8 space-y-8">
        <div class="text-center space-y-2">
          <span class="text-xs font-extrabold uppercase tracking-wider text-[#FA743F]">PREGUNTAS FRECUENTES</span>
          <h2 class="text-3xl font-black text-white">¿Tienes Dudas? Te Respondemos</h2>
        </div>

        <div class="space-y-4">
          @for (faq of faqs(); track faq.q) {
            <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
              <h3 class="font-bold text-base text-white flex items-center justify-between">
                {{ faq.q }}
                <i class="fa-solid fa-chevron-down text-xs text-slate-400"></i>
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                {{ faq.a }}
              </p>
            </div>
          }
        </div>
      </section>

    </div>
  `
})
export class LandingComponent {
  protected readonly courseService = inject(CourseService);

  protected readonly faqs = signal([
    {
      q: '¿Necesito experiencia previa para tomar los cursos?',
      a: 'Nuestros cursos están diseñados con niveles accesibles (Principiante, Intermedio, Avanzado). Cada lección empieza desde los conceptos fundamentales.'
    },
    {
      q: '¿Cómo funciona la sección de preguntas y discusión?',
      a: 'En el Aula Virtual encontrarás una pestaña dedicada para realizar preguntas sobre la lección actual y recibir retroalimentación del equipo y otros estudiantes.'
    },
    {
      q: '¿Recibiré acceso inmediato al inscribirme?',
      a: 'Sí, tan pronto como ingreses tendrás acceso inmediato a todas las lecciones, rutas activas y recursos de aprendizaje.'
    }
  ]);
}
