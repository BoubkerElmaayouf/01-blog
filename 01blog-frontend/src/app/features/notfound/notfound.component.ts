import { Component } from "@angular/core";
import { Location } from "@angular/common";
import { LoaderComponent } from "../../shared/components/loader/loader.component";
import { LandBarComponent } from "../../shared/components/landNavbar/landBar.component";
// import { RouterModule } from "@angular/router"; 

@Component({
  selector: "app-notfound",
  standalone: true,
  imports: [LandBarComponent, LoaderComponent], 
  templateUrl: "./notfound.component.html",
  styleUrls: ["./notfound.component.css"]
})
export class NotFoundComponent {
  constructor(private location: Location) {} 

  goBack() {
    this.location.back();
  }
}
