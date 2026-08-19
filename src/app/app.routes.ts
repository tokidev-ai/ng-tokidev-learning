import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then(m => m.LandingComponent),
    title: 'TokiDev Learning | Inicio'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent),
    title: 'TokiDev Learning | Iniciar Sesión'
  },
  {
    path: 'student/dashboard',
    loadComponent: () => import('./features/student/student-dashboard/student-dashboard').then(m => m.StudentDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['STUDENT'] },
    title: 'TokiDev Learning | Dashboard Estudiante'
  },
  {
    path: 'student/dashboard/:id',
    loadComponent: () => import('./features/student/student-dashboard/student-dashboard').then(m => m.StudentDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['STUDENT'] },
    title: 'TokiDev Learning | Detalles de la Ruta'
  },
  {
    path: 'classroom',
    loadComponent: () => import('./features/student/classroom/classroom').then(m => m.ClassroomComponent),
    canActivate: [roleGuard],
    data: { roles: ['STUDENT'] },
    title: 'TokiDev Learning | Aula Virtual'
  },
  {
    path: 'classroom/:lessonId',
    loadComponent: () => import('./features/student/classroom/classroom').then(m => m.ClassroomComponent),
    canActivate: [roleGuard],
    data: { roles: ['STUDENT'] },
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
    canActivate: [roleGuard],
    data: { roles: ['INSTRUCTOR'] },
    title: 'TokiDev Learning | Panel de Profesor'
  },
  {
    path: 'instructor/create-course',
    loadComponent: () => import('./features/instructor/create-course/create-course').then(m => m.CreateCourseComponent),
    canActivate: [roleGuard],
    data: { roles: ['INSTRUCTOR'] },
    title: 'TokiDev Learning | Crear Nuevo Curso'
  },
  {
    path: 'instructor/courses/:id/students',
    loadComponent: () => import('./features/instructor/courses/course-students').then(m => m.InstructorCourseStudentsComponent),
    canActivate: [roleGuard],
    data: { roles: ['INSTRUCTOR'] },
    title: 'TokiDev Learning | Alumnos de la Ruta'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    title: 'TokiDev Learning | Dashboard Administración'
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    title: 'TokiDev Learning | Dashboard Administración'
  },
  {
    path: 'admin/courses',
    loadComponent: () => import('./features/admin/courses/admin-courses').then(m => m.AdminCoursesComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    title: 'TokiDev Learning | Administración - Cursos'
  },
  {
    path: 'admin/courses/:id/students',
    loadComponent: () => import('./features/admin/courses/course-students').then(m => m.AdminCourseStudentsComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    title: 'TokiDev Learning | Alumnos del Curso'
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/users/admin-users').then(m => m.AdminUsersComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    title: 'TokiDev Learning | Administración - Usuarios'
  },
  {
    path: 'mentorships',
    loadComponent: () => import('./features/mentorships/mentorships').then(m => m.MentorshipsComponent),
    title: 'TokiDev Learning | Mentorías Personalizadas 1-a-1'
  },
  {
    path: 'resources',
    loadComponent: () => import('./features/resources/resources').then(m => m.ResourcesComponent),
    canActivate: [roleGuard],
    data: { roles: ['STUDENT'] },
    title: 'TokiDev Learning | Recursos Gratuitos'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
