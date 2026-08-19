import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { 
  LucideArrowLeft, 
  LucideGraduationCap, 
  LucideSearch 
} from '@lucide/angular';

interface StudentRow {
  name: string;
  email: string;
  avatar: string;
  enrolledDate: string;
}

@Component({
  selector: 'app-admin-course-students',
  imports: [
    RouterLink, 
    ReactiveFormsModule,
    LucideArrowLeft,
    LucideGraduationCap,
    LucideSearch
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './course-students.html'
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
    return ((course.studentsCount || 0) * (course.price || 0) * 0.30).toFixed(2);
  }

  unenrollStudent(email: string): void {
    alert(`Baja de matrícula: Alumno (${email}) removido del curso.`);
  }
}
