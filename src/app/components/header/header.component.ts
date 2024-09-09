import { Component } from '@angular/core';
import { NetStatusService } from '../../services/net-status.service';
import { AuthService } from '../../services/auth.service';
import { AppGlobalVarsService } from '../../services/app-global-vars.service';
import { MessagesComponent } from '../messages/messages.component';
import { MatIconModule } from '@angular/material/icon';

import {Preferences} from "@capacitor/preferences";
import { sendMessages } from '../../utilities/manageMessages';
import { MessageService } from '../../services/message.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    standalone: true,
    imports: [MatIconModule, MessagesComponent],
    providers: [],
})
export class HeaderComponent {
  showMessages = false;
  constructor(public netStatusService: NetStatusService, 
    public authService: AuthService, public appGlobalVarsService: AppGlobalVarsService,
  public messageService: MessageService){
  }
  changeShowMessages(){
    this.showMessages = !this.showMessages;
  }
  getUsername():string{
    return this.slice(this.authService.username,17)
  }
  getUserGroups():string{
    return this.slice(this.authService.getGroupsAsString(),17)
  }
  slice(str:string, maxLength:number):string{
    if (str.length > length){
      return str.slice(0,maxLength) + '...';
    }else{
      return str;
    }
  }
  /*
  showPreferences(){
    this.getPreferences().then((value)=>{
      console.log(value);
      sendMessages(this.authService.urlDjangoApi + ' : ' + this.authService.token,this.messageService)
    })
  }
  async getPreferences(){
    // Guardar configuración permanentemente
    let urlDjangoApi = await Preferences.get({ key: 'urlDjangoApi'});
    let token = await Preferences.get({ key : 'token'});
    return [urlDjangoApi.value, token.value]
  }
  */
}
