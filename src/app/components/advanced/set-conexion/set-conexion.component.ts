import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl} from '@angular/forms';
import {FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {RouterLink} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatSnackBar} from "@angular/material/snack-bar";

//services
import { AppGlobalVarsService } from '../../../services/app-global-vars.service';
import { ServerService } from '../../../services/server.service';
import { MessageService } from '../../../services/message.service';
import { AuthService } from '../../../services/auth.service';

//models
import { Message } from '../../../models/message';

//functions
import { manageServerErrors, sendMessages } from '../../../utilities/manageMessages'
import { addIcons } from "ionicons";

@Component({
  selector: 'app-set-conexion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    RouterLink,
    MatButtonModule
  ],
  templateUrl: './set-conexion.component.html',
  styleUrl: './set-conexion.component.scss'
})
export class SetConexionComponent implements OnInit{
  
  urlDjangoApi = new FormControl('', [Validators.required, Validators.minLength(10)]);//to show on insert;
  username = new FormControl('', [Validators.required, Validators.minLength(4)]);//to show on insert;
  password = new FormControl('', [Validators.required, Validators.minLength(4)]);//to show on insert;

  controlsGroup = new FormGroup({
    urlDjangoApi: this.urlDjangoApi,
    username: this.username,
    password: this.password
  })

  constructor(private snackBar: MatSnackBar, 
    public appGlobalVarsService:AppGlobalVarsService,
    public serverService: ServerService, public messageService: MessageService,
    public authService:AuthService) {
      this.urlDjangoApi.setValue(authService.urlDjangoApi);
      this.username.setValue(authService.username);
  }
  ngOnInit(): void {
    if (this.urlDjangoApi.value==''){this.urlDjangoApi. setValue(this.appGlobalVarsService.urlDjangoApi)}
  }
  iniciarSesion(){
    if (!this.controlsGroup.valid){
      var m = new Message('true','Valores del formulario inválidos');
      this.messageService.add(m);
      this.snackBar.open('Valores del formulario inválidos', 'Cerrar', {duration: 3000, verticalPosition: 'bottom' });
    }
    this.authService.urlDjangoApi = this.urlDjangoApi.value || '';//lo que hay en el formulario
        //serverservice usa authService.urlDjangoApi
    sendMessages('Solicitudes enviadas a ' + this.authService.urlDjangoApi, this.messageService);
    this.serverService.post('core/knox/login/', {'username':this.username.value, 'password': this.password.value},false).subscribe(
      {
        next: ((data:any)=>{
          var message=new Message('info','Datos recibidos: ' + JSON.stringify(data));
          this.messageService.add(message);
          //establece las variables en el servicio para que la app funcione bien
          this.authService.setData(this.username.value || '',data.groups,data.token, this.urlDjangoApi.value || '',data.opened_sessions)
          //{"expiry":"2024-02-03T16:15:33.046090+01:00","token":"lñkkkñkñ","groups":["admin"]}
          this.authService.almacenaUrlyTokenEnAlmacen().then((value:any)=>{
            sendMessages('Sesión iniciada con éxito. Datos almacenados en el dispositivo',this.messageService,this.snackBar)
          })
        }),
        error: ((error:any)=>{
          //console.log(error);
          manageServerErrors(error,this.messageService,this.snackBar);
        })
      });
  }

  // pruebaGet(){
  //   this.serverService.get('core/hello_world/ ').subscribe(
  //     {
  //       next: ((data)=>{
  //         console.log(data);
  //       }),
  //       error: ((error)=>{
  //         console.log(error);
  //       })
  //     });
  // }
}
