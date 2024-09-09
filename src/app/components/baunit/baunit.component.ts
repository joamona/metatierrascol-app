import {AfterViewInit, Component, OnInit} from '@angular/core';
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

import { SqliteService } from '../../services/sqlite/sqlite.service';
import { MessageService } from '../../services/message.service';
import { AppGlobalVarsService } from '../../services/app-global-vars.service';

import { Message } from '../../models/message';
import { Baunit } from '../../models/baunit';
import { Departamento } from '../../interfaces/departamento';
import { Municipio } from '../../interfaces/municipio';

import { sendMessages } from '../../utilities/manageMessages';

import { municipios } from '../../interfaces/listas/listaMunicipios';
import { departamentos } from '../../interfaces/listas/listaDepartamentos';
import { AlphabeticalOrderPipe } from '../../pipes/alphabetical-order.pipe';
import { ChangeBooleanByYesNoPipe } from '../../pipes/change-boolean-by-yes-no.pipe';
import { LC_PredioTipo } from '../../enumerations/lc_predio-tipo';
import { createDummyBaunit } from '../../models/baunit';
import { addIcons } from "ionicons";

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
    MatButtonModule,
    AlphabeticalOrderPipe,
    ChangeBooleanByYesNoPipe
  ],
  templateUrl: './baunit.component.html',
  styleUrls: ['./baunit.component.scss'],
})
export class BaunitComponent  implements OnInit, AfterViewInit{

  array_LC_PredioTipo = Object.values(LC_PredioTipo);
  departamentos: Departamento[] = departamentos;
  todosLosMunicipios: Municipio[] = municipios;
  todosMunicipiosDelDepartamento: Municipio[] = [];//Todos los municipios del departamento seleccionado. 
  municipiosDelDepartamentoProvinciaUnique: Municipio[] = [];//Lista de provincias del departamento.
                              //Contiene los municipios que coinciden con el departamento,
                              //eliminando los municipios que tienen la misma provincia.
  municipiosDeLaProvincia: Municipio[]  = [];//Municipios que coinciden con departamento y provincia
                              //seleccionados

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
  longitud=new FormControl('', [
    Validators.min(-180),
    Validators.max(180)
  ]);
  latitud=new FormControl('', [
    Validators.min(-90),
    Validators.max(90)
  ]);
  enviado_servidor=new FormControl(false);
  id: string ='';//el id de sqlite

  mode!:string | null;//el modo de usar el componente: editar, añadir
  controlsGroup = new FormGroup({
    nombre: this.nombre,
    departamento: this.departamento,
    provincia: this.provincia,
    municipio: this.municipio,
    sector_predio: this.sector_predio,
    vereda: this.vereda,
    tipo: this.tipo,
    complemento: this.complemento,

    numero_predial: this.numero_predial,
    numero_catastral: this.numero_catastral,
    longitud: this.longitud,
    latitud: this.latitud,
    enviado_servidor: this.enviado_servidor,
  })

  constructor(public router:Router, public route: ActivatedRoute, 
        public messageService: MessageService, public sqliteService: SqliteService,
        public snackBar: MatSnackBar, public appGlobalVarsService: AppGlobalVarsService) {
    this.route.queryParamMap.subscribe(params => {
      this.mode = params.get("mode");
      if (this.mode=='añadir'){
        //console.log('Baunit. Mode añadir')
      } else {
        this.mode=='editar'
        this.id = params.get('baunit_id') || '';
      }//mode edit
    });//route.queryparams
   }

  ngOnInit() {
    this.setFromId();
  }
  async setFromId(){
    var baunit = new Baunit(this.sqliteService,this.messageService);
    await baunit.setFromId(this.id);
    this.setFormControlValuesFromModel(baunit);
  }

  setFormControlValuesFromModel(baunit: Baunit){
    this.nombre.setValue(baunit.nombre);
    this.departamento.setValue(baunit.departamento);
    this.onDepartamentoChange();
    this.provincia.setValue(baunit.provincia);
    this.onProvinciaChange();
    console.log(baunit.municipio)
    this.municipio.setValue(baunit.municipio);
    this.sector_predio.setValue(baunit.sector_predio);
    this.vereda.setValue(baunit.vereda);
    this.tipo.setValue(baunit.tipo);
    this.complemento.setValue(baunit.complemento);

    this.numero_predial.setValue(baunit.numero_predial);
    this.numero_catastral.setValue(baunit.numero_catastral);
    this.longitud.setValue(baunit.longitud);
    this.latitud.setValue(baunit.latitud);
    this.enviado_servidor.setValue(baunit.enviado_servidor);
  }
  async save(){
    sendMessages('Salvando datos en Sqllite', this.messageService, this.snackBar)
    var baunit = new Baunit(this.sqliteService,this.messageService);
    baunit.setFromModel(this.controlsGroup.value as Baunit);
    if (this.mode == 'añadir'){
      await baunit.insert();
      this.id = baunit.id;
      this.router.navigate(['/main-screen/menu-predio/baunit'], {queryParams: {mode: 'editar', baunit_id: this.id}});
    }else{
      //baunit al ser creado no tiene id.
      //para poder actualizar el existente hay que establecer el id
      baunit.id = this.id;
      await baunit.update();
    }
  }
  onDepartamentoChange(){
      this.provincia.setValue(null);
      this.municipio.setValue(null);
      this.municipiosDeLaProvincia=[];
      
      var departamento = this.departamento.value;
      //console.log(departamento);
      //Saca los municipios del departamento
      this.todosMunicipiosDelDepartamento = this.todosLosMunicipios.filter(m => m.departamento === departamento);
      //console.log(this.todosMunicipiosDelDepartamento);
      //Elimina los municipios que tienen la misma provincia, para obtener un listado de provincias únicas
      this.municipiosDelDepartamentoProvinciaUnique = [...new Map(this.todosMunicipiosDelDepartamento.map( (municipio: Municipio) => [municipio.provincia, municipio])).values()]
      //console.log(this.municipiosDelDepartamentoProvinciaUnique);     
  }

  onProvinciaChange(){
    this.municipio.setValue(null);
    var provincia = this.provincia.value;
    this.municipiosDeLaProvincia = this.todosMunicipiosDelDepartamento.filter(m => m.provincia === provincia);
    //console.log(this.municipiosDeLaProvincia);

  }

  fillAutomatically(){
    console.log('Relleno automático dummy baunit')
    var baunit: Baunit = createDummyBaunit(this.sqliteService,this.messageService);
    this.setFormControlValuesFromModel(baunit);
  }

  // onlyUnique(value: object, index: number, array: object[]) {
  //   return array.indexOf(value) === index;
  // }

  navigateToMenu() {
    this.router.navigate(['/main-screen/menu-predio'], { queryParams: {mode: 'editar', baunit_id: this.id} });
  }
  ngAfterViewInit(): void {
    if (this.mode=="añadir"){
      if (this.appGlobalVarsService.appMode==1){
        this.fillAutomatically();
      }
    }
  }
}
