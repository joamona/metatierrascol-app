import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {SqliteService} from "./sqlite/sqlite.service";
import {MessageService} from "./message.service";
import {CrPuntoLindero} from "../models/crPuntoLindero";

@Injectable({
  providedIn: 'root'
})
export class PointService {
  private deletePointSubject = new Subject<string>();

  deletePointObservable = this.deletePointSubject.asObservable();

  constructor(private sqliteService: SqliteService, private messageService: MessageService) {}

  async deletePoint(pointId: string) {
    const punto = new CrPuntoLindero(this.sqliteService, this.messageService);
    punto.id = pointId;
    await punto.delete();
    this.deletePointSubject.next(pointId); // Notificar que el punto ha sido eliminado
  }
}
