import { Component, OnInit } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {BaunitListComponent} from "../baunit-list/baunit-list.component";
import {SqliteService} from "../../services/sqlite/sqlite.service";

@Component({
  selector: 'app-menu-predio',
  templateUrl: './menu-predio.component.html',
  styleUrls: ['./menu-predio.component.scss'],
  standalone: true,
  imports: [MatButtonModule, RouterLink, BaunitListComponent]
})
export class MenuPredioComponent  implements OnInit {

  baunitId!: string | null;
  mode!:string | null;
  isInteresadosButtonEnabled: boolean = false;
  constructor(private activatedRoute: ActivatedRoute, private router: Router, public sqliteService:SqliteService) { }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.baunitId = params.get('baunit_id');
      this.mode = params.get("mode");
      this.isInteresadosButtonEnabled = !!this.baunitId;
    });
  }

  goToDatosPredio(){
    if (this.mode=='añadir'){
      this.router.navigate(['/main-screen/menu-predio/baunit'], {queryParams: {mode: 'añadir'}});
    } else {
      this.router.navigate(['/main-screen/menu-predio/baunit'], {queryParams: {mode: 'editar', baunit_id: this.baunitId}});
    }
  }

}
