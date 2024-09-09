import { Injectable } from '@angular/core';
import {Preferences} from "@capacitor/preferences";
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MessageService} from './message.service';
import { Message} from '../models/message';
import { manageServerErrors, sendMessages, showDRFerrorMessages } from '../utilities/manageMessages';

interface ServerData {
  detail: string;
  username: string;
  groups: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  username="";
  groups :string[] = [];
  token = "";
  urlDjangoApi = ""
  opened_sessions = 0

  constructor( 
    private messageService: MessageService, public snackBar: MatSnackBar,
    public httpClient: HttpClient){
  }

  get(viewName:String): Observable<any>{
    //console.log('getting ' + viewName);
    var message=new Message('info','Getting data from ' + viewName);
    this.messageService.add(message)
    return this.httpClient.get(this.urlDjangoApi + viewName);
  }

  setData(username:string,groups:string[],
    token:string, urlDjangoApi: string, opened_sessions:number){
    this.username=username;
    this.groups = groups;
    this.token = token;
    this.urlDjangoApi = urlDjangoApi;
    this.opened_sessions = opened_sessions;
  }

  clearDataFromService(): void {
    this.username="";
    this.groups = [];
    this.token = ""; 
  }
  public checkAuthorizationToken(){
    if (this.urlDjangoApi == '' || this.token == ''){
      //var message=new Message('info','No hay token en el dispositivo. Necesario autenticarse');
      //this.messageService.add(message);
      sendMessages('No hay token en el dispositivo. Necesario autenticarse',this.messageService)
      return
    }

    var  headers: HttpHeaders;
    headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Token ' + this.token});
    this.httpClient.get(
      this.urlDjangoApi + 'core/knox/is_valid_token/',
        {headers: headers, responseType : 'json', 
              reportProgress: false}).subscribe(
          {
            next: ((data: any)=>{
              var message=new Message('info','Datos recibidos: ' + JSON.stringify(data));
              this.messageService.add(message);
              //{"detail":"Valid token.","username":"admin","groups":["admin"]}
              this.setData(data.username,data.groups,this.token,this.urlDjangoApi, data.opened_sessions);
            }),
            error: ((error: any)=>{
              manageServerErrors(error,this.messageService,this.snackBar);
              if (error.status == 401){
                if (error.error.detail=="Invalid token."){
                  this.borrarTokenDelAlmacen().then((r)=>{
                    sendMessages('La sesión estaba caducada. Debe iniciar sesión',this.messageService,this.snackBar);
                  });
                }
              }
            })
          });
  }

  async almacenaUrlyTokenEnAlmacen() {
    // Guardar configuración permanentemente
    await Preferences.set({ key: 'urlDjangoApi', value: this.urlDjangoApi });
    await Preferences.set({ key : 'token', value: this.token });
    return {'urlDjangoApi': this.urlDjangoApi, 'token': this.token}
  }

  async borrarUrlyTokenDelAlmacen() {
    // Guardar configuración permanentemente
    await Preferences.remove({ key: 'urlDjangoApi' });
    await Preferences.remove({ key : 'token' });
    this.urlDjangoApi='';
    this.token='';
    return 'Borrado'
  }

  async borrarTokenDelAlmacen() {
    // Guardar configuración permanentemente
    this.token='';
    return await Preferences.remove({ key : 'token' });
  }
  // Cargar configuración y token desde el storage al servicio
  async cargarUrlyTokenDelAlmacen() {
    const urlDjangoApiData = await Preferences.get({ key: 'urlDjangoApi' });
    const tokenData = await Preferences.get({ key: 'token' });
    this.urlDjangoApi = urlDjangoApiData.value || '';
    this.token = tokenData.value || '';
    if (this.urlDjangoApi != ''){
      var m = new Message('true',"urlDjangoApi recuperada del almacén: " + this.urlDjangoApi);
      this.messageService.add(m); 
    }else{
      var m = new Message('false',"urlDjangoApi no encotrada en el almacén");
      this.messageService.add(m); 
    }
    if (this.token != ''){
      var m = new Message('true',"Token recuperado del almacén: " + this.token);
      this.messageService.add(m); 
    }else{
      var m = new Message('false',"Token no encotrado en el almacén");
      this.messageService.add(m); 
    }
    return {'urlDjangoApi': this.urlDjangoApi, 'token': this.token}
  }
  getGroupsAsString():string{
    var s="";
    for (let g of this.groups){
      s=s+g + ','
    }
    return s.slice(0,(s.length - 1))
  }
}

