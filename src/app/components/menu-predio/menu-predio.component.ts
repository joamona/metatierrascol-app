import { Component, OnInit } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {ActivatedRoute, RouterLink} from "@angular/router";
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

  baunitId: string | null = null;
  isInteresadosButtonEnabled: boolean = false;
  constructor(private activatedRoute: ActivatedRoute, public sqliteService:SqliteService) { }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.baunitId = params.get('baunit_id');
      console.log("el baunit_id es: ", this.baunitId);
      this.isInteresadosButtonEnabled = !!this.baunitId;
    });
  }

}
