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
    path: 'catalog/:id',
    loadComponent: () => import('./features/student/course-detail/course-detail').then(m => m.CourseDetailComponent),
    title: 'TokiDev Learning | Detalles del Curso'
  },
  {
    path: 'instructor',
    loadComponent: () => import('./features/instructor/instructor-dashboard/instructor-dashboard').then(m => m.InstructorDashboardComponent),
    title: 'TokiDev Learning | Panel de Profesor'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard').then(m => m.AdminDashboardComponent),
    title: 'TokiDev Learning | Panel de Administración'
  },
  {
    path: 'resources',
    loadComponent: () => import('./features/resources/resources').then(m => m.ResourcesComponent),
    title: 'TokiDev Learning | Recursos Gratuitos'
  },
  {
    path: 'mentorships',
    loadComponent: () => import('./features/mentorships/mentorships').then(m => m.MentorshipsComponent),
    title: 'TokiDev Learning | Mentorías 1-a-1'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
