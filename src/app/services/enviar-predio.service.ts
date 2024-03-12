import { Injectable } from '@angular/core';
import {SqliteService} from "./sqlite/sqlite.service";

@Injectable({
  providedIn: 'root'
})
export class EnviarPredioService {

  constructor(private sqliteService: SqliteService) { }

  async prepararDatosPredio(baunitId: string | null): Promise<any> {
    console.log('el baunit id es: ', baunitId);
    console.log('baunit-list: ', this.sqliteService.baunitList);
    // Recopilar datos del predio
    const datosPredio = this.sqliteService.baunitList.find(b => b.id.toString() === baunitId);

    // Recopilar datos de interesados relacionados
    const interesados = this.sqliteService.interesadoList.filter(i => i.baunit_id.toString() === baunitId);

    // Recopilar datos de unidades espaciales relacionadas
    const unidadesEspaciales = this.sqliteService.unidadEspacialList.filter(u => u.baunit_id.toString() === baunitId);

    // Recopilar puntos linderos relacionados (si necesitas)
    const puntosLinderos = this.sqliteService.crPuntoLinderoList.filter(p => p.baunit_id.toString() === baunitId);

    console.log('datos predio: ', datosPredio, 'datos interesados: ', interesados, 'unidades especiales: ', unidadesEspaciales, 'puntos linderos: ', puntosLinderos);
    /*// Preparar el objeto que vas a enviar
    const datosParaEnvio = {
      predio: datosPredio,
      interesados: interesados,
      unidadesEspaciales: unidadesEspaciales,
      puntosLinderos: puntosLinderos

    };

    // Aquí podrías convertir 'datosParaEnvio' a un string JSON, un formData, o incluso preparar un archivo ZIP si decides enviar múltiples archivos JSON
    return datosParaEnvio;*/
  }
}
