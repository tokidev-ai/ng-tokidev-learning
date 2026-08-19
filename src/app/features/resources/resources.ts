import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth.service';
import { db } from '../../core/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] text-slate-100 pb-20 px-4 md:px-8 pt-8">
      <div class="max-w-5xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="text-center space-y-3 max-w-2xl mx-auto">
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight">Material de Estudio</h1>
          <p class="text-xs md:text-sm text-slate-400">Descarga guías, hojas de trucos, códigos base y recursos adicionales de las rutas en las que estás inscrito.</p>
        </div>

        @if (loading()) {
          <div class="text-center py-20 space-y-3">
            <span class="block text-sm text-slate-400 font-bold">⏳ Buscando recursos en tus rutas...</span>
          </div>
        } @else {
          @if (resources().length === 0) {
            <div class="glass-card rounded-3xl p-12 text-center border border-white/10 max-w-lg mx-auto space-y-4">
              <div class="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                <i class="fa-solid fa-folder-open text-lg"></i>
              </div>
              <div class="space-y-1">
                <h3 class="font-extrabold text-white text-base">Sin recursos disponibles</h3>
                <p class="text-xs text-slate-400">Inscríbete en una ruta de aprendizaje o avanza en tus lecciones para ver los archivos descargables aquí.</p>
              </div>
            </div>
          } @else {
            <!-- Resources Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              @for (item of resources(); track item.id) {
                <div class="glass-card rounded-2xl p-5 flex flex-col justify-between hover:border-[#DA2984]/40 transition-all group">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-[9px] font-mono font-bold text-slate-400">
                        {{ item.type }}
                      </span>
                      <span class="text-[9px] text-[#DA2984] font-extrabold uppercase tracking-wider">
                        {{ item.courseTitle }}
                      </span>
                    </div>
                    
                    <div>
                      <span class="text-[9px] text-slate-500 font-bold block mb-1">Lección: {{ item.lessonTitle }}</span>
                      <h3 class="font-extrabold text-base text-white group-hover:text-[#DA2984] transition-colors leading-snug">
                        {{ item.title }}
                      </h3>
                    </div>
                    
                    <p class="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {{ item.description }}
                    </p>
                  </div>

                  <div class="pt-5 mt-auto">
                    <a 
                      [href]="item.downloadUrl"
                      target="_blank"
                      (click)="showToast(item.title)"
                      class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#DA2984]/10 border border-white/10 hover:border-[#DA2984]/40 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer no-underline">
                      <i class="fa-solid fa-cloud-arrow-down"></i>
                      Descargar Ahora
                    </a>
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- Download Success Toast -->
        @if (toastMessage()) {
          <div class="fixed bottom-5 right-5 z-50 bg-[#131127] border border-emerald-500/30 text-white rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-fade-in">
            <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm shrink-0">
              <i class="fa-solid fa-check"></i>
            </div>
            <div class="text-left text-xs">
              <span class="font-bold block">Descarga iniciada</span>
              <span class="text-slate-400">{{ toastMessage() }}</span>
            </div>
          </div>
        }

      </div>
    </div>
  `
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
