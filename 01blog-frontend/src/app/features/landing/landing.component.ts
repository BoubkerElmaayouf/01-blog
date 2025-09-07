// landing.component.ts
import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-landing',
  standalone: true,           // 👈 important for standalone Angular
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'], // or .scss if you prefer
  imports: [NavbarComponent]
})
export class LandingComponent {}