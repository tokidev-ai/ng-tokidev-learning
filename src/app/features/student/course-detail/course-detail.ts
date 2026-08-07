import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-5xl mx-auto space-y-8">
        
        <!-- Back Button -->
        <div>
          <a routerLink="/catalog" class="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
            <i class="fa-solid fa-arrow-left"></i> Volver al Catálogo
          </a>
        </div>

        @if (course(); as c) {
          <!-- Main Course Hero Info -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Left Info column -->
            <div class="lg:col-span-8 space-y-6">
              <div class="space-y-3">
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 bg-[#A406E9]/20 text-[#A406E9] text-xs font-extrabold uppercase rounded-full border border-[#A406E9]/30">
                    {{ c.category }}
                  </span>
                  <span class="px-3 py-1 bg-slate-900 text-slate-400 text-xs font-bold rounded-full border border-white/10">
                    {{ c.level }}
                  </span>
                </div>
                <h1 class="text-3xl md:text-5xl font-black text-white leading-tight">
                  {{ c.title }}
                </h1>
                <p class="text-xs md:text-sm text-slate-300 leading-relaxed">
                  {{ c.description }}
                </p>
              </div>

              <!-- Author / Ratings info -->
              <div class="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div class="flex items-center gap-3">
                  <img [src]="c.instructorAvatar" [alt]="c.instructorName" class="w-10 h-10 rounded-full object-cover border border-[#DA2984]" />
                  <div>
                    <span class="text-xs text-slate-400 block leading-none">Creado por</span>
                    <span class="text-xs font-bold text-white">{{ c.instructorName }}</span>
                  </div>
                </div>

                <div class="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

                <div class="flex items-center gap-2">
                  <span class="text-xs text-[#FA743F] font-black flex items-center gap-1">
                    {{ c.rating }} <i class="fa-solid fa-star text-yellow-400"></i>
                  </span>
                  <span class="text-[10px] text-slate-500">({{ c.reviewsCount }} reseñas)</span>
                </div>

                <div class="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

                <div class="text-xs">
                  <span class="text-slate-400 block leading-none">Estudiantes inscritos</span>
                  <span class="font-bold text-white">{{ c.studentsCount.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Course Syllabus (Temario) -->
              <div class="space-y-4">
                <h2 class="text-xl font-bold text-white">Contenido del Curso</h2>
                
                @if (path(); as p) {
                  <div class="space-y-4">
                    @for (day of p.days; track day.id) {
                      <div class="glass-card rounded-2xl p-5 space-y-3">
                        <div class="flex items-center justify-between border-b border-white/5 pb-2">
                          <h3 class="font-bold text-sm text-white uppercase">{{ day.title }}</h3>
                          <span class="text-[10px] text-slate-400 font-mono">{{ day.lessons.length }} clases</span>
                        </div>
                        
                        <div class="space-y-2">
                          @for (lesson of day.lessons; track lesson.id) {
                            <div class="flex items-center justify-between text-xs py-1 text-slate-300">
                              <span class="flex items-center gap-2">
                                <i class="fa-regular fa-circle-play text-slate-500"></i>
                                {{ lesson.title }}
                              </span>
                              <span class="text-[10px] text-slate-500 font-mono">{{ lesson.durationMinutes }} min</span>
                            </div>
                          }
                        </div>
                      </div>
                    } @empty {
                      <div class="text-xs text-slate-500 italic p-4 bg-slate-900/30 rounded-xl">Este curso se encuentra en fase de planeación y no tiene lecciones publicadas aún.</div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Right checkout column -->
            <div class="lg:col-span-4 sticky top-24">
              <div class="glass-card rounded-3xl p-6 border border-white/20 space-y-6 shadow-2xl relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-28 h-28 bg-[#DA2984]/10 rounded-full blur-xl"></div>
                
                <!-- Thumbnail -->
                <img [src]="c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'" 
                     [alt]="c.title" 
                     class="w-full aspect-video object-cover rounded-2xl border border-white/10" />

                <!-- Price and details -->
                <div class="space-y-2">
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-black text-white">\${{ c.price }}</span>
                    <span class="text-xs text-slate-400 font-mono">USD</span>
                    <span class="text-[10px] text-emerald-400 font-extrabold uppercase ml-auto">PAGO ÚNICO</span>
                  </div>
                  <p class="text-[11px] text-slate-400">Acceso de por vida a los videos y recursos de la comunidad.</p>
                </div>

                <!-- CTA -->
                @if (isAlreadyEnrolled(c.id)) {
                  <button 
                    type="button"
                    (click)="goToClassroom(c)"
                    class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#A406E9] to-[#DA2984] hover:opacity-95 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#A406E9]/25">
                    Ingresar al Aula Virtual <i class="fa-solid fa-arrow-right"></i>
                  </button>
                } @else {
                  <button 
                    type="button"
                    (click)="isCheckoutOpen.set(true)"
                    class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#DA2984] to-[#FA743F] hover:opacity-95 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#DA2984]/25">
                    Adquirir Curso <i class="fa-solid fa-cart-shopping"></i>
                  </button>
                }

                <div class="space-y-3 pt-4 border-t border-white/5 text-[11px] text-slate-400">
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-infinity text-[#A406E9]"></i>
                    <span>Acceso ilimitado sin vencimiento</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-award text-[#DA2984]"></i>
                    <span>Certificado de finalización digital</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-comments text-[#FA743F]"></i>
                    <span>Foro de consultas directas con el tutor</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <!-- MOCK PAYMENT CHECKOUT DIALOG -->
          @if (isCheckoutOpen()) {
            <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
              <div class="glass-card max-w-md w-full p-6 rounded-3xl space-y-6 border border-white/20 shadow-2xl">
                
                @if (isPaymentProcessing()) {
                  <div class="text-center py-10 space-y-4">
                    <div class="w-12 h-12 rounded-full bg-[#DA2984]/20 text-[#DA2984] flex items-center justify-center mx-auto text-xl animate-spin">
                      <i class="fa-solid fa-spinner"></i>
                    </div>
                    <div class="space-y-1">
                      <h4 class="font-bold text-white text-base">Procesando Pago Seguro</h4>
                      <p class="text-xs text-slate-400">Por favor, no cierres esta ventana...</p>
                    </div>
                  </div>
                } @else if (isPaymentSuccess()) {
                  <div class="text-center py-8 space-y-4">
                    <div class="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl shadow-lg">
                      <i class="fa-solid fa-check"></i>
                    </div>
                    <div class="space-y-1">
                      <h4 class="font-bold text-white text-lg">¡Inscripción Exitosa!</h4>
                      <p class="text-xs text-slate-400 px-4">Felicidades, ya tienes acceso al curso. Redirigiéndote al aula virtual...</p>
                    </div>
                  </div>
                } @else {
                  <!-- Standard Checkout Form -->
                  <div class="flex items-center justify-between">
                    <h3 id="checkout-title" class="text-lg font-extrabold text-white flex items-center gap-2">
                      <i class="fa-solid fa-shield-halved text-emerald-400"></i> Checkout Seguro
                    </h3>
                    <button (click)="isCheckoutOpen.set(false)" class="text-slate-400 hover:text-white cursor-pointer" aria-label="Cerrar modal">
                      <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                  </div>

                  <div class="p-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                    <span class="font-bold text-slate-300">{{ c.title }}</span>
                    <span class="font-black text-white">\${{ c.price }} USD</span>
                  </div>

                  <form [formGroup]="paymentForm" (ngSubmit)="processPayment(c)" class="space-y-4">
                    <div class="space-y-1.5">
                      <label class="text-[10px] font-bold uppercase text-slate-400">Número de Tarjeta</label>
                      <div class="relative">
                        <input 
                          type="text" 
                          formControlName="cardNumber"
                          placeholder="4000 1234 5678 9010" 
                          class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 pl-10 rounded-xl text-xs text-white transition-colors" />
                        <i class="fa-regular fa-credit-card absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      </div>
                      @if (paymentForm.get('cardNumber')?.touched && paymentForm.get('cardNumber')?.invalid) {
                        <span class="text-[9px] text-rose-500 font-bold block">Por favor introduce un número de tarjeta válido (16 dígitos).</span>
                      }
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold uppercase text-slate-400">Expiración (MM/AA)</label>
                        <input 
                          type="text" 
                          formControlName="expDate"
                          placeholder="12/28" 
                          class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors text-center" />
                        @if (paymentForm.get('expDate')?.touched && paymentForm.get('expDate')?.invalid) {
                          <span class="text-[9px] text-rose-500 font-bold block">Ej. MM/AA requerido.</span>
                        }
                      </div>

                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold uppercase text-slate-400">CVC</label>
                        <input 
                          type="password" 
                          formControlName="cvc"
                          placeholder="•••" 
                          maxlength="3"
                          class="w-full bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none p-3 rounded-xl text-xs text-white transition-colors text-center" />
                        @if (paymentForm.get('cvc')?.touched && paymentForm.get('cvc')?.invalid) {
                          <span class="text-[9px] text-rose-500 font-bold block">3 dígitos.</span>
                        }
                      </div>
                    </div>

                    <button 
                      type="submit"
                      [disabled]="paymentForm.invalid"
                      class="w-full py-3.5 bg-gradient-to-r from-[#DA2984] to-[#FA743F] text-xs font-extrabold uppercase text-white rounded-xl shadow-lg shadow-[#DA2984]/30 cursor-pointer disabled:opacity-40 transition-all hover:opacity-95">
                      Pagar y Comenzar a Estudiar
                    </button>
                  </form>
                }

              </div>
            </div>
          }
        } @else {
          <div class="glass-card p-12 text-center rounded-2xl space-y-4">
            <div class="text-xs text-slate-400">Cargando detalles del curso...</div>
          </div>
        }

      </div>
    </div>
  `
})
export class CourseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly isCheckoutOpen = signal(false);
  protected readonly isPaymentProcessing = signal(false);
  protected readonly isPaymentSuccess = signal(false);

  protected readonly paymentForm = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern('^[0-9\\s]{16,19}$')]],
    expDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/?([0-9]{2})$')]],
    cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3}$')]]
  });

  protected readonly courseId = computed(() => {
    return this.route.snapshot.paramMap.get('id') || '';
  });

  protected readonly course = computed(() => {
    const id = this.courseId();
    return this.courseService.coursesCatalog().find(c => c.id === id) || null;
  });

  protected readonly path = computed(() => {
    const c = this.course();
    if (!c) return null;
    return this.courseService.learningPaths().find(p => p.id === c.learningPathId) || null;
  });

  isAlreadyEnrolled(courseId: string): boolean {
    const c = this.course();
    if (!c) return false;
    // Verifica si hay una inscripción para la ruta de aprendizaje de este curso
    return this.courseService.myEnrollments().some(e => e.pathId === c.learningPathId);
  }

  goToClassroom(course: any): void {
    this.courseService.selectPath(course.learningPathId);
    // Buscar la primera lección del primer día si existe
    const path = this.courseService.learningPaths().find(p => p.id === course.learningPathId);
    const firstLessonId = path?.days[0]?.lessons[0]?.id;
    if (firstLessonId) {
      this.courseService.selectLesson(firstLessonId);
      this.router.navigate(['/classroom', firstLessonId]);
    } else {
      this.router.navigate(['/classroom']);
    }
  }

  async processPayment(course: any): Promise<void> {
    if (this.paymentForm.valid) {
      this.isPaymentProcessing.set(true);

      try {
        // Simular tiempo de carga del procesador de pagos
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Guardar inscripción en Firestore de verdad
        await this.courseService.enrollInPath(course.learningPathId);

        this.isPaymentProcessing.set(false);
        this.isPaymentSuccess.set(true);

        setTimeout(() => {
          this.isCheckoutOpen.set(false);
          this.isPaymentSuccess.set(false);
          this.goToClassroom(course);
        }, 1500);
      } catch (err) {
        console.error('Error al matricularse en el curso:', err);
        alert('Ocurrió un error al procesar la inscripción.');
        this.isPaymentProcessing.set(false);
      }
    }
  }
}
