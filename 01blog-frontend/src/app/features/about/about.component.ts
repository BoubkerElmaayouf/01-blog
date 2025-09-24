import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { LandBarComponent } from "../../shared/components/landNavbar/landBar.component";

@Component({
  selector: "app-about",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    LandBarComponent
  ],
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"],
})

export class AboutComponent {
    
}
