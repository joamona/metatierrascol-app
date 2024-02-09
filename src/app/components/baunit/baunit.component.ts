import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

import { MessageService } from 'src/app/services/message.service';

import { Message } from 'src/app/models/message';
import { Baunit } from 'src/app/models/baunit';


import { SqliteService } from 'src/app/services/sqlite/sqlite.service';
import { sendMessages } from 'src/app/utilities/manageMessages';


@Component({
  selector: 'app-baunit',
  standalone: true,
  templateUrl: './baunit.component.html',
  styleUrls: ['./baunit.component.scss'],
})
export class BaunitComponent  implements OnInit {
  mode!:string | null;
  constructor(public router:Router, public route: ActivatedRoute, ) {
    this.route.queryParamMap.subscribe(params => {
      this.mode = params.get("mode");
      if (this.mode=='insert'){
        alert('Mode insert')
      } else {
        this.mode=='edit'
        alert('Mode insert')        
      }//mode edit
    });//route.queryparams
   }

  ngOnInit() {

  }

}
