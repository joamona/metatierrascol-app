import { Component, OnInit } from '@angular/core';
import {SqliteService} from "../../services/sqlite/sqlite.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ChangeBooleanByYesNoPipe} from "../../pipes/change-boolean-by-yes-no.pipe";
import {MatButton} from "@angular/material/button";
import {Interesado} from "../../models/interesado";
import { Baunit } from '../../models/baunit';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-list-interesados',
  standalone: true,
  imports: [ChangeBooleanByYesNoPipe, MatButton, RouterLink],
  templateUrl: './list-interesados.component.html',
  styleUrls: ['./list-interesados.component.scss'],
})
export class ListInteresadosComponent implements OnInit {

  baunitId: string | null = null;
  baunit!: Baunit;

  constructor(public sqliteService:SqliteService, public router:Router, 
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService) { }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.baunitId = params.get('baunit_id');
      this.baunit = new Baunit(this.sqliteService, this.messageService);
      this.baunit.setFromId(this.baunitId!)
    });
  }
  getInteresadosForCurrentBaunit(): Interesado[] {
    return this.sqliteService.interesadoList.filter(interesado => interesado.baunit_id.toString() === this.baunitId);
  }

  editInteresado(id:string, baunitId:string){
    this.router.navigate(['/main-screen/menu-predio/list-interesados/interesado'], {queryParams: {mode: 'editar', baunit_id:baunitId, id: id}});
  }

  navigateToMenu() {
    this.router.navigate(['/main-screen/menu-predio'], { queryParams: { mode: 'editar', baunit_id: this.baunitId } });
  }
}
