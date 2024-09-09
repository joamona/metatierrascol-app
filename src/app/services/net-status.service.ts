import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { sendMessages } from '../utilities/manageMessages';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class NetStatusService {
  netStatus = 'offline';
  available = false;
  constructor(public messageService:MessageService){
    Network.addListener('networkStatusChange', status => {
      //console.log('Network status changed', status);
      this.available=status.connected;
      var m:string;
      if (this.available){
        m='DISPONIBLE'
      }else{
        m="NO disponible"
      }
      sendMessages('Cambio en la conexion: ' + m, this.messageService);
    });
    this.getNetworkStatus();
  }
  getNetworkStatus(){
    Network.getStatus().then((status)=>{
      var m:string;
      console.log(status)
      this.available=status.connected;
      if (this.available){
        m='DISPONIBLE'
      }else{
        m="NO disponible"
      }
      sendMessages('Estado de la conexion: ' + m,this.messageService);
    })
  }
}



