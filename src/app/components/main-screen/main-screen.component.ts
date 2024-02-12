import {Component} from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { BaunitListComponent } from '../baunit-list/baunit-list.component';

@Component({
    selector: 'app-main-screen',
    templateUrl: './main-screen.component.html',
    styleUrls: ['./main-screen.component.css'],
    standalone: true,
    imports: [MatButtonModule, RouterLink, BaunitListComponent]
})
export class MainScreenComponent {

  constructor(private router: Router,private snackBar: MatSnackBar) {}

  ngOnInit() {}
}



