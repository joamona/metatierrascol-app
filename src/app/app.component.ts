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
import { WebSQLiteService } from './services/sqlite/web-sqlite.service';
import { OperationsSQLiteService } from './services/sqlite/operations-sqlite.service';
import { NativeSQLiteService } from './services/sqlite/native-sqlite.service';
import { AuthService } from './services/auth.service';


//componentes
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
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

  constructor(public nativeSQLiteService: NativeSQLiteService, 
              public webSQLiteService: WebSQLiteService, 
              public operationsSQLiteService: OperationsSQLiteService, 
              public platform: Platform, authService: AuthService) {

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

    var native:boolean;
    var sistemaOperativo = Capacitor.getPlatform();
    if(sistemaOperativo === 'ios' || sistemaOperativo === 'android'){
      native = true;
    }else{
      native = false;
    }
    if (native){
      this.initializeNativeDb();//solo funciona en nativo no en web
    }else{
      this.initializeWebDb();
    }   
  }

  ngOnInit(): void {

  }

  //para native
  async initializeNativeDb(){
    this.sqliteDBConnection = await this.nativeSQLiteService.initializeDb();
    SplashScreen.hide()//truco para que se quede atascado un poco
    this.operationsSQLiteService.setDb(this.sqliteDBConnection)
    console.log('Conexión sqlite nativa creada')
    this.realizaConsultas();
  }

  //para web
  async initializeWebDb() {
    await this.platform.ready();
    this.initPlugin = await this.webSQLiteService.initializePlugin();
    if(this.webSQLiteService.platform === "web") {
      this.isWeb = true;
    }

    await customElements.whenDefined('jeep-sqlite');
    const jeepSqliteEl = document.querySelector('jeep-sqlite');
    if(jeepSqliteEl != null) {
      this.webSQLiteService.initWebStore();
      console.log(`>>>> isStoreOpen ${await jeepSqliteEl.isStoreOpen()}`);
      this.sqliteDBConnection = await this.webSQLiteService.createConnection(this.databaseName,false,'no-encryption',1);
      this.realizaConsultas();
    } else {
      console.log('jeepSqliteEl es null');
    }
  }

  async realizaConsultas(){
      await this.operationsSQLiteService.setDb(this.sqliteDBConnection)
      .then( 
        r =>{console.log('Conexión creada',r);
        this.operationsSQLiteService.messages.push('Conexión creada')
    })
      .catch( err => {console.log(err.message)});

    await this.operationsSQLiteService.createTables()        
      .then( 
        r =>{console.log('Tablas creadas',r)
        this.operationsSQLiteService.messages.push('Tablas creadas');
      })
      .catch( err => {console.log(err.message)});
    
    await this.operationsSQLiteService.addUser('joamona')
      .then( 
        r =>{console.log('Usuario añadido',r);
        this.operationsSQLiteService.messages.push('Usuario añadido')
    })
      .catch( err => {console.log(err.message)});

    await this.operationsSQLiteService.selectUser('joamona')
      .then( (r: any) => {
          if (r.values.length > 0){
            console.log('Usuarios seleccionado',r.values);
            this.operationsSQLiteService.messages.push('Usuarios seleccionados');
            r.values.forEach( ( row: any ) =>{
              console.log(row)
              this.operationsSQLiteService.messages.push(row.name);
            });
          }else{
            console.log('No hay usuarios')
          }            
        }
      )
      .catch( err => {console.log(err.message)});
  }
}

//'INSERT INTO users (name,country,age) VALUES (?,?,?)',['Ricardo','Portugal','24']


// SELECT * FROM Userdata WHERE (LATITUDE >= ? AND LATITUDE <= ?) 
// AND (LONGITUDE >= ? AND LONGITUDE <= ?)
// AND acos(sin(?) * sin(LATITUDE) + cos(?) * cos(LATITUDE) * 
// cos(LONGITUDE-(-?))) <=?
