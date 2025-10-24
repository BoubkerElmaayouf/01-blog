import { Component } from "@angular/core";
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";
import { LoaderComponent } from "../../shared/components/loader/loader.component";

@Component({
    selector: "app-notfound",
    standalone: true,
    imports: [NavbarComponent, LoaderComponent],
    templateUrl: "./notfound.component.html",
    styleUrls: ["./notfound.component.css"]
})


export class NotFoundComponent {}