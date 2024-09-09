import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './services/auth.service';
import { MessageService } from './services/message.service';
import { ServerService } from './services/server.service';
import { AppGlobalVarsService } from './services/app-global-vars.service';
import { NetStatusService } from './services/net-status.service';
import { WebSqliteService } from './services/sqlite/web-sqlite.service';
import { NativeSqliteService } from './services/sqlite/native-sqlite.service';
import { SqliteService } from './services/sqlite/sqlite.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), 
    provideHttpClient(),
    provideAnimationsAsync(),
    
    NetStatusService,
    AppGlobalVarsService, ServerService,
    MessageService, AuthService, WebSqliteService, NativeSqliteService, 
    SqliteService
  ]
};
