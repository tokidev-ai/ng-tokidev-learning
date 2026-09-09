import { Component, ChangeDetectionStrategy, inject, effect, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth.service';
import { 
  LucideArrowRight, 
  LucideStar, 
  LucideChevronDown, 
  LucideZap, 
  LucideCode, 
  LucideTerminal, 
  LucideCheckCircle2,
  LucideCompass,
  LucideGraduationCap,
  LucideShieldCheck,
  LucideUsers,
  LucideLayers,
  LucideClock
} from '@lucide/angular';

@Component({
  selector: 'app-landing',
  imports: [
    RouterLink, 
    LucideArrowRight, 
    LucideStar, 
    LucideChevronDown, 
    LucideZap, 
    LucideCode, 
    LucideTerminal, 
    LucideCheckCircle2,
    LucideCompass,
    LucideGraduationCap,
    LucideShieldCheck,
    LucideUsers,
    LucideLayers,
    LucideClock
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html'
})
export class LandingComponent {
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);
  protected readonly openFaqId = signal<number | null>(1);

  // Cursos reales dinámicos desde Firestore
  protected readonly featuredCourses = computed(() => {
    return this.courseService.coursesCatalog().slice(0, 3);
  });

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
    const router = inject(Router);

    effect(() => {
      const user = this.authService.currentUser();
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
