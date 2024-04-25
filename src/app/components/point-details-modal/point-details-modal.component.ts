import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CrPuntoLindero} from "../../models/crPuntoLindero";
import {SqliteService} from "../../services/sqlite/sqlite.service";
import {MatButton} from "@angular/material/button";
import {UnidadEspacial} from "../../models/unidadEspacial";
import {ActivatedRoute, Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-point-details-modal',
  templateUrl: './point-details-modal.component.html',
  styleUrls: ['./point-details-modal.component.scss'],
  imports: [
    MatButton,
    FormsModule,
    NgIf
  ],
  standalone: true
})
export class PointDetailsModalComponent  implements OnInit {

  constructor(
      public sqliteService: SqliteService,
      public route: ActivatedRoute,
      public dialogRef: MatDialogRef<PointDetailsModalComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { points: CrPuntoLindero[], deletePoint: (id: string) => void }
  ) {}

  ngOnInit(): void {
    console.log("la lista de puntos es: ", this.data.points)
  }

  updateDescription(point: CrPuntoLindero): void {
    point.update().then(() => {
      console.log('Descripción actualizada:', point.descripcion);
    }).catch(err => {
      console.error('Error al actualizar la descripción:', err);
    });
  }


  onDeletePoint(pointId: string): void {
    this.data.deletePoint(pointId);
    this.dialogRef.close({ deleted: true, pointId: pointId });
  }


}
