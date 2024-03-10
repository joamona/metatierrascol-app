import {CONFIG_OPENLAYERS} from "../configuracion-openlayers";
import Draw from "ol/interaction/Draw";
import Feature from "ol/Feature.js";
import Polygon from "ol/geom/Polygon.js";


export class mapDraw {

    public static addDrawPolygonInteraction() {
        CONFIG_OPENLAYERS.MAP_DRAW_POLYGON = new Draw({
            source: CONFIG_OPENLAYERS.SOURCE_DRAW_DIGITAL,
            type:('Polygon')
        });
        CONFIG_OPENLAYERS.MAP.addInteraction(CONFIG_OPENLAYERS.MAP_DRAW_POLYGON);
    }
    public static addDrawPointInteraction() {
        CONFIG_OPENLAYERS.MAP_DRAW_POINT = new Draw({
            source: CONFIG_OPENLAYERS.SOURCE_DRAW_DIGITAL,
            type:('Point')
        });
        CONFIG_OPENLAYERS.MAP.addInteraction(CONFIG_OPENLAYERS.MAP_DRAW_POINT);
    }
    public static addDrawLineInteraction() {
        CONFIG_OPENLAYERS.MAP_DRAW_LINE = new Draw({
            source: CONFIG_OPENLAYERS.SOURCE_DRAW_DIGITAL,
            type:('LineString')
        });
        CONFIG_OPENLAYERS.MAP.addInteraction(CONFIG_OPENLAYERS.MAP_DRAW_LINE);
    }

    public static enableDrawPolygons(){
        this.disableDrawings();
        CONFIG_OPENLAYERS.MAP_DRAW_POLYGON.setActive(true);
    }

    public static enableDrawPoints(){
        this.disableDrawings();
        CONFIG_OPENLAYERS.MAP_DRAW_POINT.setActive(true);
    }

    public static enableDrawLine(){
        this.disableDrawings();
        CONFIG_OPENLAYERS.MAP_DRAW_LINE.setActive(true);
    }
    public static disableDrawings(){
        if (CONFIG_OPENLAYERS.MAP_DRAW_POLYGON) {
            CONFIG_OPENLAYERS.MAP_DRAW_POLYGON.setActive(false);
        }
        if (CONFIG_OPENLAYERS.MAP_DRAW_POINT) {
            CONFIG_OPENLAYERS.MAP_DRAW_POINT.setActive(false);
        }
        if (CONFIG_OPENLAYERS.MAP_DRAW_LINE) {
            CONFIG_OPENLAYERS.MAP_DRAW_LINE.setActive(false);
        }
    }

    public static clearVectorLayerDigital(){
        CONFIG_OPENLAYERS.SOURCE_DRAW_DIGITAL.clear();
    }
    public static clearVectorLayerGPS(){
        CONFIG_OPENLAYERS.SOURCE_DRAW_GPS.clear();
    }

    public static addPolygonToLayer(coordinates: number[][]) {
        console.log("las coordenadas que entran a la función addPolygonToLayer son:")
        console.log(coordinates)

        let polygonGeometry = new Polygon([coordinates]);

        let polygonFeature = new Feature({
            geometry: polygonGeometry,
        });

        CONFIG_OPENLAYERS.SOURCE_DRAW_DIGITAL.addFeature(polygonFeature);
    }





    public static initializeDrawingInteractions() {
        this.addDrawPolygonInteraction();
        this.addDrawPointInteraction();
        this.addDrawLineInteraction();
        this.disableDrawings();
    }

}