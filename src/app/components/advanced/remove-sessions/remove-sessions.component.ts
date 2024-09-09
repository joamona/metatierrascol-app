import { Component, OnInit } from '@angular/core';
import {RouterLink} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatSnackBar} from '@angular/material/snack-bar';

//services
import { MessageService } from '../../../services/message.service';
import { ServerService } from '../../../services/server.service';
import { AuthService } from '../../../services/auth.service';
import { Message } from '../../../models/message';
import { manageServerErrors, sendMessages } from '../../../utilities/manageMessages';

@Component({
  selector: 'app-remove-sessions',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule
  ],
  templateUrl: './remove-sessions.component.html',
  styleUrls: ['./remove-sessions.component.scss'],
})
export class RemoveSessionsComponent  implements OnInit {

  constructor(
    public serverService: ServerService, public messageService: MessageService,
    public authService: AuthService, public snackBar: MatSnackBar
  ) { }

  ngOnInit() {}
  
  removeAllSessions(){
    this.serverService.post('core/knox/logoutall/', {}).subscribe(
      {
        next: ((data)=>{
          var message=new Message('info','Todas las sesiones han sido borradas en el servidor.');
          console.log
          this.messageService.add(message);
          this.authService.clearDataFromService();
          this.authService.borrarTokenDelAlmacen().then((value)=>{
            sendMessages('Sesión borrada. Datos de la sesión borrados del dispositivo. Ahora puede iniciar otra sesión',this.messageService,this.snackBar);
          })
        }),
        error: ((error)=>{
          manageServerErrors(error,this.messageService,this.snackBar);
        })
      });
  }
}


