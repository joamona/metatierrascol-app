import { GeoJsonCRS, GeoJsonElement,GeoJsonGeometry,GeoJsonFeatureCollection, GeometryType } from "./createGeoJson";
//First create the coordinate reference system (crs)
    
export class GenerateOlGeoms{
    worstAccuracy = -1;
    geoJsonCRS: GeoJsonCRS
    public gt: GeometryType = new GeometryType();
    pointsList: any[]=[];
    geoJsonPointElementList: GeoJsonElement[]=[];//lista de puntos en geojson, con precisión
    
    geoJsonElementPoint: GeoJsonElement;
    geoJsonElementLineString: GeoJsonElement;
    geoJsonElementPolygon: GeoJsonElement;

    constructor(crs: number){
        this.geoJsonCRS=new GeoJsonCRS(crs);
    }
    
    addPoint (pt: any[], accuracy:number){

        if (accuracy >this.worstAccuracy){this.worstAccuracy = accuracy}

        this.pointsList.push(pt);
        var pg1 = new GeoJsonGeometry(this.gt.point,pt);
        var pge1 = new GeoJsonElement({"Precision":accuracy},pg1);
        this.geoJsonPointElementList.push(pge1);
        this.geoJsonElementPoint = pge1;
        this.addGeoJsonPointElementToDatabase();

        if (this.geoJsonPointElementList.length == 2){
            var lg1=new GeoJsonGeometry(this.gt.lineString,this.pointsList);
            this.geoJsonElementLineString = new GeoJsonElement({"Peor_precision":this.worstAccuracy},lg1);
        }
        if (this.geoJsonPointElementList.length > 2){
            var lg1=new GeoJsonGeometry(this.gt.polygon,this.pointsList);
            this.geoJsonElementPolygon = new GeoJsonElement({"Peor_precision":this.worstAccuracy},lg1);
        }
    }
    addGeoJsonPointElementToDatabase(){
        //añadir a la bbdd el punto añadido cada vez
        //this.geoJsonElementPoint

    }
    addGeoJsonPolygonElementToDatabase(){
        //añadir a la bbdd el último polígono
    }   

    getGeoJsonPointElementList(){
        return new GeoJsonFeatureCollection(this.geoJsonCRS,this.geoJsonPointElementList);
    }
    getGeoJsonElementLineString(){
        return new GeoJsonFeatureCollection(this.geoJsonCRS,[this.geoJsonElementLineString]);
    }
    getGeoJsonElementPolygon(){
        return new GeoJsonFeatureCollection(this.geoJsonCRS,[this.geoJsonElementPolygon]);
    }
}