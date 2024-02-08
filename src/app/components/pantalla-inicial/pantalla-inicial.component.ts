import { Component } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-pantalla-inicial',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './pantalla-inicial.component.html',
  styleUrl: './pantalla-inicial.component.css'
})
export class PantallaInicialComponent {

}
