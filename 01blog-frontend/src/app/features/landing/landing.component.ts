import { Component } from '@angular/core';
import { LandBarComponent } from '../../shared/components/landNavbar/landBar.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  imports: [LandBarComponent]
})
export class LandingComponent {}