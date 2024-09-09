import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {GeolocationService} from "../../services/geolocation.service";
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {GenerateOlGeoms} from "../../utilities/crearGeoms";
import {SqliteService} from "../../services/sqlite/sqlite.service";
import {CrPuntoLindero} from "../../models/crPuntoLindero";
import {MessageService} from "../../services/message.service";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
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
import { Point } from 'ol/geom';
import {createPointTextStyle} from "../../utilities/open-layers/labels";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {MatDialog} from "@angular/material/dialog";
import { Geolocation, PositionOptions } from '@capacitor/geolocation';
import {mapDraw} from "../../mapa/mapDraw";
import {NativeSettings, AndroidSettings} from 'capacitor-native-settings';
import {PointService} from "../../services/point.service";

@Component({
  selector: 'app-medir-gps',
  templateUrl: './medir-gps.component.html',
  styleUrl: './medir-gps.component.scss',
  providers: [],
  standalone: true,
  imports: [MatButtonModule, NgIf, RouterLink, ReactiveFormsModule, MatError, MatFormField, MatInput, MapaComponent, MatFormFieldModule,
    MatInputModule, MatIconModule],
})
export class MedirGpsComponent implements OnInit, OnDestroy {

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
  pointSource: VectorSource = new VectorSource();
  pointsLayer: VectorLayer<VectorSource> = new VectorLayer({
    source: this.pointSource,
    style: createPointTextStyle('id', 'red')
  });
  gpsAccuracy: number | null = null;
  watchId: string | null = null;

  private fakePoints = [
    {lat: 40.416775, lon: -3.703790, precision: 5},
    {lat: 41.385064, lon: 2.173404, precision: 10},
    {lat: 39.469907, lon: -0.376288, precision: 15},
    {lat: 36.721273, lon: -4.421399, precision: 21},
    {lat: 37.388630, lon: -5.982330, precision: 25}

  ];

  private currentFakePointIndex = 0;

  constructor(private geolocationService: GeolocationService, private pointService: PointService, private zone: NgZone, public router: Router, private dialog: MatDialog, public sqliteService: SqliteService, public messageService: MessageService, public route: ActivatedRoute) {
    this.generateOlGeoms = new GenerateOlGeoms(4326);
    this.route.queryParamMap.subscribe(params => {
      this.mode = params.get("mode");
    });
  }

  async ngOnInit() {
    this.startWatchingPosition();
    console.log("lista de puntos: ", this.generateOlGeoms.pointsList);

    this.route.queryParamMap.subscribe(async params => {
      this.baunit_id = params.get('baunit_id') || "-1";


      this.unidadEspacialActualId = params.get('id') || "-1";

      if (this.mode === 'editar' && this.unidadEspacialActualId) {
        var nuevaUnidad = new UnidadEspacial(this.sqliteService, this.messageService);
        nuevaUnidad.baunit_id = this.baunit_id;

        await nuevaUnidad.setFromId(this.unidadEspacialActualId);
        await this.dibujarGeometriasExistentes();
        this.restaurarFeaturesParaEdicion();
        this.medicionIniciada = true;
        this.setLastMeasuredAccuracyFromPoints();
      }


    });

    this.pointService.deletePointObservable.subscribe({
      next: (pointId) => {
        this.handlePointDeletion(pointId);
      },
      error: (err) => console.error('Error al eliminar punto:', err)
    });
  }

  ngAfterViewInit() {
    CONFIG_OPENLAYERS.MAP.addLayer(this.pointsLayer);
    mapDraw.disableDrawings();
  }

  centerMapToMyPosition() {
    this.geolocationService.getCurrentCoordinates().then(position => {
      let centro = CONFIG_OPENLAYERS.MAP.getView();
      centro.setCenter([position.coords.longitude, position.coords.latitude]);
      centro.setZoom(20);
      CONFIG_OPENLAYERS.MAP.setView(centro);
      console.log([position.coords.latitude, position.coords.longitude])
    }).catch(error => {
      this.showLocationError(error);
    });
  }

  async medirPunto() {
    console.log("la medición está iniciada? ", this.medicionIniciada);
    if (!this.medicionIniciada) {
      await this.iniciarMedicion();
      console.log("la medición está iniciada ahora? ", this.medicionIniciada);
      mapDraw.enableDrawPoints();
    }

    try {
      const position = await this.geolocationService.getCurrentCoordinates();
      const precision = parseFloat(position.coords.accuracy.toFixed(4));
      const pointCoords = [position.coords.longitude, position.coords.latitude];

      await this.insertPunto(pointCoords, precision);

      this.actualizarMapaConGeometrias();


      this.puntosMedidos = this.generateOlGeoms.pointsList.length;
      this.precisiones.push(precision);
      this.setLastMeasuredAccuracyFromPoints();
      mapDraw.disableDrawings();
    } catch (error) {
      this.showLocationError(error);
    }
  }

  async medirPuntoPruebas() {
    if (!this.medicionIniciada) {
      await this.iniciarMedicion();
      this.medicionIniciada = true;
      mapDraw.enableDrawPoints();
    }


    const fakePoint = this.fakePoints[this.currentFakePointIndex];
    const precision = fakePoint.precision;
    const pointCoords = [fakePoint.lon, fakePoint.lat];

    this.currentFakePointIndex = (this.currentFakePointIndex + 1) % this.fakePoints.length;

    await this.insertPunto(pointCoords, precision);
    this.actualizarMapaConGeometrias();

    this.puntosMedidos = this.generateOlGeoms.pointsList.length;
    this.precisiones.push(precision);
    this.setLastMeasuredAccuracyFromPoints()
    mapDraw.disableDrawings();
  }

  async insertPunto(pointCoords: number[], precision: number) {

    console.log("la medición está iniciada antes de insertar el punto? ", this.medicionIniciada);

    console.log("el baunit id y la unidad_espacial_id serán respectivamente: ", this.baunit_id, this.unidadEspacialActualId)
    const crPuntoLindero = new CrPuntoLindero(this.sqliteService, this.messageService);
    crPuntoLindero.baunit_id = this.baunit_id;
    crPuntoLindero.unidad_espacial_id = this.unidadEspacialActualId;
    crPuntoLindero.tipo = "GPS";
    //crPuntoLindero.geom = JSON.stringify({type: 'Point', coordinates: pointCoords});
    crPuntoLindero.lon = pointCoords[0];
    crPuntoLindero.lat = pointCoords[1];
    crPuntoLindero.exactitud_horizontal = precision;
    crPuntoLindero.descripcion = this.descripcion.value;
    await crPuntoLindero.insert();

    this.generateOlGeoms.addPoint([crPuntoLindero.lon, crPuntoLindero.lat], crPuntoLindero.exactitud_horizontal, crPuntoLindero.id);

    const pointFeature = new Feature(new Point(pointCoords));
    pointFeature.setId(crPuntoLindero.id.toString());
    this.pointSource.addFeature(pointFeature);

    console.log(pointFeature)


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


    console.log("el id de la unidadEspacial actual es: ", this.unidadEspacialActualId)
    console.log("el baunit_id es: ", this.baunit_id, " y el id de la unidad_espacial es: ", nuevaUnidad.id);
  }

  async deletePoint(pointId: string) {
    const index = this.lista_id.indexOf(pointId);
    if (index > -1) {
      this.lista_id.splice(index, 1);
    }

    console.log("el tipo de punto desde medir-gps es: ", typeof pointId)
    this.generateOlGeoms.deletePoint(pointId);

    var punto = new CrPuntoLindero(this.sqliteService, this.messageService);
    punto.id = pointId;
    await punto.delete();

    const feature = this.pointSource.getFeatureById(pointId);
    if (feature) {
      this.pointSource.removeFeature(feature);
    }

    this.actualizarMapaConGeometrias();
    await this.actualizarGeometriaUnidadEspacial();
    console.log("precisiones lenght es: ", this.precisiones.length)
    if (this.precisiones.length > 0) {
      this.precisiones.pop();
      this.setLastMeasuredAccuracyFromPoints();
    }
  }

  /*actualizarPeorPrecision() {
    if (this.precisiones.length > 0) {
      this.peorPrecision = Math.max(...this.precisiones);
    }
  }*/

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
      //nuevaUnidad.geom = JSON.stringify(geometryToStore);
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

      if (features.length > 0) {
        const extent = CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.getExtent();
        CONFIG_OPENLAYERS.MAP.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000
        });
      }
    }

  }

  private moverFeaturesACapaEstatica() {
    const features = CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.getFeatures();

    if (features.length > 0) {
      CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.clear();

      features.forEach(feature => {
        const existingFeatures = CONFIG_OPENLAYERS.SOURCE_DRAW_STATIC.getFeatures().filter(f => f.getId() === feature.getId());

        existingFeatures.forEach(existingFeature => {
          CONFIG_OPENLAYERS.SOURCE_DRAW_STATIC.removeFeature(existingFeature);
        });

        CONFIG_OPENLAYERS.SOURCE_DRAW_STATIC.addFeature(feature);
      });
    }
  }

  async navigateToMenu() {

    this.moverFeaturesACapaEstatica();

    console.log("generateOlGeoms point list legth: ", this.generateOlGeoms.pointsList.length)
    if (this.generateOlGeoms.pointsList.length === 0 && this.unidadEspacialActualId) {
      var nuevaUnidad = new UnidadEspacial(this.sqliteService, this.messageService);
      nuevaUnidad.baunit_id = this.baunit_id;

      await nuevaUnidad.delete();
    }

    console.table(this.sqliteService.crPuntoLinderoList)
    console.table(this.sqliteService.unidadEspacialList)
    this.router.navigate(['/main-screen/menu-predio'], {queryParams: {mode: 'editar', baunit_id: this.baunit_id}});
  }

  private restaurarFeaturesParaEdicion() {
    const features = CONFIG_OPENLAYERS.SOURCE_DRAW_STATIC.getFeatures().filter(feature => feature.getId() === this.unidadEspacialActualId);

    if (features.length > 0) {

      features.forEach(feature => {
        CONFIG_OPENLAYERS.SOURCE_DRAW_STATIC.removeFeature(feature);
        CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.addFeature(feature);
      });
      this.actualizarMapaConGeometrias();
    }

    console.log("la lista de puntos de crearGeoms es: ", this.generateOlGeoms.pointsList)
  }

  async setLastMeasuredAccuracyFromPoints() {
    const puntosDeUnidad = this.sqliteService.crPuntoLinderoList.filter(p =>
        p.unidad_espacial_id.toString() === this.unidadEspacialActualId
    );

    puntosDeUnidad.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    if (puntosDeUnidad.length > 0) {
      const lastPoint = puntosDeUnidad[0];  // El último punto añadido
      this.peorPrecision = lastPoint.exactitud_horizontal;
      console.log(`Última precisión recuperada de la unidad espacial actual: ${this.peorPrecision}`);
    }
  }



  async dibujarGeometriasExistentes() {
    const puntosDeUnidad = this.sqliteService.crPuntoLinderoList.filter(p =>
        p.unidad_espacial_id.toString() === this.unidadEspacialActualId && p.baunit_id.toString() === this.baunit_id
    );

    console.log("puntos unidad: ", puntosDeUnidad);

    for (const puntoData of puntosDeUnidad) {
      let punto = new CrPuntoLindero(this.sqliteService, this.messageService);
      await punto.setFromId(puntoData.id);
      const pointFeature = new Feature(new Point([punto.lon, punto.lat]));
      pointFeature.setId(punto.id.toString());
      this.pointSource.addFeature(pointFeature);
      this.generateOlGeoms.addPoint([punto.lon, punto.lat], punto.exactitud_horizontal, punto.id);
      this.lista_id.push(punto.id);
    }

    this.actualizarMapaConGeometrias();
  }

  async deleteUnidadEspacial() {
    if (this.unidadEspacialActualId) {
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
          const unidadEspacial = new UnidadEspacial(this.sqliteService, this.messageService);
          unidadEspacial.id = this.unidadEspacialActualId;

          await unidadEspacial.delete();
          console.log(`Unidad Espacial ${this.unidadEspacialActualId} eliminada.`);
          await this.eliminarGeometriaPorUnidadEspacial(this.unidadEspacialActualId);

          await this.router.navigate(['/main-screen/menu-predio/medir-gps-list'], {
            queryParams: {
              mode: 'editar',
              baunit_id: this.baunit_id
            }
          });
        } catch (error) {
          console.error('Error al eliminar la unidad espacial:', error);
        }
      } else {
        console.log("Acción de eliminación cancelada.");
      }
    } else {
      console.warn("No hay una unidad espacial seleccionada para borrar.");
    }
  }

  async eliminarGeometriaPorUnidadEspacial(unidadEspacialId: string) {
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


  openPointDetails() {
    this.router.navigate(['/main-screen/menu-predio/puntos-list'], {
      queryParams: {
        mode: 'editar',
        baunit_id: this.baunit_id,
        unidadEspacial_id: this.unidadEspacialActualId,
      }
    });
  }

  async startWatchingPosition() {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 1000,
      maximumAge: 0
    };

    this.watchId = await Geolocation.watchPosition(options, (position, err) => {
      if (err) {
        console.error('Error al observar la posición:', err);
        return;
      }
      if (position) {
        this.zone.run(() => {
          this.gpsAccuracy = parseFloat(position.coords.accuracy.toFixed(3));
          console.log(`Precisión actual del GPS: ${this.gpsAccuracy} metros`);
        });
      }
    });

    console.log(`Watch ID: ${this.watchId}`);
  }


  ngOnDestroy() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId }).then(() => {
        console.log('GPS watch stopped');
        this.watchId = null;
      }).catch(err => {
        console.error('Error al detener la observación del GPS:', err);
      });
    }
  }

  showLocationError(error: any) {
    Swal.fire({
      title: 'Error al obtener la ubicación',
      text: `Error al obtener la ubicación: ${error.message}`,
      icon: 'error',
      confirmButtonText: 'Abrir Configuración GPS',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.openGPSSettings();
      }
    });
  }

  handlePointDeletion(pointId: string) {
    const index = this.lista_id.indexOf(pointId);
    if (index > -1) {
      this.lista_id.splice(index, 1);
      this.generateOlGeoms.deletePoint(pointId);
      const feature = this.pointSource.getFeatureById(pointId);
      if (feature) {
        this.pointSource.removeFeature(feature);
      }
      this.actualizarMapaConGeometrias();
      this.setLastMeasuredAccuracyFromPoints();
    }
  }

  openGPSSettings() {
    NativeSettings.openAndroid({
      option: AndroidSettings.Location
    }).catch(err => {
      console.error('Error al abrir la configuración de la aplicación en Android:', err);
      Swal.fire('Error', 'No se pudo abrir la configuración de la aplicación', 'error');
    });
  }

}