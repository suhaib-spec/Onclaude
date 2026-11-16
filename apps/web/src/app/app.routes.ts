import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing').then((m) => m.Landing), title: 'Hintwise' },
  {
    path: 'interviewer',
    loadComponent: () => import('./features/interviewer/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Assessments · Hintwise',
  },
  {
    path: 'interviewer/assessments/new',
    loadComponent: () => import('./features/interviewer/builder/builder').then((m) => m.Builder),
    title: 'New assessment · Hintwise',
  },
  {
    path: 'interviewer/assessments/:id/edit',
    loadComponent: () => import('./features/interviewer/builder/builder').then((m) => m.Builder),
    title: 'Edit assessment · Hintwise',
  },
  {
    path: 'interviewer/assessments/:id',
    loadComponent: () => import('./features/interviewer/assessment-detail/assessment-detail').then((m) => m.AssessmentDetail),
    title: 'Assessment · Hintwise',
  },
  {
    path: 'interviewer/sessions/:id',
    loadComponent: () => import('./features/interviewer/review/review').then((m) => m.Review),
    title: 'Review · Hintwise',
  },
  {
    path: 'candidate',
    loadComponent: () => import('./features/candidate/candidate-home/candidate-home').then((m) => m.CandidateHome),
    title: 'Candidate · Hintwise',
  },
  {
    path: 'take/:token',
    loadComponent: () => import('./features/candidate/take/take').then((m) => m.Take),
    title: 'Assessment · Hintwise',
  },
  {
    path: 'interview/new',
    loadComponent: () => import('./features/interview/new-interview/new-interview').then((m) => m.NewInterview),
    title: 'New live interview · Hintwise',
  },
  {
    path: 'live/:id',
    loadComponent: () => import('./features/interview/live-stage/live-stage').then((m) => m.LiveStage),
    title: 'Live interview · Hintwise',
  },
  { path: '**', redirectTo: '' },
];
