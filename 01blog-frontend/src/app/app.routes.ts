import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
//   {
//     path: 'auth',
//     loadChildren: () =>
//       import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
//   },
//   {
//     path: 'posts',
//     loadChildren: () =>
//       import('./features/posts/posts.routes').then((m) => m.POSTS_ROUTES),
//   },
  // add more lazy routes (admin, users, notifications) here
];
