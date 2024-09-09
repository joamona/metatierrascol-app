import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';

/**
 * Mode 1. DFesarrollo
 * Mode 2. Producción upvusig
 */

export var appMode: number = 2;  

@Injectable({
  providedIn: 'root'
})
export class AppGlobalVarsService {
  public urlDjangoApi: string =''; // url para django
  public urlAppAngular: string =''; // para descargar la app. NO se usa
  public web_url:string=''; //url donde está la web metatierrascol.
  public showMessagesInConsole: boolean = false;
  public appMode = appMode;
  public appVersion = 2.5;
  
  constructor() { 
    console.log('Is devmode',isDevMode())
    // if (isDevMode()){
    //   this.appMode=1;
      
    // }else{
    //   this.appMode=2
    // }
    switch (appMode) {
      case 1: {
       this.urlDjangoApi="http://localhost:8000/";
        this.urlAppAngular="http://localhost:4200/";
        this.web_url="http://localhost:4200/";
        this.showMessagesInConsole=true;
        break;
      }
      case 2: {
        this.urlDjangoApi="https://metatierrascol.upvusig.car.upv.es/api/";
        this.urlAppAngular="https://metatierrascol.upvusig.car.upv.es/app/"
         this.web_url="https://metatierrascol.upvusig.car.upv.es/"
        this.showMessagesInConsole=false;
        break;
      }
    }
  }
}