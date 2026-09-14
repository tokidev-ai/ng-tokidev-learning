import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CertificateModalComponent, CertificateData } from '../../../shared/components/certificate-modal/certificate-modal';
import { 
  LucideBookOpen, 
  LucidePlay, 
  LucideCompass, 
  LucideSearch, 
  LucideCheckCircle2,
  LucideAward
} from '@lucide/angular';

@Component({
  selector: 'app-my-courses',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CertificateModalComponent,
    LucideBookOpen, 
    LucidePlay, 
    LucideCompass, 
    LucideSearch, 
    LucideCheckCircle2,
    LucideAward
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-courses.html'
})
export class MyCoursesComponent {
  private readonly router = inject(Router);
  protected readonly courseService = inject(CourseService);
  protected readonly authService = inject(AuthService);

  protected readonly activeFilter = signal<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  protected readonly searchControl = new FormControl('');

  protected readonly isCertificateModalOpen = signal<boolean>(false);
  protected readonly selectedCertificateData = signal<CertificateData | null>(null);

  protected readonly allEnrolled = computed(() => this.courseService.enrolledCourses());

  protected readonly totalEnrolledCount = computed(() => this.allEnrolled().length);
  protected readonly inProgressCount = computed(() => this.allEnrolled().filter(item => item.progressPercentage < 100).length);
  protected readonly completedCount = computed(() => this.allEnrolled().filter(item => item.progressPercentage >= 100).length);

  protected readonly filteredEnrolledCourses = computed(() => {
    const list = this.allEnrolled();
    const filter = this.activeFilter();
    const search = (this.searchControl.value || '').trim().toLowerCase();

    return list.filter(item => {
      // Filtro de estado
      if (filter === 'IN_PROGRESS' && item.progressPercentage >= 100) return false;
      if (filter === 'COMPLETED' && item.progressPercentage < 100) return false;

      // Filtro de búsqueda
      if (search) {
        const matchesTitle = item.course.title.toLowerCase().includes(search);
        const matchesCat = item.course.category.toLowerCase().includes(search);
        const matchesDesc = item.course.description.toLowerCase().includes(search);
        return matchesTitle || matchesCat || matchesDesc;
      }

      return true;
    });
  });

  goToClassroom(pathId: string): void {
    const slug = this.courseService.getPathSlug(pathId) || pathId;
    this.courseService.selectPath(pathId);
    this.router.navigate(['/classroom', slug]);
  }

  openCertificate(item: any): void {
    const user = this.authService.currentUser();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const hash = (user?.id || 'toki').substring(0, 4).toUpperCase() + '-' + item.course.id.substring(0, 4).toUpperCase() + '-' + now.getFullYear();

    this.selectedCertificateData.set({
      studentName: user?.name || 'Estudiante TokiDev',
      courseTitle: item.course.title,
      instructorName: item.course.instructorName,
      completedDate: formattedDate,
      certificateId: `TKD-CERT-${hash}`,
      durationHours: item.course.durationHours || 12
    });
    this.isCertificateModalOpen.set(true);
  }
}
