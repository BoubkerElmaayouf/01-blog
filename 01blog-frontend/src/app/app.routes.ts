import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/login/login.component';
import {ExploreComponent} from './features/explore/explore.component'
import {WriteComponent} from './features/write/write.component'
import {ProfileComponent} from './features/profile/profile.component'
import {PolicyPrivacyComponent} from './features/privacy-policy/policy.component';
import {ContactComponent} from './features/contact/contact.component'
import {ReportComponent} from './features/report/report.component'
import { AboutComponent } from './features/about/about.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  {path: 'login', component: LoginComponent},
  {path: 'explore', component: ExploreComponent},
  {path: 'write', component: WriteComponent},
  {path:'profile', component:ProfileComponent},
  {path: 'privacy-policy', component: PolicyPrivacyComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'report', component: ReportComponent},
  {path: 'about', component: AboutComponent}
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
