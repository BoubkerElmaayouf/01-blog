import { Component } from "@angular/core";
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from "@angular/router";

@Component({
    selector: 'app-landbar',
    standalone: true,
    templateUrl: './landBar.component.html',
    imports: [MatToolbarModule, RouterModule],
    styleUrls: ['./landBar.component.css']
})


export class LandBarComponent {
    // todo!()
}




