import {SqliteService} from "../services/sqlite/sqlite.service";
import {MessageService} from "../services/message.service";
import {sendMessages} from "../utilities/manageMessages";


export class CrPuntoLindero {
    id: string = '';
    baunit_id: string = '';
    unidad_espacial_id: string = '';
    tipo: string = '';
    //geom: string = '';
    lon: number = 0;
    lat: number = 0;
    exactitud_horizontal: number = 0;
    descripcion: string | null = '';

    constructor(public sqliteService: SqliteService, public messageService: MessageService) {}

    setFromModel(crPuntoLindero: CrPuntoLindero) {
        this.id = crPuntoLindero.id;
        this.baunit_id = crPuntoLindero.baunit_id;
        this.unidad_espacial_id = crPuntoLindero.unidad_espacial_id;
        this.tipo = crPuntoLindero.tipo;
        //this.geom = crPuntoLindero.geom;
        this.lon = crPuntoLindero.lon;
        this.lat = crPuntoLindero.lat;
        this.exactitud_horizontal = crPuntoLindero.exactitud_horizontal;
        this.descripcion = crPuntoLindero.descripcion;
    }

    async setFromId(newId: string) {
        await this.sqliteService.db.query('SELECT * FROM cr_puntolindero WHERE id = ?', [newId])
            .then((r: any) => {
                if (r.values.length > 0) {
                    const row = r.values[0];
                    this.setFromModel(row);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    asListOfValues() {
        return [this.baunit_id, this.unidad_espacial_id, this.tipo, this.lon, this.lat, this.exactitud_horizontal, this.descripcion];
    }

    async insert() {
        const q = `INSERT INTO cr_puntolindero (baunit_id, unidad_espacial_id, tipo, lon, lat, exactitud_horizontal, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await this.sqliteService.db.run(q, this.asListOfValues())
            .then((r: any) => {
                this.id = r.changes.lastId.toString();
                sendMessages(`Punto lindero ${this.id} guardado`, this.messageService, this.sqliteService.snackBar);
                console.log(`Punto lindero  ${this.id} guardado`);
            })
            .catch((err) => {
                sendMessages(err.message, this.messageService, this.sqliteService.snackBar);
                console.error(err);
            });
        await this.sqliteService.updateCrPuntoLinderoList();

    }

    async update() {
        const q = `UPDATE cr_puntolindero SET 
        baunit_id = ?, 
        unidad_espacial_id = ?, 
        tipo = ?,  
        lon = ?, 
        lat = ?, 
        exactitud_horizontal = ?,
        descripcion = ? 
        WHERE id = ?`;

        const values = this.asListOfValues();
        values.push(this.id);
        await this.sqliteService.db.run(q, values)
            .then(() => {
                console.log(`CrPuntoLindero ${this.id} actualizado`);
            })
            .catch((err: any) => {
                console.error('Error al actualizar CrPuntoLindero:', err);
            });
        await this.sqliteService.updateCrPuntoLinderoList();

    }

    async delete() {
        const q = `DELETE FROM cr_puntolindero WHERE id = ?`;
        await this.sqliteService.db.run(q, [this.id])
            .then(() => {
                console.log(`CrPuntoLindero ${this.id} eliminado`);
            })
            .catch((err: any) => {
                console.error('Error al eliminar CrPuntoLindero:', err);
            });
        await this.sqliteService.updateCrPuntoLinderoList();

    }

}
