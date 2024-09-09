import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
//import {HttpClient} from "@angular/common/http";
import { enableProdMode} from "@angular/core";

import { routes } from './app/app.routes';
import { environment } from './environments/environment';

//para sqlite
import { defineCustomElements as jeepSqlite} from 'jeep-sqlite/loader';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'

import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { AuthService } from './app/services/auth.service';
import { MessageService } from './app/services/message.service';
import { ServerService } from './app/services/server.service';
import { AppGlobalVarsService } from './app/services/app-global-vars.service';
import { NetStatusService } from './app/services/net-status.service';
import { WebSqliteService } from './app/services/sqlite/web-sqlite.service';
import { NativeSqliteService } from './app/services/sqlite/native-sqlite.service';
import { SqliteService } from './app/services/sqlite/sqlite.service';
import { appConfig } from './app/app.config';

jeepSqlite(window);
//fin

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig);

/**
 * 
 {
  providers: [
//    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
//    provideIonicAngular(),
    provideRouter(routes), provideAnimationsAsync(),
    //importProvidersFrom(HttpClientModule),
    NetStatusService,
    AppGlobalVarsService, ServerService,
    MessageService, AuthService, WebSqliteService, NativeSqliteService, 
    SqliteService, provideAnimationsAsync(), provideAnimationsAsync()
  ],
}
 * 
 */
