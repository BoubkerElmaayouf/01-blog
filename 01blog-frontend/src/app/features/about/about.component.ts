import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";

@Component({
  selector: "app-about",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    NavbarComponent
  ],
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"],
})

export class AboutComponent {
    
}
