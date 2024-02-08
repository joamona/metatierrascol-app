import {GeoJSON} from 'ol/format';
import VectorSource from 'ol/source/Vector.js';

export function drawPoint(vSource: VectorSource,vCoords:number[],vaciar:boolean, propiedades:object){
	/*
	 * Añade un punto a un vectorSource
	 * vSource: vectorSource
	 * vCoords: vector de coordenadas [x,y]
	 * propiedades: diccionario con las propiedades { "ESTATE": "COBA", "AFDELING": "01"}
	 * vaciar: si es true, se eliminan los elementos previos
	 * */
	if(vaciar){
		vSource.clear();
	}
	var punto= {
            "type": "FeatureCollection",
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::25830" } },

            "features": [{ 
            	"type": "Feature", 
            	"properties": propiedades,
            	"geometry": {
            		type: "Point",
            		coordinates: vCoords
            		}
            	}
            ]
        };
	vSource.addFeatures((new GeoJSON()).readFeatures(punto));
	vSource.refresh();
	
	console.log('punto',vSource.getFeatures().length)
}