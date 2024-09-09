import {Injectable} from '@angular/core';
import {Geolocation, Position} from '@capacitor/geolocation';

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {

    async getCurrentCoordinates(): Promise<Position> {
        const options = {
            timeout: 30000, // Tiempo de espera 30 segundos
            enableHighAccuracy: true, // Alta precisión
        };

        try {
            const position = await Geolocation.getCurrentPosition(options);
            return position;
        } catch (error) {
            throw error;
        }
    }

}