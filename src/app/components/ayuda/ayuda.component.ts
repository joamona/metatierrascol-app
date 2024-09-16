import { Component, OnInit } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import { AppGlobalVarsService } from '../../services/app-global-vars.service';

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.scss'],
})
export class AyudaComponent  implements OnInit {

  constructor(public appGlobalVarsService: AppGlobalVarsService) { }

  ngOnInit() {}

  getAppVersion():Number{
    return this.appGlobalVarsService.appVersion;
  }

}
