import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then(m => m.LandingComponent),
    title: 'TokiDev Learning | Inicio'
  },
  {
    path: 'student/dashboard',
    loadComponent: () => import('./features/student/student-dashboard/student-dashboard').then(m => m.StudentDashboardComponent),
    title: 'TokiDev Learning | Dashboard Estudiante'
  },
  {
    path: 'classroom',
    loadComponent: () => import('./features/student/classroom/classroom').then(m => m.ClassroomComponent),
    title: 'TokiDev Learning | Aula Virtual'
  },
  {
    path: 'catalog',
    loadComponent: () => import('./features/student/catalog/catalog').then(m => m.CatalogComponent),
    title: 'TokiDev Learning | Catálogo de Cursos'
  },
  {
    path: 'instructor',
    loadComponent: () => import('./features/instructor/instructor-dashboard/instructor-dashboard').then(m => m.InstructorDashboardComponent),
    title: 'TokiDev Learning | Panel de Profesor'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
