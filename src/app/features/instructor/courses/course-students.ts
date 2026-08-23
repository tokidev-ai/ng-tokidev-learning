import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { EnrolledStudentItem, Enrollment } from '../../../core/models/discussion.model';
import { 
  LucideArrowLeft, 
  LucideUsers, 
  LucideLock, 
  LucideUnlock, 
  LucideDollarSign,
  LucideLoader2
} from '@lucide/angular';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';
import { db } from '../../../core/firebase/firebase';
import { collection, onSnapshot, query, where, doc, getDoc, Unsubscribe } from 'firebase/firestore';

@Component({
  selector: 'app-instructor-course-students',
  imports: [
    RouterLink, 
    LucideArrowLeft, 
    LucideUsers,
    LucideLock,
    LucideUnlock,
    LucideDollarSign,
    LucideLoader2,
    SearchInputComponent,
    ConfirmModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './course-students.html'
})
export class InstructorCourseStudentsComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  protected readonly courseService = inject(CourseService);

  protected readonly courseId = signal<string>('');
  protected readonly searchQuery = signal<string>('');
  protected readonly enrolledStudents = signal<EnrolledStudentItem[]>([]);
  protected readonly isLoadingStudents = signal<boolean>(true);

  // Modal State
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly isProcessingAction = signal<boolean>(false);
  protected readonly selectedStudent = signal<EnrolledStudentItem | null>(null);
  protected readonly modalAction = signal<'block' | 'unblock' | null>(null);

  private enrollmentsUnsubscribe: Unsubscribe | null = null;

  protected readonly course = computed(() => {
    return this.courseService.coursesCatalog().find(c => c.id === this.courseId());
  });

  protected readonly filteredStudents = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const list = this.enrolledStudents();

    if (!search) return list;
    return list.filter(s => 
      s.name.toLowerCase().includes(search) || 
      s.email.toLowerCase().includes(search)
    );
  });

  protected readonly activeStudentsCount = computed(() => {
    return this.enrolledStudents().filter(s => s.status !== 'blocked').length;
  });

  protected readonly blockedStudentsCount = computed(() => {
    return this.enrolledStudents().filter(s => s.status === 'blocked').length;
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '';
      this.courseId.set(id);
    });

    // Escuchar inscripciones en tiempo real cuando el curso esté disponible
    effect(() => {
      const c = this.course();
      if (c && c.learningPathId) {
        this.listenToEnrollments(c.learningPathId);
      } else if (c) {
        this.isLoadingStudents.set(false);
        this.enrolledStudents.set([]);
      }
    });
  }

  private listenToEnrollments(pathId: string): void {
    if (this.enrollmentsUnsubscribe) {
      this.enrollmentsUnsubscribe();
      this.enrollmentsUnsubscribe = null;
    }

    this.isLoadingStudents.set(true);

    const enrollmentsQuery = query(
      collection(db, 'enrollments'), 
      where('pathId', '==', pathId)
    );

    this.enrollmentsUnsubscribe = onSnapshot(enrollmentsQuery, async (snapshot) => {
      try {
        const studentList: EnrolledStudentItem[] = [];

        for (const eDoc of snapshot.docs) {
          const eData = eDoc.data() as Enrollment;
          
          // Obtener datos del perfil de usuario desde Firestore
          let userName = 'Estudiante TokiDev';
          let userEmail = 'estudiante@tokidev.io';
          let userAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(eData.userId)}`;

          try {
            const userDocSnap = await getDoc(doc(db, 'users', eData.userId));
            if (userDocSnap.exists()) {
              const uData = userDocSnap.data();
              userName = uData['name'] || userName;
              userEmail = uData['email'] || userEmail;
              userAvatar = uData['avatar'] || userAvatar;
            }
          } catch (userErr) {
            console.warn('No se pudo cargar perfil de usuario:', eData.userId, userErr);
          }

          let enrolledDateFormatted = 'Reciente';
          if (eData.enrolledAt) {
            try {
              const date = eData.enrolledAt.toDate ? eData.enrolledAt.toDate() : new Date();
              enrolledDateFormatted = date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              });
            } catch {
              enrolledDateFormatted = 'Registrado';
            }
          }

          studentList.push({
            enrollmentId: eDoc.id,
            userId: eData.userId,
            name: userName,
            email: userEmail,
            avatar: userAvatar,
            enrolledAt: eData.enrolledAt || null,
            enrolledDateFormatted,
            progressPercentage: eData.progressPercentage || 0,
            status: (eData.status as any) || 'active'
          });
        }

        this.enrolledStudents.set(studentList);
      } catch (err) {
        console.error('Error cargando estudiantes matriculados:', err);
      } finally {
        this.isLoadingStudents.set(false);
      }
    }, (error) => {
      console.error('Error en listener de inscripciones:', error);
      this.isLoadingStudents.set(false);
    });
  }

  getAuthorEarnings(course: Course): string {
    const studentsCount = this.enrolledStudents().length || course.studentsCount || 0;
    return (studentsCount * (course.price || 0) * 0.70).toFixed(2);
  }

  // --- Modal de Acciones ---
  openToggleBlockModal(student: EnrolledStudentItem): void {
    this.selectedStudent.set(student);
    this.modalAction.set(student.status === 'blocked' ? 'unblock' : 'block');
    this.isProcessingAction.set(false);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    if (this.isProcessingAction()) return;
    this.isModalOpen.set(false);
    this.selectedStudent.set(null);
    this.modalAction.set(null);
  }

  async confirmAction(): Promise<void> {
    const student = this.selectedStudent();
    const action = this.modalAction();

    if (!student || !action || this.isProcessingAction()) return;

    this.isProcessingAction.set(true);
    try {
      if (action === 'block') {
        await this.courseService.updateEnrollmentStatus(student.enrollmentId, 'blocked');
      } else if (action === 'unblock') {
        await this.courseService.updateEnrollmentStatus(student.enrollmentId, 'active');
      }
    } catch (err) {
      console.error('Error actualizando estado de acceso del alumno:', err);
    } finally {
      this.isProcessingAction.set(false);
      this.isModalOpen.set(false);
      this.selectedStudent.set(null);
      this.modalAction.set(null);
    }
  }

  ngOnDestroy(): void {
    if (this.enrollmentsUnsubscribe) {
      this.enrollmentsUnsubscribe();
      this.enrollmentsUnsubscribe = null;
    }
  }
}
