import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';

export var appMode: number = 1;

@Injectable({
  providedIn: 'root'
})
export class AppGlobalVarsService {
  public urlDjangoApi: string =''; // url para django
  public urlAppAngular: string =''; // url para navegar dentro de la aplicación de angular
  public showMessagesInConsole: boolean = false;
  public appMode = appMode;
  public appVersion = 1;
  
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
        this.urlAppAngular="http://localhost:4200";
        this.showMessagesInConsole=true;
        break;
      }
      case 2: {
        this.urlDjangoApi="https://metatierrascol.upvusig.car.upv.es/api/";
        this.urlAppAngular="https://metatierrascol.upvusig.car.upv.es/app/"
        this.showMessagesInConsole=false;
        break;
      }
    }
  }
}