import { Component, OnInit } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import { AppGlobalVarsService } from '../../services/app-global-vars.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent  implements OnInit {

  constructor(public appGlobalVarsService: AppGlobalVarsService) { }

  ngOnInit() {}
  
  getAppVersion():Number{
    return this.appGlobalVarsService.appVersion;
  }

}
