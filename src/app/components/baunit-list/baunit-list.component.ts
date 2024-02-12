import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SqliteService } from 'src/app/services/sqlite/sqlite.service';
import { ChangeBooleanByYesNoPipe } from 'src/app/pipes/change-boolean-by-yes-no.pipe';
@Component({
  selector: 'app-baunit-list',
  standalone: true,
  imports:[ChangeBooleanByYesNoPipe],
  templateUrl: './baunit-list.component.html',
  styleUrls: ['./baunit-list.component.scss'],
})
export class BaunitListComponent  implements OnInit {

  constructor(public sqliteService:SqliteService, public router:Router) { }

  ngOnInit() {}
  editBaunit(baunitId:string){
    this.router.navigate(['/main-screen/baunit'], {queryParams: {mode: 'editar', id: baunitId}});
  }
}
