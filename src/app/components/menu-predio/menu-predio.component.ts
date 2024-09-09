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
import {NgIf} from "@angular/common";
import Swal from "sweetalert2";
import {Baunit} from "../../models/baunit";


@Component({
  selector: 'app-menu-predio',
  templateUrl: './menu-predio.component.html',
  styleUrls: ['./menu-predio.component.scss'],
  standalone: true,
  imports: [MatButtonModule, RouterLink, BaunitListComponent, NgIf]
})
export class MenuPredioComponent  implements OnInit {

  baunitId!: string | null;
  mode!:string | null;
  isInteresadosButtonEnabled: boolean = false;
  predioEnviado: boolean = false;
  predioActual?: Baunit;

  constructor(private activatedRoute: ActivatedRoute, private snackBar: MatSnackBar, private router: Router, public enviarPredioService: EnviarPredioService, public sqliteService:SqliteService, public netStatusService: NetStatusService, public authService: AuthService, public messageService: MessageService) { }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.baunitId = params.get('baunit_id');
      this.mode = params.get("mode");
      this.isInteresadosButtonEnabled = !!this.baunitId;

      if (this.baunitId) {
        this.predioActual = this.sqliteService.baunitList.find(b => b.id.toString() === this.baunitId);
        console.log("Predio actual encontrado:", this.predioActual);
      }
    });

    if (this.isInteresadosButtonEnabled){
      let btn = document.getElementById("btnEliminar");
      if (btn != null){
        btn.classList.add('rojo');
      }
    }
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


  puedeEnviar(): boolean {
    return this.netStatusService.available && this.authService.token!='' && !this.predioEnviado;
  }

  async enviarPredio() {
    if (!this.puedeEnviar()) {
      if (!this.netStatusService.available){
        var m = new Message('true','No es posible enviar en este momento. SIN CONEXIÓN.');
        this.messageService.add(m);
        this.snackBar.open('No es posible enviar en este momento. SIN CONEXIÓN.', 'Cerrar', { duration: 3000, verticalPosition: 'bottom' });
      } else {
        var m = new Message('true','No es posible enviar en este momento. SESIÓN NO INICIADA.');
        this.messageService.add(m);
        this.snackBar.open('No es posible enviar en este momento. SESIÓN NO INICIADA.', 'Cerrar', { duration: 3000, verticalPosition: 'bottom' });
      }

      return;
    }

    sendMessages('Iniciando el proceso de envío...', this.messageService, this.snackBar);

    try {
      //await this.enviarPredioService.enviarAlServidor(this.baunitId);

      if (this.predioActual && this.predioActual.enviado_servidor) {
        const confirmacion = await Swal.fire({
          title: 'Este predio ya ha sido enviado anteriormente',
          text: '¿Deseas reenviarlo?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, reenviar',
          cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) {
          return
        }
      }

      await this.enviarPredioService.enviarAlServidor(this.baunitId);
      if (this.predioActual) {
        this.predioActual.enviado_servidor = true;
      }
      var m = new Message('info', 'Datos enviados correctamente.');
      this.messageService.add(m);
      this.snackBar.open('Datos enviados correctamente.', 'Cerrar', { duration: 3000, verticalPosition: 'bottom' });

      console.log(this.predioActual?.enviado_servidor)
    } catch (error:any) {
      manageServerErrors(error, this.messageService, this.snackBar);
    }


  }

  async eliminarPredio() {
    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
    });

    if (isConfirmed) {
      try {
        await this.sqliteService.deleteBaunit(this.baunitId);
        Swal.fire(
            'Eliminado!',
            'El predio ha sido eliminado.',
            'success'
        );
        this.router.navigate(['/']);
      } catch (error) {
        Swal.fire(
            'Error',
            'No se pudo eliminar el predio.',
            'error'
        );
      }
    }
  }

}