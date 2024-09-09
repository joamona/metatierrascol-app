import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CrPuntoLindero} from "../../models/crPuntoLindero";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {SqliteService} from "../../services/sqlite/sqlite.service";
import Swal from "sweetalert2";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MedirGpsComponent} from "../medir-gps/medir-gps.component";
import {MessageService} from "../../services/message.service";
import {CommonModule} from "@angular/common";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {AlphabeticalOrderPipe} from "../../pipes/alphabetical-order.pipe";
import {ChangeBooleanByYesNoPipe} from "../../pipes/change-boolean-by-yes-no.pipe";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatDialogModule} from "@angular/material/dialog";
import {PointService} from "../../services/point.service";

@Component({
  selector: 'app-punto',
  templateUrl: './punto.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    MatButtonModule,
    AlphabeticalOrderPipe,
    ChangeBooleanByYesNoPipe,
    MatCheckbox,
    MatDialogModule
  ],
  styleUrls: ['./punto.component.scss'],
})
export class PuntoComponent  implements OnInit {

  puntoForm: FormGroup;
  punto!: CrPuntoLindero;
  id: string = '';
  baunit_id: string = '';
  unidadEspacialActualId: string = '';

  constructor(
      private route: ActivatedRoute,
      private sqliteService: SqliteService,
      private router: Router,
      private snackBar: MatSnackBar,
      public messageService: MessageService,
      private pointService: PointService
  ) {
    this.puntoForm = new FormGroup({
      descripcion: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(async params => {
      this.id = params.get('id') || "-1";
      this.baunit_id = params.get('baunit_id') || "-1";


      this.unidadEspacialActualId = params.get('unidadEspacial_id') || "-1";
      if (this.id) {
        this.loadPunto();
      }
    })
  }

  async loadPunto() {
    this.punto = new CrPuntoLindero(this.sqliteService, this.messageService)
    await this.punto.setFromId(this.id)
    this.punto.setFromModel(this.punto)
    console.log("el punto es: ", this.punto)
  }

  async save() {
    if (this.puntoForm.valid) {
      this.punto.descripcion = this.puntoForm.get('descripcion')?.value;
      await this.punto.update();
      console.log("el punto actualizado es: ", this.punto)
      this.snackBar.open('Descripción actualizada', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/main-screen/menu-predio/puntos-list'], {queryParams: {mode: 'editar', baunit_id: this.baunit_id, unidadEspacial_id: this.unidadEspacialActualId}});
    }
  }

  async deletePunto() {
    if (this.id) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          await this.pointService.deletePoint(this.id);
          this.snackBar.open('Punto eliminado', 'Cerrar', { duration: 3000 });
          await Swal.fire(
              'Eliminado!',
              'El punto ha sido eliminado.',
              'success'
          );
          this.router.navigate(['/main-screen/menu-predio/puntos-list'], {
            queryParams: {mode: 'editar', baunit_id: this.baunit_id, unidadEspacial_id: this.unidadEspacialActualId}
          });
        } catch (err) {
          const errorMessage = (err instanceof Error) ? err.message : 'Ocurrió un error desconocido';
          await Swal.fire(
              'Error!',
              'No se pudo eliminar el punto: ' + errorMessage,
              'error'
          );
        }
      }
    }
  }


  navigateBack() {
    this.router.navigate(['/main-screen/menu-predio/puntos-list'], {queryParams: {mode: 'editar', baunit_id: this.baunit_id, unidadEspacial_id: this.unidadEspacialActualId}});
  }
}
