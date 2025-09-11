import { Component } from '@angular/core';
import { LandBarComponent } from '../../shared/components/landNavbar/landBar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  imports: [LandBarComponent, RouterModule]
})
export class LandingComponent {}