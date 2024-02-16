import { Component, OnInit } from '@angular/core';
import {SqliteService} from "../../services/sqlite/sqlite.service";
import {Router} from "@angular/router";
import {ChangeBooleanByYesNoPipe} from "../../pipes/change-boolean-by-yes-no.pipe";

@Component({
  selector: 'app-interesados-list',
  standalone: true,
  imports:[ChangeBooleanByYesNoPipe],
  templateUrl: './interesados-list.component.html',
  styleUrls: ['./interesados-list.component.scss'],
})
export class InteresadosListComponent  implements OnInit {

  constructor(public sqliteService:SqliteService, public router:Router) { }

  ngOnInit() {}

  editInteresado(id:string, baunitId:string){
    this.router.navigate(['/main-screen/menu-predio/interesado'], {queryParams: {mode: 'editar', baunit_id:baunitId, id: id}});
  }
}
