
import { AzimutDistance } from "../models/azimut-distance";
import { Point2d } from "../models/point2d";

export function calculateAzimutDistance(pt1:Point2d,pt2:Point2d):AzimutDistance{
    let ax=pt2.x-pt1.x;
    let ay=pt2.y-pt1.y;
    if (ax ==0 && ay==0){
        return new AzimutDistance(0,0);
    }
    if (ay==0){
        if (ax>0){
            return new AzimutDistance(100,ax);
        }else{
            return new AzimutDistance(300,Math.abs(ax));
        }
    }
    if (ax==0){
        if (ay>0){
            return new AzimutDistance(0,ay)
        }else{
            return new AzimutDistance(200,Math.abs(ay))
        }
    }
    var az=Math.abs(Math.atan(ax/ay)*200/Math.PI);
    var d=Math.sqrt(ax*ax+ay*ay)
    if (ax>0 && ay>0){return new AzimutDistance(az,d)}
    if (ax>0 && ay<0){return new AzimutDistance(200-Math.abs(az),d)}
    if (ax<0 && ay<0){return new AzimutDistance(200+az,d)}
    if (ax<0 && ay>0){return new AzimutDistance(400-az,d)}
    return new AzimutDistance(0,0);
}

export function radia2d(base:Point2d,azimutDistance:AzimutDistance):Point2d{
    var x = base.x + azimutDistance.distance * Math.sin(azimutDistance.azimut*Math.PI/200)
    var y = base.y + azimutDistance.distance * Math.cos(azimutDistance.azimut*Math.PI/200)
    return new Point2d(x,y);
}