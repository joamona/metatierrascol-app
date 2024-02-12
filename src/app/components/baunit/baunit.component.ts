import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';

import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {RouterLink} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import { FormControl } from '@angular/forms';

import { SqliteService } from 'src/app/services/sqlite/sqlite.service';
import { MessageService } from 'src/app/services/message.service';

import { Message } from 'src/app/models/message';
import { Baunit } from 'src/app/models/baunit';
import { Departamento } from 'src/app/interfaces/departamento';
import { Provincia } from 'src/app/interfaces/provincia';
import { Municipio } from 'src/app/interfaces/municipio';

import { sendMessages } from 'src/app/utilities/manageMessages';

import { municipios } from 'src/app/interfaces/listas/listaMunicipios';
import { provincias } from 'src/app/interfaces/listas/listaProvincias';
import { departamentos } from 'src/app/interfaces/listas/listaDepartamentos';
import { AlphabeticalOrderPipe } from 'src/app/pipes/alphabetical-order.pipe';

@Component({
  selector: 'app-baunit',
  standalone: true,
  imports:[
    CommonModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    MatButtonModule
  ],
  templateUrl: './baunit.component.html',
  styleUrls: ['./baunit.component.scss'],
})
export class BaunitComponent  implements OnInit {
  departamentos: Departamento[] = departamentos;
  provincias: Provincia[] = provincias;
  municipios: Municipio[]  = municipios;
  municipiosFiltrados: Municipio[] = [];
  provinciasFiltradas: Provincia[] = [];
  departamentoSeleccionado: string = '';
  provinciaSeleccionada: string = '';
  municipioSeleccionado: string = '';

  //obligatorios
  nombre=new FormControl('', [Validators.required]);
  departamento=new FormControl('', [Validators.required]);
  provincia=new FormControl('', [Validators.required]);
  sector_predio=new FormControl('', [Validators.required]);
  municipio=new FormControl('', [Validators.required]);
  vereda=new FormControl('', [Validators.required]);
  tipo=new FormControl('', [Validators.required]);
  complemento=new FormControl('', [Validators.required]);

  //opcionales. Se inicializan a '', si es undefined;
  numero_predial=new FormControl('');
  numero_catastral=new FormControl('');
  longitud=new FormControl('');
  latitud=new FormControl('');
  enviado_servidor=new FormControl(false);
  id: string ='';//el id de sqlite

  controlsGroup = new FormGroup({
    nombre: this.nombre,
    departamento: this.departamento,
    provincia: this.provincia,
    sector_predio: this.sector_predio,
    municipio: this.municipio,
    vereda: this.vereda,
    tipo: this.tipo,
    complemento: this.complemento,

    numero_predial: this.numero_predial,
    numero_catastral: this.numero_catastral,
    longitud: this.longitud,
    latitud: this.latitud,
    enviado_servidor: this.enviado_servidor,
  })

  mode!:string | null;
  constructor(public router:Router, public route: ActivatedRoute, 
        public messageService: MessageService, public sqliteService: SqliteService,
        public snackBar: MatSnackBar) {
    this.route.queryParamMap.subscribe(params => {
      this.mode = params.get("mode");
      if (this.mode=='añadir'){
        alert('Mode añadir')
      } else {
        this.mode=='editar'
        alert('Mode editar')
        this.id = params.get('id') || '';      
      }//mode edit
    });//route.queryparams
   }

  ngOnInit() {
    if (this.mode=='editar' && this.id !=''){
      var baunit = new Baunit(this.sqliteService,this.messageService);
      baunit.setFromId(this.id);
      this.setFormControlValuesFromModel(baunit);
    }
  }
  setFormControlValuesFromModel(baunit: Baunit){
    this.nombre.setValue(baunit.nombre);
    this.departamento.setValue(baunit.departamento);
    this.provincia.setValue(baunit.provincia);
    this.sector_predio.setValue(baunit.sector_predio);
    this.municipio.setValue(baunit.municipio);
    this.vereda.setValue(baunit.vereda);
    this.tipo.setValue(baunit.tipo);
    this.complemento.setValue(baunit.complemento);

    this.numero_predial.setValue(baunit.numero_predial);
    this.numero_catastral.setValue(baunit.numero_catastral);
    this.longitud.setValue(baunit.longitud);
    this.latitud.setValue(baunit.latitud);
    this.enviado_servidor.setValue(baunit.enviado_servidor);
  }
  save(){
    var baunit = new Baunit(this.sqliteService,this.messageService);
    baunit.setFromModel(this.controlsGroup.value as Baunit);
    if (this.mode == 'añadir'){
      baunit.insert();
      this.id = baunit.id;
      this.router.navigate(['/heroes', { mode: 'editar', id: this.id }]);
    }else{
      baunit.id=this.id;
      baunit.update();
    }
  }
}
