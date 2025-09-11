import { Component } from "@angular/core";
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [NavbarComponent],
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})


export class AdminComponent {}