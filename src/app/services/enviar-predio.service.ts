import { Injectable } from '@angular/core';
import {SqliteService} from "./sqlite/sqlite.service";
import JSZip from 'jszip';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {firstValueFrom, lastValueFrom} from "rxjs";
import {AuthService} from "./auth.service";
import {ServerService} from "./server.service";
import { GeoJsonCRS, GeoJsonElement,GeoJsonGeometry,GeoJsonFeatureCollection, GeometryType } from "../utilities/createGeoJson";
import {GenerateOlGeoms} from "../utilities/crearGeoms";

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

    const crsCode = 25830;
    const zip = new JSZip();
    zip.file("datosPredio.json", JSON.stringify(this.limpiarObjetoParaEnvio(datosPredio)));
    console.log("llega a limpiar datos predio")

    if (interesados && interesados.length > 0) {
      zip.file("interesados.json", JSON.stringify(this.limpiarObjetoParaEnvio(interesados)));
      console.log("llega a limpiar interesado")
    }

    unidadesEspaciales.forEach(unidadEspacial => {
      const generateOlGeoms = new GenerateOlGeoms(crsCode);
      const puntosDeUnidad = puntosLindero.filter(p => p.unidad_espacial_id === unidadEspacial.id);

      puntosDeUnidad.forEach(punto => generateOlGeoms.addPoint([punto.lon, punto.lat], punto.exactitud_horizontal, punto.id));
      const featureCollection = generateOlGeoms.getFeatureCollectionToDraw();

      if (featureCollection) {
        featureCollection.features = featureCollection.features.map(feature => ({
          ...feature,
          properties: {
            id: unidadEspacial.id,
            baunit_id: unidadEspacial.baunit_id,
            tipo: unidadEspacial.tipo,
            ...feature.properties,
          }
        }));

        const geojsonString = JSON.stringify(featureCollection);
        zip.file(`unidadEspacial_${unidadEspacial.id}.geojson`, geojsonString);
      } else {
        console.warn(`No se pudo generar featureCollection para la unidad espacial con ID ${unidadEspacial.id}.`);
      }
    });

    // Paso 1: Crear el sistema de referencia de coordenadas (CRS)
    var crs = new GeoJsonCRS(25830);

    // Paso 2: Crear una clase para ver los tipos de geometría disponibles
    var gt = new GeometryType();

    // Crear un array vacío para GeoJsonElements
    var listaGeoJsonElements: GeoJsonElement[] = [];

    puntosLindero.forEach(punto => {
      var pg = new GeoJsonGeometry(gt.point, [punto.lon, punto.lat]);
      var pge = new GeoJsonElement({
        "id": punto.id,
        "baunit_id": punto.baunit_id,
        "unidad_espacial_id": punto.unidad_espacial_id,
        "tipo": punto.tipo,
        "lon": punto.lon,
        "lat": punto.lat,
        "exactitud_horizontal": punto.exactitud_horizontal,
        "descripcion": punto.descripcion
      }, pg);

      listaGeoJsonElements.push(pge);
    });


    // Paso 5: Crear la colección de elementos (FeatureCollection) pasando un array de elementos GeoJSON y el CRS
    var fc = new GeoJsonFeatureCollection(crs, listaGeoJsonElements);

    // Convertir el FeatureCollection en una cadena para incluir en el archivo .json
    var s = JSON.stringify(fc);

    zip.file("crPuntosLindero.geojson", s);

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
