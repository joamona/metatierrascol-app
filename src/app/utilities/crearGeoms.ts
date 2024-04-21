import { GeoJsonCRS, GeoJsonElement,GeoJsonGeometry,GeoJsonFeatureCollection, GeometryType } from "./createGeoJson";
//First create the coordinate reference system (crs)
    
export class GenerateOlGeoms{
    worstAccuracy = -1;
    geoJsonCRS: GeoJsonCRS
    public gt: GeometryType = new GeometryType();
    pointsList: any[]=[];
    geoJsonPointElementList: GeoJsonElement[]=[];

    geoJsonElementPoint: GeoJsonElement = new GeoJsonElement({'default':0},new GeoJsonGeometry(this.gt.point,[0,0]));
    geoJsonElementLineString: GeoJsonElement = new GeoJsonElement({'default':0},new GeoJsonGeometry(this.gt.lineString,[[0,0],[1,1]]));
    geoJsonElementPolygon: GeoJsonElement = new GeoJsonElement({'default':0},new GeoJsonGeometry(this.gt.polygon,[[[0,0],[1,1],[0,1],[0,0]]]));

    constructor(crs: number){
        this.geoJsonCRS=new GeoJsonCRS(crs);
    }
    
    addPoint (pt: any[], accuracy:number){

        if (accuracy >this.worstAccuracy){this.worstAccuracy = accuracy}

        this.pointsList.push(pt);
        console.log("lista de puntos: ", this.pointsList);
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
            var lg1=new GeoJsonGeometry(this.gt.polygon,[this.pointsList]);
            this.geoJsonElementPolygon = new GeoJsonElement({"Peor_precision":this.worstAccuracy},lg1);
        }
    }

    deletePoint() {
        if (this.pointsList.length === 0) {
            console.warn("No hay puntos para eliminar.");
            return;
        }

        this.pointsList.pop();
        this.geoJsonPointElementList.pop();


        if (this.pointsList.length > 0) {
            this.worstAccuracy = Math.max(...this.geoJsonPointElementList.map(element => (element.properties as any).Precision));
        } else {
            this.worstAccuracy = -1;
        }


        if (this.pointsList.length >= 2) {
            var lg1 = new GeoJsonGeometry(this.gt.lineString, this.pointsList);
            this.geoJsonElementLineString = new GeoJsonElement({"Peor_precision": this.worstAccuracy}, lg1);
        }

        if (this.pointsList.length > 2) {
            var pg1 = new GeoJsonGeometry(this.gt.polygon, [this.pointsList]);
            this.geoJsonElementPolygon = new GeoJsonElement({"Peor_precision": this.worstAccuracy}, pg1);
        }
    }
    addGeoJsonPointElementToDatabase(){
        //añadir a la bbdd el punto añadido cada vez
        //this.geoJsonElementPoint

    }
    addGeoJsonPolygonElementToDatabase(){
        //añadir a la bbdd el último polígono
    }   

    public getGeoJsonFeatureCollectionPoint(){
        return new GeoJsonFeatureCollection(this.geoJsonCRS,this.geoJsonPointElementList);
    }
    public getGeoJsonFeatureCollectionLineString(){
        return new GeoJsonFeatureCollection(this.geoJsonCRS,[this.geoJsonElementLineString]);
    }
    public getGeoJsonFeatureCollectionPolygon(){
        return new GeoJsonFeatureCollection(this.geoJsonCRS,[this.geoJsonElementPolygon]);
    }

    getFeatureCollectionToDraw(){
        if (this.pointsList.length === 0) {
            return null;
        }
        if (this.pointsList.length === 1) {
            return this.getGeoJsonFeatureCollectionPoint();
        }
        if (this.pointsList.length === 2) {
            return this.getGeoJsonFeatureCollectionLineString();
        }
        return this.getGeoJsonFeatureCollectionPolygon();
    }
}