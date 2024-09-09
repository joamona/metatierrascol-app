import {Component} from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { BaunitListComponent } from '../baunit-list/baunit-list.component';
import { SqliteService } from '../../services/sqlite/sqlite.service';
import { ServerService } from '../../services/server.service';
import { AppGlobalVarsService } from '../../services/app-global-vars.service';
import { MessageService } from '../../services/message.service';
import { Message } from '../../models/message';
import { manageServerErrors, sendMessages } from '../../utilities/manageMessages';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-main-screen',
    templateUrl: './main-screen.component.html',
    styleUrls: ['./main-screen.component.scss'],
    standalone: true,
    imports: [MatButtonModule, RouterLink, BaunitListComponent], 
})
export class MainScreenComponent {
  newVersion=-1;
  

  constructor(private router: Router,private snackBar: MatSnackBar, 
    public sqliteService: SqliteService,
    public serverservice:ServerService,
    public appGlobalVarsService: AppGlobalVarsService,
    public messageService: MessageService,
    public authService: AuthService
  
  ) {

  }

  ngOnInit() {
    if (this.authService.urlDjangoApi != ''){
      this.serverservice.get('mobileappversion/mobile_app_version/get_last_version_details/').subscribe(
        {
          next: ((data: any)=>{
            if ('error' in data){sendMessages("No existen versiones de app publicadas todavía",this.messageService)}
            if ('version' in data){
              if (data.version > this.appGlobalVarsService.appVersion){
                this.newVersion = data.version;
              }
            }
          }),
          error: ((error:any)=>{
            manageServerErrors(error,this.messageService,this.snackBar);
          })
        });  
    }
  }
}



