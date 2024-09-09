import { Component, OnInit } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import { MatSnackBar } from '@angular/material/snack-bar';
import {RouterLink} from "@angular/router";
import { Message } from '../../models/message';
import { addIcons } from "ionicons";

@Component({
  selector: 'app-pantalla-inicial',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './initial-screen.component.html',
  styleUrl: './initial-screen.component.scss'
})
export class InitialScreenComponent implements OnInit{
  constructor(
  ){}
  ngOnInit(): void {
   
  }
}
