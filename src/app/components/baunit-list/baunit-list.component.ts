import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SqliteService } from '../../services/sqlite/sqlite.service';
import { ChangeBooleanByYesNoPipe } from '../../pipes/change-boolean-by-yes-no.pipe';
import {EnviarPredioService} from "../../services/enviar-predio.service";
import {MatButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {Baunit} from "../../models/baunit";
@Component({
  selector: 'app-baunit-list',
  standalone: true,
  imports: [ChangeBooleanByYesNoPipe, MatButton, NgIf],
  templateUrl: './baunit-list.component.html',
  styleUrls: ['./baunit-list.component.scss'],
})
export class BaunitListComponent  implements OnInit {

  constructor(public sqliteService:SqliteService, public router:Router, public enviarPredioService: EnviarPredioService) { }

  ngOnInit() {}
  editBaunit(baunitId:string){
    this.router.navigate(['/main-screen/menu-predio'], {queryParams: {mode: 'editar', baunit_id: baunitId}});
  }

  getInteresadosCountForBaunit(baunitId:string): number {
    return this.sqliteService.interesadoList.filter(i => i.baunit_id.toString() === baunitId.toString()).length;
  }

  getUnidadesEspacialesCountForBaunit(baunitId: string): number {
    return this.sqliteService.unidadEspacialList.filter(u => u.baunit_id.toString() === baunitId.toString()).length;
  }
}