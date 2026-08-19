import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { 
  LucideArrowLeft, 
  LucideMail
} from '@lucide/angular';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input';

interface StudentRow {
  name: string;
  email: string;
  avatar: string;
  enrolledDate: string;
}

@Component({
  selector: 'app-instructor-course-students',
  imports: [
    RouterLink, 
    LucideArrowLeft, 
    LucideMail,
    SearchInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './course-students.html'
})
export class InstructorCourseStudentsComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly courseService = inject(CourseService);

  protected readonly courseId = signal<string>('');
  protected readonly searchQuery = signal<string>('');

  protected readonly course = computed(() => {
    return this.courseService.coursesCatalog().find(c => c.id === this.courseId());
  });

  private readonly studentsMap: Record<string, StudentRow[]> = {
    'course_claude_ai': [
      {
        name: 'Rodrigo TokiDev',
        email: 'rodrigo@tokidev.io',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        enrolledDate: 'Inscrito: Hace 3 días'
      },
      {
        name: 'María Susana Vásquez',
        email: 'm.susana@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
        enrolledDate: 'Inscrito: Hace 1 semana'
      }
    ],
    'course_angular_21': [
      {
        name: 'Juan Carlos Pérez',
        email: 'j.carlos@hotmail.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        enrolledDate: 'Inscrito: Ayer'
      },
      {
        name: 'María Susana Vásquez',
        email: 'm.susana@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
        enrolledDate: 'Inscrito: Hace 5 días'
      }
    ]
  };

  protected readonly filteredStudents = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const students = this.studentsMap[this.courseId()] || [
      {
        name: 'Rodrigo TokiDev',
        email: 'rodrigo@tokidev.io',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        enrolledDate: 'Inscrito: Hoy'
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

  getAuthorEarnings(course: Course): string {
    return (course.studentsCount * course.price * 0.70).toFixed(2);
  }
}
