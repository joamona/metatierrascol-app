/**
 * Author Gaspar Mora-Navarro. Universitat Politècnica de València. joamona@cgf.upv.es
 * 2024-01-26
 * Creates objects than can be converted to geojson strings with
 *      JSON.stringify(object)
 * 
    Examples of use:
    If you uncomment saveFileOnDisk, in the examples the web browser will ask you 
    for save a file in your disk
    
    
    //First create the coordinate reference system (crs)
    var crs = new GeoJsonCRS(25830);
      
    //Create a class to see the available geometry types
    var gt = new GeometryType();

    //POINTS:

    //create the geometries
    var pg1 = new GeoJsonGeometry(gt.point,[726151.952357223,4374499.933133851]);
    var pg2 = new GeoJsonGeometry(gt.point,[726160.952357223,4374499.933133851]);

    //create the geojson elements from the geometries. The dictionary can contain 
	// any number of properties {"p1":"v1", "p2":"v2", ...}
    var pge1 = new GeoJsonElement({"propiedad1":"valor1"},pg1);
    var pge2 = new GeoJsonElement({"propiedad1":"valor1"},pg2);

    //create the feature collection of elements, by passing an array of geojson elements and the crs
    var fc1 = new GeoJsonFeatureCollection(crs,[pge1,pge2]);

    //Log the object
    console.log(fc1);

    //Get the object in string format
    console.log(JSON.stringify(fc1))
    //save the geojson string on disk
    //saveFileOnDisk('points.geojson',JSON.stringify(fc1));


    //LINESTRING:
    //create the geometries
    var lg1=new GeoJsonGeometry(gt.lineString,[[726151.952357223,4374499.933133851],[724021.107469528,4373503.494877015],[724802.928255661,4371571.937640686],[726627.176756637,4372874.972284242],[726151.952357223,4374499.933133851]])
    var lg2=new GeoJsonGeometry(gt.lineString,[[726160.952357223,4374490.933133851],[724021.107469528,4373503.494877015],[724802.928255661,4371571.937640686],[726627.176756637,4372874.972284242],[726151.952357223,4374499.933133851]])
    
    //create the geojosn elements from the geometries
    var lge1 = new GeoJsonElement({"propiedad1":"valor1"},lg1);
    var lge2 = new GeoJsonElement({"propiedad1":"valor1"},lg2);

    //create the feature collection of elements
    var fc2= new GeoJsonFeatureCollection(crs,[lge1,lge2])
    //saveFileOnDisk('lines.geojson',JSON.stringify(fc2));
    console.log(fc2);

    //POLYGONS
    //create the geometrY
    var pog1= new GeoJsonGeometry(gt.polygon,[[[726160.952357223,4374490.933133851],[724021.107469528,4373503.494877015],[724802.928255661,4371571.937640686],[726627.176756637,4372874.972284242],[726151.952357223,4374499.933133851]]])    
    var poge1=new GeoJsonElement({"propiedad1":"valor1"},pog1);
    var fc3=new GeoJsonFeatureCollection(crs,[poge1]);
    //saveFileOnDisk('polygon.geojson',JSON.stringify(fc3));
    console.log(fc3);

 */

export function saveFileOnDisk(fileName: string, fileContent:string, fileType: string="text/json"){
    /**
     * Salva el fichero, preguntando dónde.
     * Crea un hiper enlace, llamado link, y luego lo borra.
     */
    const file = new Blob([fileContent], {type:fileType})
    const link = document.createElement("a");
    link.href=URL.createObjectURL(file);
    link.download = fileName;
    link.click();
    link.remove;
    }

export class GeometryType{
    point = "Point";
    multiPoint = "MultiPoint";
    lineString = "LineString";
    multiLineString = "MultiLineString";
    polygon = "Polygon";
    multiPolygon = "MultyPolygon"
}

export class GeoJsonGeometry{
    constructor(public type:string, public coordinates: any[]){}
}
export class GeoJsonElement{
    type = "Feature"
    constructor(public properties: object, public geometry: GeoJsonGeometry){}
}

export class GeoJsonCRS{
    type = "name";
    properties = {"name": ""}
    constructor(epsgCode:any){
        var a = "urn:ogc:def:crs:EPSG::" + epsgCode.toString();
        this.properties.name = a;
    }
}

export class GeoJsonFeatureCollection{
    type = "FeatureCollection"
    constructor(public crs:GeoJsonCRS,public features: GeoJsonElement[]){
    }
}



// export function createGeoJsonElement(geometryType: string, properties: object, vCoords: any[]){
//     var point:object={ 
//             "type": "Feature", 
//             "properties": properties,
//             "geometry": {
//                 type: geometryType,
//                 coordinates: vCoords
//                 }
//             }
// }

// export function createFeatureCollection(propiedades:object,vCoords: any[]){
//     var punto= {
//         "type": "FeatureCollection",
//         "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::25830" } },

//         "features": [{ 
//             "type": "Feature", 
//             "properties": propiedades,
//             "geometry": {
//                 type: "Point",
//                 coordinates: vCoords
//                 }
//             }
//         ]
//     };
// }