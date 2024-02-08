import { Component } from '@angular/core';
import { NetStatusService } from '../../services/net-status.service';
import { AuthService } from '../../services/auth.service';
import { AppGlobalVarsService } from '../../services/app-global-vars.service';
import { MessagesComponent } from '../messages/messages.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    standalone: true,
    imports: [MatIconModule, MessagesComponent],
    providers: [AuthService, NetStatusService, AppGlobalVarsService],
})
export class HeaderComponent {
  showMessages = false;
  constructor(public netStatusService: NetStatusService, 
    public authService: AuthService, public appGlobalVarsService: AppGlobalVarsService){
  }
  changeShowMessages(){
    this.showMessages = !this.showMessages;
  }
}
