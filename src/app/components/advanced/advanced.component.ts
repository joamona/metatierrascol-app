//angular
import {Component} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatOptionModule} from "@angular/material/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {Router, RouterLink} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatSnackBar} from '@angular/material/snack-bar';

//services
import { MessageService } from '../../services/message.service';
import { ServerService } from '../../services/server.service';
import { AuthService } from '../../services/auth.service';

//models
import { Message } from '../../models/message';

//functions
import { manageServerErrors, sendMessages } from '../../utilities/manageMessages';

//import {CONFIG_OPENLAYERS} from "../configuracion-openlayers";

@Component({
  selector: 'app-advanced',
  standalone: true,
  imports: [
    FormsModule,
    MatOptionModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterLink,
    MatButtonModule
  ],
  templateUrl: './advanced.component.html',
  styleUrl: './advanced.component.scss'
})
export class AdvancedComponent {
  //refSystems = CONFIG_OPENLAYERS.REFERENCE_SYSTEMS;//lista de srcs
  selectedRefSystem: string = 'EPSG:4326';//establece la opción por defecto

  constructor(private router: Router,
    public serverService: ServerService, public messageService: MessageService,
    public authService: AuthService, public snackBar: MatSnackBar) {
  }

  goBack() {
    this.router.navigate(['/main']);
  }

  initSession(){
    this.authService.checkAuthorizationToken();
  }
  closeSession(){
    this.serverService.post('core/knox/logout/', {}).subscribe(
      {
        next: ((data)=>{
          var message=new Message('info','Sesión cerrada. Puede iniciar otra sesión');
          this.messageService.add(message);
          this.authService.clearDataFromService();
          //{"expiry":"2024-02-03T16:15:33.046090+01:00","token":"lñkkkñkñ","groups":["admin"]}
          this.authService.borrarTokenDelAlmacen().then((value)=>{
            // var m = new Message('true','Url y token borrados del dispositivo');
            // this.messageService.add(m);
            sendMessages('Sesión borrada. Datos de la sesión borrados del dispositivo',this.messageService,this.snackBar);
          })
        }),
        error: ((error)=>{
          manageServerErrors(error,this.messageService,this.snackBar);
        })
      });
  }
}
