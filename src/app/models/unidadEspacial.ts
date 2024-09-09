import { MessageService } from "../services/message.service";
import { SqliteService } from "../services/sqlite/sqlite.service";
import { sendMessages } from "../utilities/manageMessages";
export class UnidadEspacial {
    id: string = '';
    baunit_id: string = '';
    tipo: string = 'gps';
    //geom: string = '';

    constructor(public sqliteService: SqliteService, public messageService: MessageService) {}

    setFromModel(unidadEspacial: UnidadEspacial) {
        this.id = unidadEspacial.id;
        this.baunit_id = unidadEspacial.baunit_id;
        this.tipo = unidadEspacial.tipo;
        //this.geom = unidadEspacial.geom;
    }

    async setFromId(newId: string) {
        await this.sqliteService.db.query('SELECT * FROM unidad_espacial WHERE id = ?', [newId])
            .then((r: any) => {
                if (r.values.length > 0) {
                    const row = r.values[0];
                    this.id = row.id;
                    this.baunit_id = row.baunit_id;
                    this.tipo = row.tipo;
                    //this.geom = row.geom;
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    asListOfValues() {
        return [this.baunit_id, this.tipo];
    }

    /*async insert() {
        const q = `INSERT INTO unidad_espacial (baunit_id, tipo) VALUES (?, ?) returning id`;
        await this.sqliteService.db.run(q, this.asListOfValues(),undefined,'one')
            .then((r: any) => {
                this.id = r.changes.values[0].id;
                sendMessages(`Unidad espacial ${this.id} guardado`, this.messageService, this.sqliteService.snackBar);
            })
            .catch((err) => {
                sendMessages(err.message, this.messageService, this.sqliteService.snackBar);
                console.error(err);
            });
        await this.sqliteService.updateUnidadEspacialList();
    }*/

    async insert() {
        const q = `INSERT INTO unidad_espacial (baunit_id, tipo) VALUES (?, ?)`;
        await this.sqliteService.db.run(q, this.asListOfValues())
            .then((r: any) => {
                this.id = r.changes.lastId.toString();
                sendMessages(`Unidad espacial ${this.id} guardado`, this.messageService, this.sqliteService.snackBar);
                console.log(`Unidad espacial ${this.id} guardado`);
            })
            .catch((err) => {
                sendMessages(err.message, this.messageService, this.sqliteService.snackBar);
                console.error(err);
            });
        await this.sqliteService.updateUnidadEspacialList();
    }


    async update() {
        const q = `UPDATE unidad_espacial SET (baunit_id, tipo) = (?,?) WHERE id = ?`;
        const values = this.asListOfValues();
        values.push(this.id);
        await this.sqliteService.db.run(q, values,undefined,'one')
            .then(() => {
                console.log(`UnidadEspacial ${this.id} actualizada`);
            })
            .catch((err) => {
                console.error(err);
            });
        await this.sqliteService.updateUnidadEspacialList();

    }

    async delete() {
        const q = `DELETE FROM unidad_espacial WHERE id = ?`;
        await this.sqliteService.db.run(q, [this.id],undefined,'one')
            .then((r:any) => {
                console.log(`UnidadEspacial ${this.id} eliminada`);
            })
            .catch((err) => {
                console.error(err);
            });
        await this.sqliteService.updateUnidadEspacialList();

    }



}
