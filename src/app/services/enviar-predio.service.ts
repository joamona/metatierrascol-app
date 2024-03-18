import { Injectable } from '@angular/core';
import {SqliteService} from "./sqlite/sqlite.service";
import JSZip from 'jszip';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {firstValueFrom, lastValueFrom} from "rxjs";
import {AuthService} from "./auth.service";
import {ServerService} from "./server.service";

@Injectable({
  providedIn: 'root'
})
export class EnviarPredioService {

  constructor(private sqliteService: SqliteService, public httpClient: HttpClient, public authService: AuthService, private serverService: ServerService,) { }

  async prepararDatosPredio(baunitId: string | null): Promise<any> {
    console.log('Inicio de prepararDatosPredio con baunitId:', baunitId);
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
    console.log("llega a limpiar datos predio")

    if (interesados && interesados.length > 0) {
      zip.file("interesados.json", JSON.stringify(this.limpiarObjetoParaEnvio(interesados)));
      console.log("llega a limpiar interesado")
    }

    if (unidadesEspaciales && unidadesEspaciales.length > 0) {
      const geojsonUnidadesEspaciales = JSON.stringify({
        type: "FeatureCollection",
        features: unidadesEspaciales.map(u => ({
          type: "Feature",
          properties: {
            id: u.id,
            baunit_id: u.baunit_id,
            tipo: u.tipo
          },
          geometry: JSON.parse(u.geom)
        }))
      });

      zip.file("unidadesEspaciales.geojson", geojsonUnidadesEspaciales);
    }

    if (puntosLindero && puntosLindero.length > 0) {
      const puntosLinderoLimpios = this.limpiarObjetoParaEnvio(puntosLindero);
      const geojsonPuntosLindero = JSON.stringify({
        type: "FeatureCollection",
        features: puntosLinderoLimpios.map((p: any) => ({
          type: "Feature",
          properties: { ...p, geom: undefined },
          geometry: p.geom
        }))
      });
      zip.file("crPuntosLindero.geojson", geojsonPuntosLindero);
    }

    try {
      const zipFile = await zip.generateAsync({ type: "blob" });
      formData.append('archivo', zipFile, 'datos.zip');
      return { formData, zipFile };
    } catch (error) {
      console.error("Error generando el archivo ZIP: ", error);
    }
  }


  async enviarAlServidor(baunitId: string | null): Promise<any> {
    const { formData } = await this.prepararDatosPredio(baunitId);
    try {
      const response = await lastValueFrom(this.serverService.upload('/source/archivo_zip/', formData));
      await this.sqliteService.marcarPredioComoEnviado(baunitId);
    } catch (error) {
      console.error("Error enviando el archivo: ", error);
    }

  }
  limpiarObjetoParaEnvio(objeto: any) {
    if (Array.isArray(objeto)) {
      return objeto.map(obj => this.limpiarObjetoIndividual(obj));
    } else {
      return this.limpiarObjetoIndividual(objeto);
    }
  }

  limpiarObjetoIndividual(objeto: any) {
    const { sqliteService, messageService, geom, ...objetoLimpio } = objeto;
    try {
      if (typeof geom === 'string') {
        objetoLimpio.geom = JSON.parse(geom);
      } else {
        objetoLimpio.geom = geom;
      }
    } catch (e) {
      console.error("Error parseando geom:", e, "en el objeto:", objeto);
    }
    return objetoLimpio;
  }




}
