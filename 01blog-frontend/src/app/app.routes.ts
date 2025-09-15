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
import {AdminComponent} from './features/admin/admin.component'
// import { AuthGuard } from './core/auth-guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  {path: 'login', component: LoginComponent},
  
  // Protected routes
  // {path: 'explore', component: ExploreComponent, canActivate: [AuthGuard]},
  // { path: 'write', component: WriteComponent, canActivate: [AuthGuard] },
  // { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  // { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  
  {path: 'explore', component: ExploreComponent},
  { path: 'write', component: WriteComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'admin', component: AdminComponent },


  {path: 'privacy-policy', component: PolicyPrivacyComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'report', component: ReportComponent},
  {path: 'about', component: AboutComponent},
];
