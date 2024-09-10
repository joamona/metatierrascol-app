import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';

import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";

import { SqliteService } from '../../services/sqlite/sqlite.service';
import { MessageService } from '../../services/message.service';
import { AppGlobalVarsService } from '../../services/app-global-vars.service';

import { Interesado } from '../../models/interesado';
import {AlphabeticalOrderPipe} from "../../pipes/alphabetical-order.pipe";
import {ChangeBooleanByYesNoPipe} from "../../pipes/change-boolean-by-yes-no.pipe";
import {sendMessages} from "../../utilities/manageMessages";
import {Municipio} from "../../interfaces/municipio";
import {LC_PredioTipo} from "../../enumerations/lc_predio-tipo";
import { Departamento } from '../../interfaces/departamento';
import { departamentos } from '../../interfaces/listas/listaDepartamentos';
import {municipios} from "../../interfaces/listas/listaMunicipios";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {CR_DocumentoTipo} from "../../enumerations/cr_documento-tipo";
import {CR_SexoTipo} from "../../enumerations/cr_sexo-tipo";
import {CR_InteresadoTipo} from "../../enumerations/cr_interesado-tipo";
import {Grupo_Etnico} from "../../enumerations/grupo_etnico";
import {Estado} from "../../enumerations/estado";
import { createDummyInteresado } from '../../models/interesado';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { addIcons } from "ionicons";

@Component({
  selector: 'app-interesado',
  standalone: true,
  imports: [
    CommonModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    MatButtonModule,
    AlphabeticalOrderPipe,
    ChangeBooleanByYesNoPipe,
    MatCheckbox,
    MatDialogModule
  ],
  templateUrl: './interesado.component.html',
  styleUrls: ['./interesado.component.scss'],
})
export class InteresadoComponent  implements OnInit {

  initialNotificacionCorreo: boolean = false;
  initialProcesamientoDatos: boolean = false;

  array_LC_PredioTipo = Object.values(LC_PredioTipo);
  array_CR_DocumentoTipo = Object.values(CR_DocumentoTipo);
  array_CR_SexoTipo = Object.values(CR_SexoTipo);
  array_CR_InteresadoTipo = Object.values(CR_InteresadoTipo);
  array_Grupo_Etnico = Object.values(Grupo_Etnico);
  array_Estados = Object.values(Estado);

  departamentos: Departamento[] = departamentos;
  todosLosMunicipios: Municipio[] = municipios;
  todosMunicipiosDelDepartamento: Municipio[] = [];//Todos los municipios del departamento seleccionado.
  municipiosDelDepartamentoProvinciaUnique: Municipio[] = [];//Lista de provincias del departamento.
  //Contiene los municipios que coinciden con el departamento,
  //eliminando los municipios que tienen la misma provincia.
  municipiosDeLaProvincia: Municipio[]  = [];//Municipios que coinciden con departamento y provincia
  //seleccionados

  //obligatorios
  tipo_documento = new FormControl('', [Validators.required]);
  documento_identidad = new FormControl('', [Validators.required]);
  tipo = new FormControl('', [Validators.required]);
  primer_nombre = new FormControl('', [Validators.required]);
  primer_apellido = new FormControl('', [Validators.required]);
  correo_electronico = new FormControl('', [Validators.email]);
  departamento = new FormControl('', [Validators.required]);
  provincia=new FormControl('', [Validators.required]);
  municipio = new FormControl('', [Validators.required]);
  sexo = new FormControl('', [Validators.required]);
  autoriza_notificacion_correo = new FormControl(false, [Validators.requiredTrue]);
  autoriza_procesamiento_datos_personales = new FormControl(false, [Validators.requiredTrue]);
  baunit_id = new FormControl('', [Validators.required]);

  //opcionales
  porcentaje_propiedad = new FormControl(0, [
    Validators.min(0),
    Validators.max(100)
  ]);
  telefono_1 = new FormControl('');
  telefono_2 = new FormControl('');
  notas = new FormControl('');
  segundo_nombre = new FormControl('');
  segundo_apellido = new FormControl('');
  grupo_etnico = new FormControl('');
  estado = new FormControl('');

  controlsGroup = new FormGroup({
    tipo_documento: this.tipo_documento,
    documento_identidad: this.documento_identidad,
    tipo: this.tipo,
    primer_nombre: this.primer_nombre,
    primer_apellido: this.primer_apellido,
    correo_electronico: this.correo_electronico,
    departamento: this.departamento,
    provincia: this.provincia,
    municipio: this.municipio,
    autoriza_notificacion_correo: this.autoriza_notificacion_correo,
    autoriza_procesamiento_datos_personales: this.autoriza_procesamiento_datos_personales,
    baunit_id: this.baunit_id,
    sexo: this.sexo,

    porcentaje_propiedad: this.porcentaje_propiedad,
    telefono_1: this.telefono_1,
    telefono_2: this.telefono_2,
    notas: this.notas,
    segundo_nombre: this.segundo_nombre,
    segundo_apellido: this.segundo_apellido,
    grupo_etnico: this.grupo_etnico,
    estado: this.estado,

  });


  mode!: string | null; // Modo del componente: 'añadir' o 'editar'
  id: string = ''; // El ID del interesado, si está en modo 'editar'
  paramBaunitId: string = '-1';
  constructor(
      public router: Router,
      public route: ActivatedRoute,
      public messageService: MessageService,
      public sqliteService: SqliteService,
      public snackBar: MatSnackBar,
      public appGlobalVarsService: AppGlobalVarsService,
      private dialog: MatDialog
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.mode = params.get("mode");
      if (this.mode == 'añadir') {

      } else if (this.mode == 'editar'){
        this.id = params.get('id') || '';
      }
    });
  }

  ngOnInit() {

    //console.log("valores de checkbox al entrar", this.autoriza_notificacion_correo.value, this.autoriza_procesamiento_datos_personales.value)

    this.route.queryParamMap.subscribe(params => {
      this.paramBaunitId = params.get('baunit_id') || '-1';
      if (this.paramBaunitId) {
        this.baunit_id.setValue(this.paramBaunitId);
      }
    });

    if (this.mode === 'editar' && this.id) {
      this.setFromId();
    }
  }

  async setFromId() {
    var interesado = new Interesado(this.sqliteService, this.messageService);
    await interesado.setFromId(this.id);
    this.setFormControlValuesFromModel(interesado);

    console.log("valores de checkbox", this.autoriza_notificacion_correo.value, this.autoriza_procesamiento_datos_personales.value)
    this.initialNotificacionCorreo = interesado.autoriza_notificacion_correo;
    this.initialProcesamientoDatos = interesado.autoriza_procesamiento_datos_personales;
    console.log("control group: ", this.controlsGroup);
    console.log("control group 2: ", this.controlsGroup.errors)
  }

  setFormControlValuesFromModel(interesado: Interesado) {
    this.tipo_documento.setValue(interesado.tipo_documento);
    console.log("tipo docummento: ", interesado.tipo_documento);
    this.documento_identidad.setValue(interesado.documento_identidad);
    this.tipo.setValue(interesado.tipo);
    console.log("tipo interesado: ", interesado.tipo);

    this.primer_nombre.setValue(interesado.primer_nombre);
    this.primer_apellido.setValue(interesado.primer_apellido);
    this.correo_electronico.setValue(interesado.correo_electronico);

    this.departamento.setValue(interesado.departamento);
    console.log("departamento: ", interesado.departamento);
    this.onDepartamentoChange();
    this.provincia.setValue(interesado.provincia);
    console.log("provincia: ", interesado.provincia);
    this.onProvinciaChange();
    this.municipio.setValue(interesado.municipio);
    console.log("municipio: ", interesado.municipio);

    this.sexo.setValue(interesado.sexo);
    this.telefono_1.setValue(interesado.telefono_1);
    this.telefono_2.setValue(interesado.telefono_2);
    this.notas.setValue(interesado.notas);
    this.porcentaje_propiedad.setValue(interesado.porcentaje_propiedad);

    this.segundo_nombre.setValue(interesado.segundo_nombre);
    this.segundo_apellido.setValue(interesado.segundo_apellido);
    this.grupo_etnico.setValue(interesado.grupo_etnico);
    this.estado.setValue(interesado.estado);

    this.autoriza_notificacion_correo.setValue(true);
    this.autoriza_procesamiento_datos_personales.setValue(true);

    this.baunit_id.setValue(interesado.baunit_id);


  }

  async save() {
    sendMessages('Salvando datos en SQLite', this.messageService, this.snackBar);
    var interesado = new Interesado(this.sqliteService, this.messageService);
    interesado.setFromModel(this.controlsGroup.value as Interesado);

    if (this.mode == 'añadir') {
      const existe = await this.sqliteService.getInteresadoPorDocumentoIdentidad(interesado.documento_identidad, this.paramBaunitId);
      if (existe) {
        //this.snackBar.open('Ya existe un interesado con el mismo documento de identidad en este predio.', 'Cerrar', {duration: 3000});
        sendMessages('Ya existe un interesado con el mismo documento de identidad en este predio.', this.messageService, this.snackBar);
        return;
      }

      await interesado.insert();
      this.id = interesado.id;
      this.router.navigate(['/main-screen/menu-predio/list-interesados'], {queryParams: {mode: 'editar', baunit_id: this.paramBaunitId, id: this.id}});
    } else {
      interesado.id = this.id;
      await interesado.update();
      this.router.navigate(['/main-screen/menu-predio/list-interesados'], {queryParams: {mode: 'editar', baunit_id: this.paramBaunitId, id: this.id}});
    }
  }


  fillAutomatically(){
    var interesado: Interesado = createDummyInteresado(this.sqliteService, this.messageService);
    //const baunitId = this.controlsGroup.get('baunit_id')!.value;

    interesado.baunit_id = this.paramBaunitId;

    this.setFormControlValuesFromModel(interesado);

    console.log(this.controlsGroup.value);
    console.log(this.controlsGroup.valid);
    console.log(this.controlsGroup.errors);

  }

  onDepartamentoChange(){
    this.provincia.setValue(null);
    this.municipio.setValue(null);
    this.municipiosDeLaProvincia=[];

    var departamento = this.departamento.value;
    //Saca los municipios del departamento
    this.todosMunicipiosDelDepartamento = this.todosLosMunicipios.filter(m => m.departamento === departamento);
    //Elimina los municipios que tienen la misma provincia, para obtener un listado de provincias únicas
    this.municipiosDelDepartamentoProvinciaUnique = [...new Map(this.todosMunicipiosDelDepartamento.map( (municipio: Municipio) => [municipio.provincia, municipio])).values()]
  }

  onProvinciaChange(){
    this.municipio.setValue(null);
    var provincia = this.provincia.value;
    this.municipiosDeLaProvincia = this.todosMunicipiosDelDepartamento.filter(m => m.provincia === provincia);
    //console.log(this.municipiosDeLaProvincia);

  }

  async confirmDelete(): Promise<void> {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        var interesado = new Interesado(this.sqliteService, this.messageService);
        interesado.id = this.id;
        await interesado.delete();
        await Swal.fire(
            'Eliminado!',
            'El interesado ha sido eliminado.',
            'success'
        );

        this.router.navigate(['/main-screen/menu-predio/list-interesados'], { queryParams: { mode: 'añadir', baunit_id: this.paramBaunitId } });
      } catch (err) {
        const errorMessage = (err instanceof Error) ? err.message : 'Ocurrió un error desconocido';
        await Swal.fire(
            'Error!',
            'No se pudo eliminar el interesado: ' + errorMessage,
            'error'
        );
      }
    }
  }

  confirmarTratamientoDatos(event: MatCheckboxChange) {
    if (event.checked !== this.initialProcesamientoDatos) {

      Swal.fire({
        title: 'Autorización de Tratamiento de Datos Personales',
        text: 'De acuerdo con lo dispuesto en el artículo 5 de la Ley Orgánica 15/1999 de 13 de diciembre, sobre Protección de datos de carácter personal, el grupo CCASAT, responsable del proyecto MetaTierras Colombia, de la Universitat Politécnica de València, España, en adelante UPV, le informa que los datos de carácter personal, y toda la información relacionada con usted, serán almacenados, y tratados en una base de datos con el único fin de proporcionar servicios en su propio interés.\n' +
            '\n' +
            'Valoramos su confianza al brindarnos su Información personal. Pero recuerde que ningún método de transmisión a través de Internet o método de transmisión electrónica el almacenamiento es 100% seguro y confiable, y no podemos garantizar su absoluta seguridad.\n' +
            '\n' +
            'Usted usa el software y el servicio de almacenamiento de la UPV bajo su propia responsabilidad, eximiendo al grupo CCASAT de la UPV de cualquier responsabilidad por pérdida, o extravío, acceso indebido que se pueda producir sobre sus datos.\n' +
            '\n' +
            'Usted podrá ejercer, en todo momento y de conformidad con la legislación vigente, sus derechos de acceso, eliminación y rectificación mediante solicitud dirigida al responsable de la base de datos (ccasat@upv.es)',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Acepto',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.autoriza_procesamiento_datos_personales.setValue(true);
        } else {
          this.autoriza_procesamiento_datos_personales.setValue(false);
        }
      });

    } else {
      event.source.checked = this.initialProcesamientoDatos;
    }
  }

  confirmarAutorizacionCorreo(event: MatCheckboxChange) {
    if (event.checked !== this.initialNotificacionCorreo) {
      Swal.fire({
        title: 'Autorización para Recibir Notificaciones por Correo',
        text: 'Usted acepta que nos pongamos en comunicación con usted a través de email u otro medio, siempre en su propio interés, con el objetivo de regularizar su propiedad.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Acepto',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.autoriza_notificacion_correo.setValue(true);
        } else {
          this.autoriza_notificacion_correo.setValue(false);
        }
      });

    } else {
      event.source.checked = this.initialNotificacionCorreo;
    }

  }


  navigateToMenu() {
    //this.router.navigate(['/main-screen/menu-predio'], { queryParams: {mode: 'editar', baunit_id: this.paramBaunitId}});
    this.router.navigate(['/main-screen/menu-predio/list-interesados'], { queryParams: {mode: 'añadir', baunit_id: this.paramBaunitId}});
  }
}
