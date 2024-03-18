import {Component, OnInit} from '@angular/core';
import {GeolocationService} from "../../services/Geolocation.service";
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {GenerateOlGeoms} from "../../utilities/crearGeoms";
import {SqliteService} from "../../services/sqlite/sqlite.service";
import {CrPuntoLindero} from "../../models/crPuntoLindero";
import {MessageService} from "../../services/message.service";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {MatError, MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {CONFIG_OPENLAYERS} from "../../configuracion-openlayers";
import {MapaComponent} from "../../mapa/mapa.component";
import {GeoJSON} from "ol/format";
import {Feature} from "ol";
import {Geometry} from "ol/geom";
import {UnidadEspacial} from "../../models/unidadEspacial";
import Swal from "sweetalert2";
import {Interesado} from "../../models/interesado";


@Component({
  selector: 'app-medir-gps',
  templateUrl: './medir-gps.component.html',
  styleUrl: './medir-gps.component.scss',
  providers: [],
  standalone: true,
  imports: [MatButtonModule, NgIf, RouterLink, ReactiveFormsModule, MatError, MatFormField, MatInput, MapaComponent, MatFormFieldModule,
    MatInputModule],
})
export class MedirGpsComponent implements OnInit  {

  generateOlGeoms: GenerateOlGeoms;
  puntosMedidos: number = 0;
  precisiones: number[] = [];
  peorPrecision: Number = 0;
  baunit_id: string = '';
  unidadEspacialActualId: string = '';
  medicionIniciada: boolean = false;
  descripcion = new FormControl('');
  id: string = '';
  lista_id: string[] = [];
  mode!: string | null;

  private fakePoints = [
    { lat: 40.416775, lon: -3.703790, precision: 5 },
    { lat: 41.385064, lon: 2.173404, precision: 10 },
    { lat: 39.469907, lon: -0.376288, precision: 15 },
    { lat: 36.721273, lon: -4.421399, precision: 21 },
    { lat: 37.388630, lon: -5.982330, precision: 25 }

  ];


  private currentFakePointIndex = 0;


  controlsGroup = new FormGroup({
    descripcion: this.descripcion
  });
  constructor(private geolocationService: GeolocationService, public router: Router, public sqliteService: SqliteService, public messageService: MessageService, public route: ActivatedRoute) {
    this.generateOlGeoms = new GenerateOlGeoms(4326);
    this.route.queryParamMap.subscribe(params => {
      this.mode = params.get("mode");
    });
  }

  async ngOnInit() {

    console.log("lista de puntos: ", this.generateOlGeoms.pointsList);

    this.route.queryParamMap.subscribe(async params => {
      this.baunit_id = params.get('baunit_id') || "-1";


      this.unidadEspacialActualId = params.get('id') || "-1";

      if (this.mode === 'editar' && this.unidadEspacialActualId) {
        var nuevaUnidad = new UnidadEspacial(this.sqliteService, this.messageService);
        nuevaUnidad.baunit_id = this.baunit_id;

        await nuevaUnidad.setFromId(this.unidadEspacialActualId);

      }

    });

  }

  centerMapToMyPosition() {
    this.geolocationService.getCurrentCoordinates().then(position => {
      let centro = CONFIG_OPENLAYERS.MAP.getView();
      centro.setCenter([position.coords.longitude, position.coords.latitude]);
      centro.setZoom(20);
      CONFIG_OPENLAYERS.MAP.setView(centro);
      console.log([position.coords.latitude, position.coords.longitude])
    }).catch(error => {
      console.error('Error al obtener la posición actual:', error);
      alert(`Error al obtener la ubicación: ${error.message}`);
    });
  }

  async medirPunto() {
    if (!this.medicionIniciada) {
      await this.iniciarMedicion();
      this.medicionIniciada = true;
    }

    try {
      const position = await this.geolocationService.getCurrentCoordinates();
      const precision = parseFloat(position.coords.accuracy.toFixed(4));
      const pointCoords = [position.coords.longitude, position.coords.latitude];


      this.generateOlGeoms.addPoint(pointCoords, precision);

      this.actualizarMapaConGeometrias();

      await this.insertPunto(pointCoords, precision);

      this.puntosMedidos = this.generateOlGeoms.pointsList.length;
      this.precisiones.push(precision);
      this.actualizarPeorPrecision();

    } catch (error) {
      console.error('Error al medir el punto:', error);
      alert(`Error al obtener la ubicación: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async medirPuntoPruebas() {
    if (!this.medicionIniciada) {
      await this.iniciarMedicion();
      this.medicionIniciada = true;
    }


    const fakePoint = this.fakePoints[this.currentFakePointIndex];
    const precision = fakePoint.precision;
    const pointCoords = [fakePoint.lon, fakePoint.lat];


    this.generateOlGeoms.addPoint(pointCoords, precision);


    this.currentFakePointIndex = (this.currentFakePointIndex + 1) % this.fakePoints.length;

    this.actualizarMapaConGeometrias();


    await this.insertPunto(pointCoords, precision);


    this.puntosMedidos = this.generateOlGeoms.pointsList.length;
    this.precisiones.push(precision);
    this.actualizarPeorPrecision()
  }
  async insertPunto(pointCoords: number[], precision: number) {

    const crPuntoLindero = new CrPuntoLindero(this.sqliteService, this.messageService);
    crPuntoLindero.baunit_id = this.baunit_id;
    crPuntoLindero.unidad_espacial_id = this.unidadEspacialActualId;
    crPuntoLindero.tipo = "GPS";
    crPuntoLindero.geom = JSON.stringify({type: 'Point', coordinates: pointCoords});
    crPuntoLindero.lon = pointCoords[0];
    crPuntoLindero.lat = pointCoords[1];
    crPuntoLindero.exactitud_horizontal = precision;
    crPuntoLindero.descripcion = this.descripcion.value;
    await crPuntoLindero.insert();
    this.id = crPuntoLindero.id;
    this.lista_id.push(crPuntoLindero.id);

    await this.actualizarGeometriaUnidadEspacial();
  }



  async iniciarMedicion() {
    this.medicionIniciada = true;
    var nuevaUnidad = new UnidadEspacial(this.sqliteService, this.messageService);
    nuevaUnidad.baunit_id = this.baunit_id;
    await nuevaUnidad.insert();
    this.unidadEspacialActualId = nuevaUnidad.id;
    console.log("el baunit_id es: ", this.baunit_id, " y el id de la unidad_espacial es: ", nuevaUnidad.id);
  }

  async deleteLastPoint(){
    let ultimoPuntoId = this.lista_id.pop();
    if (typeof ultimoPuntoId === "undefined") {
      console.log("No hay puntos para eliminar.");
      return;
    }
    this.generateOlGeoms.deletePoint();
    this.actualizarMapaConGeometrias();

    var ultimo_punto = new CrPuntoLindero(this.sqliteService, this.messageService);
    ultimo_punto.id = ultimoPuntoId;
    await ultimo_punto.delete();


    await this.actualizarGeometriaUnidadEspacial();

    if (this.precisiones.length > 0) {
      this.precisiones.pop();
      this.actualizarPeorPrecision();
    }

  }

  actualizarPeorPrecision() {
    if (this.precisiones.length > 0) {
      this.peorPrecision = Math.max(...this.precisiones);
    }
  }

  async actualizarGeometriaUnidadEspacial() {
    let geometryToStore;

    if (this.generateOlGeoms.pointsList.length === 1) {
      geometryToStore = this.generateOlGeoms.geoJsonElementPoint.geometry;
    } else if (this.generateOlGeoms.pointsList.length === 2) {
      geometryToStore = this.generateOlGeoms.geoJsonElementLineString.geometry;
    } else if (this.generateOlGeoms.pointsList.length > 2) {
      geometryToStore = this.generateOlGeoms.geoJsonElementPolygon.geometry;
    }

    if (geometryToStore) {
      var nuevaUnidad = new UnidadEspacial(this.sqliteService, this.messageService);
      nuevaUnidad.id = this.unidadEspacialActualId;
      nuevaUnidad.baunit_id = this.baunit_id;
      nuevaUnidad.geom = JSON.stringify(geometryToStore);
      await nuevaUnidad.update();
    }
  }


  private actualizarMapaConGeometrias() {
    const featureCollection = this.generateOlGeoms.getFeatureCollectionToDraw();
    if (featureCollection) {
      CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.clear();
      const features = new GeoJSON().readFeatures(featureCollection, {
        dataProjection: 'EPSG:4326',
        featureProjection: CONFIG_OPENLAYERS.MAP.getView().getProjection()
      }) as Feature<Geometry>[];

      features.forEach((feature) => {
        feature.setId(this.unidadEspacialActualId);
        console.log("la feature es: ", feature);
      });
      CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.addFeatures(features);
    }
  }

  private moverFeaturesACapaEstatica() {
    const features = CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.getFeatures();


    if (features.length > 0) {
      CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.clear();

      CONFIG_OPENLAYERS.SOURCE_DRAW_STATIC.addFeatures(features);
    }
  }

  async navigateToMenu() {
    this.moverFeaturesACapaEstatica();

    if (this.generateOlGeoms.pointsList.length === 0 && this.unidadEspacialActualId) {
      var nuevaUnidad = new UnidadEspacial(this.sqliteService, this.messageService);
      nuevaUnidad.baunit_id = this.baunit_id;

      await nuevaUnidad.delete();
    }

    this.router.navigate(['/main-screen/menu-predio'], { queryParams: {mode: 'editar', baunit_id: this.baunit_id}});
  }


  async deleteUnidadEspacial() {
    if (this.unidadEspacialActualId) {
      const unidadEspacial = new UnidadEspacial(this.sqliteService, this.messageService);
      unidadEspacial.id = this.unidadEspacialActualId;

      try {
        await unidadEspacial.delete();
        console.log(`Unidad Espacial ${this.unidadEspacialActualId} eliminada.`);

        await this.eliminarGeometriaPorUnidadEspacial(this.unidadEspacialActualId);
        await this.router.navigate(['/main-screen/menu-predio/medir-gps-list'], { queryParams: {mode: 'editar', baunit_id: this.baunit_id}});
      } catch (error) {
        console.error('Error al eliminar la unidad espacial:', error);
      }
    } else {
      console.warn("No hay una unidad espacial seleccionada para borrar.");
    }
  }

  async eliminarGeometriaPorUnidadEspacial(unidadEspacialId: string) {
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
        let feature = CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.getFeatureById(unidadEspacialId);
        if (feature) {
          CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.removeFeature(feature);
        }

        feature = CONFIG_OPENLAYERS.SOURCE_DRAW_STATIC.getFeatureById(unidadEspacialId);
        if (feature) {
          CONFIG_OPENLAYERS.SOURCE_DRAW_STATIC.removeFeature(feature);
        }
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



}
