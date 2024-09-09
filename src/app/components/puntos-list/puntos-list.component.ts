import { Component, OnInit } from '@angular/core';
import {CrPuntoLindero} from "../../models/crPuntoLindero";
import {ActivatedRoute, Router} from "@angular/router";
import {SqliteService} from "../../services/sqlite/sqlite.service";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-puntos-list',
  templateUrl: './puntos-list.component.html',
  styleUrls: ['./puntos-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class PuntosListComponent  implements OnInit {

  points: CrPuntoLindero[] = [];
  baunitId: string = '';
  unidadEspacialId: string = '';
  constructor(private route: ActivatedRoute, private sqliteService: SqliteService, public router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.unidadEspacialId = params['unidadEspacial_id'];
      this.baunitId = params['baunit_id'];
      this.loadPoints(this.unidadEspacialId, this.baunitId);
    });
  }

  loadPoints(unidadEspacialId: string, baunitId: string) {
    this.points = this.sqliteService.crPuntoLinderoList.filter(p =>
        p.unidad_espacial_id.toString() === unidadEspacialId && p.baunit_id.toString() === baunitId
    );
    console.log("Puntos cargados:", this.points);
  }

  editPoints(baunitId:string, unidadEspacialId: string, id:string){
    this.router.navigate(['/main-screen/menu-predio/puntos-list/punto'], {queryParams: {mode: 'editar', baunit_id: baunitId, unidadEspacial_id: unidadEspacialId, id: id}});
  }

  navigateToMenu() {
    this.router.navigate(['/main-screen/menu-predio/medir-gps-list/medir-gps'], { queryParams: { mode: 'editar', baunit_id: this.baunitId, id: this.unidadEspacialId } });
  }
}
