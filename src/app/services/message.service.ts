import { Injectable } from '@angular/core';
import { Message } from '../models/message';
import { AppGlobalVarsService } from './app-global-vars.service';
 
@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messagesServiceOpened=false;
  messages: Message[] = [];
  constructor(public appGlobalVarsService: AppGlobalVarsService){}
  add(message: Message) {
    this.messages.unshift(message);
    if (this.appGlobalVarsService.showMessagesInConsole){
      console.log(message.message)
    }
  }
  clear() {
    this.messages = [];
  }
}
