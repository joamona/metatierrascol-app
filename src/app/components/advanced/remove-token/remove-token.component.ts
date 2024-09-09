import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { AppGlobalVarsService } from '../../../services/app-global-vars.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { sendMessages } from '../../../utilities/manageMessages';

@Component({
  selector: 'app-remove-token',
  standalone: true,
  imports:[RouterLink],
  templateUrl: './remove-token.component.html',
  styleUrls: ['./remove-token.component.scss'],
})
export class RemoveTokenComponent  implements OnInit {

  constructor(public authService: AuthService, public snackBar: MatSnackBar, 
    public messageService: MessageService, public appGlobalVarsService: AppGlobalVarsService) { }

  ngOnInit() {}

  removeToken(){
    this.authService.borrarTokenDelAlmacen().then((value:any)=>{
      sendMessages('Sesión borrada. Datos de la sesión borrados del dispositivo',this.messageService,this.snackBar);
    })
  }
}
