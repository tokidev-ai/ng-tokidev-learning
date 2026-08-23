import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { db } from '../../core/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { LucideFolderOpen, LucideDownload, LucideCheck } from '@lucide/angular';

interface EnrolledResource {
  id: string;
  title: string;
  lessonTitle: string;
  courseTitle: string;
  description: string;
  type: 'PDF' | 'ZIP' | 'CODE';
  downloadUrl: string;
}

@Component({
  selector: 'app-resources',
  imports: [
    LucideFolderOpen,
    LucideDownload,
    LucideCheck
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resources.html'
})
export class ResourcesComponent {
  private readonly authService = inject(AuthService);
  
  protected readonly resources = signal<EnrolledResource[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly toastMessage = signal<string | null>(null);

  constructor() {
    // Escuchar cambios reactivos en el usuario e inscripciones para cargar los recursos correspondientes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadEnrolledResources(user.id);
      } else {
        this.resources.set([]);
        this.loading.set(false);
      }
    });
  }

  private async loadEnrolledResources(userId: string): Promise<void> {
    this.loading.set(true);
    try {
      // 1. Obtener todas las inscripciones del estudiante
      const enrollmentsQuery = query(collection(db, 'enrollments'), where('userId', '==', userId));
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrolledPathIds = enrollmentsSnapshot.docs.map(doc => doc.data()['pathId'] as string);

      if (enrolledPathIds.length === 0) {
        this.resources.set([]);
        return;
      }

      const resourcesList: EnrolledResource[] = [];

      // 2. Para cada ruta inscrita, obtener sus lecciones que contengan recursos descargables (resourceUrl)
      for (const pathId of enrolledPathIds) {
        // Obtener título de la ruta
        const pathDoc = await getDocs(query(collection(db, 'learningPaths'), where('id', '==', pathId)));
        const pathTitle = pathDoc.docs[0]?.data()['title'] || 'Ruta de Aprendizaje';

        // Obtener módulos de la ruta
        const modulesSnapshot = await getDocs(collection(db, 'learningPaths', pathId, 'modules'));
        
        for (const moduleDoc of modulesSnapshot.docs) {
          // Obtener lecciones de este módulo
          const lessonsSnapshot = await getDocs(collection(db, 'learningPaths', pathId, 'modules', moduleDoc.id, 'lessons'));
          
          for (const lessonDoc of lessonsSnapshot.docs) {
            const lessonData = lessonDoc.data();
            
            // Si la lección tiene un resourceUrl configurado en Firestore
            if (lessonData['resourceUrl']) {
              resourcesList.push({
                id: lessonDoc.id,
                title: lessonData['resourceName'] || 'Material Complementario',
                lessonTitle: lessonData['title'] || 'Lección',
                courseTitle: pathTitle,
                description: lessonData['summary'] || 'Material adicional para el seguimiento práctico de la clase.',
                type: this.determineResourceType(lessonData['resourceUrl']),
                downloadUrl: lessonData['resourceUrl']
              });
            }
          }
        }
      }

      this.resources.set(resourcesList);
    } catch (err) {
      console.error('Error al cargar recursos de Firestore:', err);
    } finally {
      this.loading.set(false);
    }
  }

  private determineResourceType(url: string): 'PDF' | 'ZIP' | 'CODE' {
    const cleanUrl = url.toLowerCase().split('?')[0] || '';
    if (cleanUrl.endsWith('.pdf')) return 'PDF';
    if (cleanUrl.endsWith('.zip') || cleanUrl.endsWith('.rar')) return 'ZIP';
    return 'CODE';
  }

  showToast(title: string): void {
    this.toastMessage.set(title);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}
