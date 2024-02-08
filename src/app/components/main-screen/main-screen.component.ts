import {Component, signal} from '@angular/core';
import {PredioService} from "../services/PredioService";
import { Router, RouterLink } from "@angular/router";
import {ApiService} from "../services/ApiService";
import {Preferences} from "@capacitor/preferences";
import { MatSnackBar } from '@angular/material/snack-bar';
import {HttpErrorResponse} from "@angular/common/http";
import Swal from "sweetalert2";
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-main-screen',
    templateUrl: './main-screen.component.html',
    styleUrls: ['./main-screen.component.css'],
    standalone: true,
    imports: [MatButtonModule, RouterLink]
})
export class MainScreenComponent {
  prediosMedidos = 0;
  prediosEnviados = 0;

  constructor(private predioService: PredioService, private router: Router, private apiService: ApiService,private snackBar: MatSnackBar) {}

  nuevoPredio() {
    this.predioService.nuevoPredio();

    let predioActual = this.predioService.obtenerPredioActual();
    console.log("predio sin aumentar id: ",predioActual);
    predioActual.id = this.predioService.getListaPredios().length +1;
    console.log("predio aumentando id: ",predioActual);

    this.router.navigate(['/nuevo-predio', predioActual.id])
    console.log(predioActual)
  }
  ngOnInit() {
    this.prediosMedidos = this.predioService.getListaPredios().length;
    this.prediosEnviados = this.predioService.getPrediosEnviados();
  }

  borrarTodo() {
    Swal.fire({
      title: 'Confirmación',
      text: "¿Está seguro de que desea borrar todos los datos no esenciales?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Preferences.keys().then(keys => {
          keys.keys.forEach(key => {
            if (key !== 'authToken' && key !== 'user' && key !== 'password') {
              Preferences.remove({ key: key });
            }
          });
          this.snackBar.open('Preferencias no esenciales borradas', 'Cerrar', { duration: 3000, verticalPosition: "top" });
        }).catch(error => {
          console.error('Error al borrar preferencias:', error);
          this.snackBar.open('Error al borrar preferencias: ' + error, 'Cerrar', { duration: 3000, verticalPosition: "top" });
        });
        window.location.reload();
      }
    });
  }


}
