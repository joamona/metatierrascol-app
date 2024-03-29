import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { NativeSQLiteService } from '../services/sqlite/native-sqlite.service';
import { WebSQLiteService } from '../services/sqlite/web-sqlite.service';
import { OperationsSQLiteService } from '../services/sqlite/operations-sqlite.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule],
})
export class HomePage {
  constructor(public nativeSqlLiteService: NativeSQLiteService,
    public webSqlLiteService: WebSQLiteService, public operationsSQLiteService: OperationsSQLiteService) {}
}
