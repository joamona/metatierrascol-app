import { Component, OnInit } from '@angular/core';
import {SqliteService} from "../../services/sqlite/sqlite.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ChangeBooleanByYesNoPipe} from "../../pipes/change-boolean-by-yes-no.pipe";
import {MatButton} from "@angular/material/button";
@Component({
  selector: 'app-medir-gps-list',
  standalone: true,
  imports: [ChangeBooleanByYesNoPipe, MatButton, RouterLink],
  templateUrl: './medir-gps-list.component.html',
  styleUrls: ['./medir-gps-list.component.scss'],
})
export class MedirGpsListComponent  implements OnInit {

  baunitId: string | null = null;
  constructor(public sqliteService:SqliteService, public router:Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.baunitId = params.get('baunit_id');
    });
  }

  editUnidadEspacial(id:string, baunitId:string){
    this.router.navigate(['/main-screen/menu-predio/medir-gps-list/medir-gps'], {queryParams: {mode: 'editar', baunit_id:baunitId, id: id}});
  }

  navigateToMenu() {
    this.router.navigate(['/main-screen/menu-predio'], { queryParams: { mode: 'editar', baunit_id: this.baunitId } });
  }
}
