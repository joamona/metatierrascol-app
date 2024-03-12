import { Injectable } from '@angular/core';
import {SqliteService} from "./sqlite/sqlite.service";
import JSZip from 'jszip';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {lastValueFrom} from "rxjs";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class EnviarPredioService {

  constructor(private sqliteService: SqliteService, public httpClient: HttpClient, public authService: AuthService) { }

  async prepararDatosPredio(baunitId: string | null): Promise<any> {
    console.log('el baunit id es: ', baunitId);
    console.log('baunit-list: ', this.sqliteService.baunitList);
    console.log("lista de baunits: ", this.sqliteService.baunitList);
    const datosPredio = this.sqliteService.baunitList.find(b => b.id.toString() === baunitId);
    const interesados = this.sqliteService.interesadoList.filter(i => i.baunit_id.toString() === baunitId);
    const unidadesEspaciales = this.sqliteService.unidadEspacialList.filter(u => u.baunit_id.toString() === baunitId);
    const puntosLindero = this.sqliteService.crPuntoLinderoList.filter(p => p.baunit_id.toString() === baunitId);


    const formData = new FormData();
    formData.append('nombre', datosPredio?.nombre || 'no especificado');
    formData.append('departamento', datosPredio?.departamento || 'no especificado');
    formData.append('provincia', datosPredio?.provincia || 'no especificado');
    formData.append('sector_predio', datosPredio?.sector_predio || 'no especificado');
    formData.append('municipio', datosPredio?.municipio || 'no especificado');
    formData.append('numero_predial', datosPredio?.numero_predial || 'no especificado');
    formData.append('tipo', datosPredio?.tipo || 'no especificado');
    formData.append('complemento', datosPredio?.complemento || 'no especificado');


    const zip = new JSZip();
    zip.file("datosPredio.json", JSON.stringify(this.limpiarObjetoParaEnvio(datosPredio)));
    zip.file("interesados.json", JSON.stringify(this.limpiarObjetoParaEnvio(interesados)));
    zip.file("unidadesEspaciales.geojson", JSON.stringify(this.limpiarObjetoParaEnvio(unidadesEspaciales)));
    zip.file("crPuntosLindero.geojson", JSON.stringify(this.limpiarObjetoParaEnvio(puntosLindero)));


    try {
      const zipFile = await zip.generateAsync({ type: "blob" });
      formData.append('archivo', zipFile, 'datos.zip');
      console.log("el formData ha quedado así: ", formData);
      return { formData, zipFile };
    } catch (error) {
      console.error("Error generando el archivo ZIP: ", error);
    }

  }

  async enviarAlServidor(baunitId: string | null): Promise<any> {
    const { formData, zipFile } = await this.prepararDatosPredio(baunitId);

    const headers = new HttpHeaders({
      'Authorization': `Token ${this.authService.token}`,
    });

    console.log("api: ", this.authService.urlDjangoApi);
    const url = `${this.authService.urlDjangoApi}/source/archivo_zip/`;

    return lastValueFrom(
        this.httpClient.post(url, formData, { headers })
    );
  }

  limpiarObjetoParaEnvio(objeto: any) {
    if (Array.isArray(objeto)) {
      return objeto.map(obj => this.limpiarObjetoIndividual(obj));
    } else {
      return this.limpiarObjetoIndividual(objeto);
    }
  }

  limpiarObjetoIndividual(objeto: any) {
    const { sqliteService, messageService, ...objetoLimpio } = objeto;
    return objetoLimpio;
  }



}
