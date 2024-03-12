import { Component, OnInit } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {BaunitListComponent} from "../baunit-list/baunit-list.component";
import {SqliteService} from "../../services/sqlite/sqlite.service";
import {NetStatusService} from "../../services/net-status.service";
import {AuthService} from "../../services/auth.service";
import {MessageService} from "../../services/message.service";
import {Message} from "../../models/message";
import {manageServerErrors, sendMessages} from "../../utilities/manageMessages";
import {MatSnackBar} from "@angular/material/snack-bar";
import {EnviarPredioService} from "../../services/enviar-predio.service";

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
  predioEnviado: boolean = false;
  constructor(private activatedRoute: ActivatedRoute, private snackBar: MatSnackBar, private router: Router, public enviarPredioService: EnviarPredioService, public sqliteService:SqliteService, public netStatusService: NetStatusService, public authService: AuthService, public messageService: MessageService) { }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.baunitId = params.get('baunit_id');
      this.mode = params.get("mode");
      this.isInteresadosButtonEnabled = !!this.baunitId;
    });
  }

  getInteresadosCountForCurrentBaunit(): number {
    if (!this.baunitId) return 0;
    return this.sqliteService.interesadoList.filter(i => i.baunit_id.toString() === this.baunitId).length;
  }

  getUnidadesEspacialesCountForCurrentBaunit(): number {
    if (!this.baunitId) return 0;
    return this.sqliteService.unidadEspacialList.filter(u => u.baunit_id.toString() === this.baunitId).length;
  }


  goToDatosPredio() {
    if (this.mode == 'añadir') {
      this.router.navigate(['/main-screen/menu-predio/baunit'], {queryParams: {mode: 'añadir'}});
    } else {
      this.router.navigate(['/main-screen/menu-predio/baunit'], {
        queryParams: {
          mode: 'editar',
          baunit_id: this.baunitId
        }
      });
    }
  }


}