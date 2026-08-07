import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

interface StudentRow {
  name: string;
  email: string;
  avatar: string;
  enrolledDate: string;
}

@Component({
  selector: 'app-admin-course-students',
  imports: [RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-5xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div class="space-y-1">
            <span class="px-3 py-1 bg-[#A406E9]/20 text-[#A406E9] text-xs font-extrabold uppercase rounded-full border border-[#A406E9]/30">
              Admin / Matrículas
            </span>
            <h1 class="text-2xl md:text-3xl font-black text-white">Alumnos de la Ruta</h1>
            <p class="text-xs text-slate-400">Curso: <strong class="text-white">{{ course()?.title }}</strong></p>
          </div>
          
          <a routerLink="/admin/courses" class="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all">
            <i class="fa-solid fa-arrow-left mr-1"></i> Volver a Cursos
          </a>
        </div>

        <!-- Course Meta Card -->
        @if (course(); as c) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
              <span class="text-[10px] font-extrabold uppercase text-slate-400">Profesor</span>
              <div class="flex items-center gap-3">
                <img [src]="c.instructorAvatar" [alt]="c.instructorName" class="w-8 h-8 rounded-full object-cover border border-white/10" />
                <div>
                  <span class="font-bold text-xs text-white block">{{ c.instructorName }}</span>
                  <span class="text-[9px] text-slate-400 block">{{ c.instructorTitle }}</span>
                </div>
              </div>
            </div>

            <div class="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <span class="text-[10px] font-extrabold uppercase text-slate-400">Alumnos Inscritos</span>
              <div class="text-2xl font-black text-white font-mono">{{ c.studentsCount }}</div>
            </div>

            <div class="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <span class="text-[10px] font-extrabold uppercase text-slate-400">Ingresos Totales (30% Academia)</span>
              <div class="text-2xl font-black text-emerald-400 font-mono">\${{ getNetto(c) }} USD</div>
            </div>
          </div>
        }

        <!-- Students Audit Table -->
        <div class="glass-card rounded-3xl p-6 border border-white/10 space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 class="text-sm font-extrabold uppercase text-slate-400 tracking-wider">Matrículas Registradas</h3>
            
            <input 
              [formControl]="searchControl"
              type="text" 
              placeholder="Buscar estudiante..." 
              class="bg-slate-900 border border-white/10 focus:border-[#DA2984] outline-none px-4 py-2 rounded-xl text-xs text-white w-64" />
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-slate-400 font-extrabold uppercase">
                  <th class="py-3 px-4">Alumno</th>
                  <th class="py-3 px-4">Email</th>
                  <th class="py-3 px-4">Fecha de Inscripción</th>
                  <th class="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (student of filteredStudents(); track student.email) {
                  <tr class="border-b border-white/5 hover:bg-slate-900/40 transition-colors">
                    <td class="py-3.5 px-4 flex items-center gap-3">
                      <img [src]="student.avatar" [alt]="student.name" class="w-8 h-8 rounded-full object-cover border border-white/10" />
                      <span class="font-bold text-white">{{ student.name }}</span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-300 font-mono">{{ student.email }}</td>
                    <td class="py-3.5 px-4 text-slate-400 font-mono">{{ student.enrolledDate }}</td>
                    <td class="py-3.5 px-4 text-right">
                      <button 
                        type="button"
                        (click)="unenrollStudent(student.email)"
                        class="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-[10px] uppercase transition-colors cursor-pointer">
                        Dar de Baja
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-8 text-xs text-slate-500">Ningún alumno matriculado coincide con el criterio de búsqueda.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  `
})
export class AdminCourseStudentsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  protected readonly courseService = inject(CourseService);

  protected readonly courseId = signal<string>('');
  protected readonly searchControl = this.fb.control('');

  protected readonly course = computed(() => {
    return this.courseService.coursesCatalog().find(c => c.id === this.courseId());
  });

  private readonly studentsMap: Record<string, StudentRow[]> = {
    'course_claude_ai': [
      {
        name: 'Rodrigo TokiDev',
        email: 'rodrigo@tokidev.io',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        enrolledDate: 'Inscrito: 04/08/2026'
      },
      {
        name: 'María Susana Vásquez',
        email: 'm.susana@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
        enrolledDate: 'Inscrito: 01/08/2026'
      }
    ],
    'course_angular_21': [
      {
        name: 'Juan Carlos Pérez',
        email: 'j.carlos@hotmail.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        enrolledDate: 'Inscrito: 06/08/2026'
      },
      {
        name: 'María Susana Vásquez',
        email: 'm.susana@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
        enrolledDate: 'Inscrito: 02/08/2026'
      }
    ]
  };

  protected readonly filteredStudents = computed(() => {
    const search = (this.searchControl.value || '').toLowerCase().trim();
    const students = this.studentsMap[this.courseId()] || [
      {
        name: 'Rodrigo TokiDev',
        email: 'rodrigo@tokidev.io',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        enrolledDate: 'Inscrito: 07/08/2026'
      }
    ];

    if (!search) return students;
    return students.filter(s => s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search));
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.courseId.set(params.get('id') || '');
    });
  }

  getNetto(course: Course): string {
    return (course.studentsCount * course.price * 0.30).toFixed(2);
  }

  unenrollStudent(email: string): void {
    alert(`Baja de matrícula: Alumno (${email}) removido del curso.`);
  }
}
