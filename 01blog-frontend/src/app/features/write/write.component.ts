import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";


@Component({
    selector: 'app-write',
    standalone: true,
    imports: [RouterModule, NavbarComponent],
    templateUrl: "./write.component.html",
    styleUrls: ['./write.component.css'], 
})


export class WriteComponent {

}