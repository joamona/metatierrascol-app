//angular
import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { RouterOutlet } from '@angular/router';

//ionic & capacitor
//import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';

//Servicios
import { WebSqliteService } from './services/sqlite/web-sqlite.service';
import { SqliteService } from './services/sqlite/sqlite.service';
import { NativeSqliteService } from './services/sqlite/native-sqlite.service';
import { AuthService } from './services/auth.service';
import { MessageService } from './services/message.service';


//componentes
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

// //models
// import { Baunit } from './models/baunit';
// import { SectorPredio } from './enumerations/sector-predio';
// import { LC_PredioTipo } from './enumerations/lc_predio-tipo';

// //funciones
// import { sendMessages } from './utilities/manageMessages';
// import { createDummyBaunit } from './models/baunit';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',  
  styleUrls: ['app.component.scss'],

  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit{
   public isWeb: boolean = false;
   public initPlugin: boolean = false;
   public databaseName = 'metatierrascol';
   public sqliteDBConnection!: SQLiteDBConnection;//la conexión a la base de datos

  constructor(public nativeSqliteService: NativeSqliteService, 
              public webSqliteService: WebSqliteService, 
              public sqliteService: SqliteService, 
              public platform: Platform, authService: AuthService,
              public messageService:MessageService) {

    /**
     * Si es nativo (android o ios, hay que usar la librería estándar).
     *    hay que usar native.sqlite.service.ts para obtener la conexión.
     *  
     * Si es web, hay que usar web.sqlite.service para obtener la conexión.
     */
    authService.cargarUrlyTokenDelAlmacen().then((value) => {
      authService.checkAuthorizationToken();//comprueba que el token es válido
          //y establece el usuario, el token y los grupos en authService.
          //el componente header hace uso de auth service para obtener estos datos
    });

    this.initSqliteService()

  }

  ngOnInit(): void {

  }

  async initSqliteService(){
    await this.setSqliteServiceDb();
    await this.sqliteService.createTables();
    await this.sqliteService.updateBaunitList();
    await this.sqliteService.updateInteresadosList();
    await this.sqliteService.updateUnidadEspacialList();
    await this.sqliteService.updateCrPuntoLinderoList();
    // var a:Baunit = createDummyBaunit(this.sqliteService, this.messageService);
    // await a.insert();
    // console.log(a.id)
    // var b: Baunit = createDummyBaunit(this.sqliteService,this.messageService)
    // await b.insert();
    // console.log(b.id)
    // b.latitud='5555'
    // b.enviado_servidor=true;
    // await b.update();
    // console.log('-------------')
    // var b2 = this.sqliteService.baunitList[1];
    // b2.longitud = '6666'
    // b2.complemento='complemento 2'
    // b2.departamento="departamento 2"
    // b2.enviado_servidor=true
    // b2.latitud='lat 2'
    // b2.longitud='lon2'
    // b2.municipio='mun2'
    // b2.nombre='nom2'
    // b2.numero_catastral='num_cat2'
    // b2.numero_predial='num_pred 2'
    // b2.provincia='prov'
    // b2.sector_predio=SectorPredio.Sur
    // b2.tipo=LC_PredioTipo.Privado
    // b2.vereda='ver2'
    // await b2.update();
    // await b2.delete();
    // await b2.setFromId(1);
    // console.log(b2);
  }

  async setSqliteServiceDb(){
    var native:boolean;
    var sistemaOperativo = Capacitor.getPlatform();
    if(sistemaOperativo === 'ios' || sistemaOperativo === 'android'){
      native = true;
    }else{
      native = false;
    }
    if (native){
      await this.initializeNativeDb();//solo funciona en nativo no en web
    }else{
      await this.initializeWebDb();
    }
  }

  //para native
  async initializeNativeDb(){
    this.sqliteDBConnection = await this.nativeSqliteService.initializeDb();
    SplashScreen.hide()//truco para que se quede atascado un poco
    await this.sqliteService.setAndOpenDb(this.sqliteDBConnection);
  }

  //para web
  async initializeWebDb() {
    await this.platform.ready();
    this.initPlugin = await this.webSqliteService.initializePlugin();
    if(this.webSqliteService.platform === "web") {
      this.isWeb = true;
    }

    await customElements.whenDefined('jeep-sqlite');
    const jeepSqliteEl = document.querySelector('jeep-sqlite');
    if(jeepSqliteEl != null) {
      this.webSqliteService.initWebStore();
      console.log(`>>>> isStoreOpen ${await jeepSqliteEl.isStoreOpen()}`);
      this.sqliteDBConnection = await this.webSqliteService.createConnection(this.databaseName,false,'no-encryption',1);
      await this.sqliteService.setAndOpenDb(this.sqliteDBConnection)
    } else {
      console.log('jeepSqliteEl es null');
    }
  }
}
    
    