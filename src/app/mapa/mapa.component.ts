import { Component, OnInit } from '@angular/core';
import View from 'ol/View';
import * as proj from 'ol/proj';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import { CONFIG_OPENLAYERS } from '../configuracion-openlayers';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import LayerSwitcher from 'ol-layerswitcher';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM.js';
import {mapDraw} from "./mapDraw";
import { ScaleLine, defaults as defaultControls } from 'ol/control';
@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss'],
  standalone: true
})
export class MapaComponent implements OnInit {
  selectedSRC: string = 'EPSG:4326';
  constructor() { }

  ngOnInit(): void {
    this.inicializarMapa();
    mapDraw.addDrawPolygonInteraction();
    mapDraw.addDrawPointInteraction();
    mapDraw.addDrawLineInteraction();
  }

  inicializarMapa() {
    //Map projection
    /*let epsg25830 = new proj.Projection({
      code: 'EPSG:25830',
      extent: [716682.702,4365814.329,732380.437,4376383.664],
      units: 'm'
    });
    proj.addProjection(epsg25830);*/

    var vectorDigitalStyle = new Style({
      fill: new Fill({ color: 'blue' }), // Cambia los colores según tu preferencia
      stroke: new Stroke({ color: 'green', width: 3, lineJoin: 'round' }),
      image: new Circle({ radius: 4, fill: new Fill({ color: 'green' }) })
    });

    var vectorGpsStyle = new Style({
      fill: new Fill({ color: '#D7DF01' }),
      stroke: new Stroke({ color: '#DF013A', width: 3, lineJoin: 'round' }),
      image: new Circle({ radius: 4, fill: new Fill({ color: '#DF013A' }) })
    });

    CONFIG_OPENLAYERS.VECTOR_DRAW_GPS.setStyle(vectorGpsStyle);
    CONFIG_OPENLAYERS.VECTOR_DRAW_GPS.setOpacity(0.5);
    CONFIG_OPENLAYERS.VECTOR_DRAW_DIGITAL.setStyle(vectorDigitalStyle);
    CONFIG_OPENLAYERS.VECTOR_DRAW_DIGITAL.setOpacity(0.5);
    /*CONFIG_OPENLAYERS.VECTOR_DRAW.setStyle(vector_draw_style);
    CONFIG_OPENLAYERS.VECTOR_DRAW.setOpacity(0.5);*/

    var layer_PNOA = new TileLayer({
      source: new TileWMS({
        url: "http://www.ign.es/wms-inspire/pnoa-ma",
        params: {"LAYERS": "OI.OrthoimageCoverage", "VERSION": "1.3.0", "TILED": "true"},
      })
    });
    var layer_OSM = new TileLayer({
      source: new OSM(),
    });

    CONFIG_OPENLAYERS.MAP = new Map({
      target: 'map',
      layers: [layer_OSM,CONFIG_OPENLAYERS.VECTOR_DRAW_STATIC, CONFIG_OPENLAYERS.VECTOR_DRAW_DIGITAL, CONFIG_OPENLAYERS.VECTOR_DRAW_GPS],
      view: new View({
        projection: 'EPSG:4326',
        center: [-4,40],
        zoom: 6
      }),
      controls: defaultControls().extend([
        new ScaleLine({
          units: 'metric',
          minWidth: 100
        })
      ])
    });

    var layerSwitcher = new LayerSwitcher({
      tipLabel: 'Leyenda'
    });

    //Descomentar LayerSwitcher cuando se añadan más capas
    //CONFIG_OPENLAYERS.MAP.addControl(layerSwitcher);

  }

}