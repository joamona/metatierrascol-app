import { HttpErrorResponse } from '@angular/common/http';
import { isDevMode } from '@angular/core';

import { Message } from '../models/message';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MessageService } from '../services/message.service';

export function sendMessages(message:string, messageService: MessageService, snackBar?: MatSnackBar){ 
  var m = new Message('false', message);
  messageService.add(m);
  if (!(snackBar === undefined)){
    snackBar.open(message, 'Cerrar', { duration: 3000, verticalPosition: 'bottom' });
  }
  if (isDevMode()){console.log(message)}
}

export function manageServerErrors(error: HttpErrorResponse, messageService: MessageService, snackBar?: MatSnackBar){
  if (error.status === 0) {
    sendMessages('Error de red, o servidor no disponible',messageService,snackBar);
    return;
  }
  if (error.status==404){
    sendMessages('Dirección url no encontrada',messageService,snackBar);
    return;
  }
  if (error.status==500){
    sendMessages('Error interno. El administrador recibió un email e intentará resolver el problema',messageService,snackBar);
    return;
  }
  if (error.status>500){
    sendMessages('El servidor no está disponible',messageService,snackBar);
    return;
  }
  showDRFerrorMessages(error, messageService, snackBar);
}

export function showDRFerrorMessages(error: HttpErrorResponse, messageService: MessageService, snackBar?: MatSnackBar){
  var err = error.error;
  for (let key in err) {
    if (Array.isArray(err[key])){
      var arrayMensajes:string[] = err[key];
      arrayMensajes.forEach( mens =>{
          var message=new Message('error','Error: ' + key + ': ' + mens);
          messageService.add(message);
          if (!(snackBar === undefined)){
            snackBar.open('Error: ' + key + ': ' + mens, 'Cerrar', { duration: 3000, verticalPosition: 'bottom' });
          }
        });
    }else{
      var message=new Message('error','Error: ' + key + ': ' + err[key]);
      messageService.add(message);
      if (!(snackBar === undefined)){
        snackBar.open('Error: ' + key + ': ' + err[key], 'Cerrar', { duration: 3000, verticalPosition: 'bottom' });
      }

    }
  }
}