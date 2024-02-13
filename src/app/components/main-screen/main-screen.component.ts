import {Component} from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { BaunitListComponent } from '../baunit-list/baunit-list.component';
import { SqliteService } from 'src/app/services/sqlite/sqlite.service';

@Component({
    selector: 'app-main-screen',
    templateUrl: './main-screen.component.html',
    styleUrls: ['./main-screen.component.scss'],
    standalone: true,
    imports: [MatButtonModule, RouterLink, BaunitListComponent]
})
export class MainScreenComponent {

  constructor(private router: Router,private snackBar: MatSnackBar, 
    public sqliteService: SqliteService) {}

  ngOnInit() {}
}



