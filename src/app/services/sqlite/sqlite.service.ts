/**Este servicio, NativeSQLiteService, funciona en android o ios,
 * y el servicio web, WebSQLiteService, no funciona en web
 * */

import {Injectable} from '@angular/core';
import {SQLiteDBConnection} from '@capacitor-community/sqlite'
import {MatSnackBar} from '@angular/material/snack-bar';

import {MessageService} from '../message.service';

import {Baunit} from '../../models/baunit';

import {sendMessages} from '../../utilities/manageMessages';
import {Interesado} from "../../models/interesado";
import {UnidadEspacial} from "../../models/unidadEspacial";
import {CrPuntoLindero} from "../../models/crPuntoLindero";

@Injectable({
    providedIn: 'root'
})
export class SqliteService {
    public db!: SQLiteDBConnection;
    public messages: string[] = [];
    public isDbConexionOk = false;

    //listas de objetos de la base de datos
    //todo el contenido de la base de datos debe reflejarse
    //aquí para que se muestre en los componentes
    baunitList: Baunit[] = [];
    interesadoList: Interesado[] = [];
    unidadEspacialList: UnidadEspacial[] = [];
    crPuntoLinderoList: CrPuntoLindero[] = [];

    constructor(public messageService: MessageService, public snackBar: MatSnackBar) {
    }

    async setAndOpenDb(sqLiteDBConnection: SQLiteDBConnection) {
        this.db = sqLiteDBConnection;
        var r = await this.db.open()
            .then((r) => {
                this.isDbConexionOk = true;
                sendMessages('Conexion a la base de datos abierta', this.messageService, this.snackBar);
            })
            .catch((err) => {
                sendMessages('Conexion a la base de datos abierta', this.messageService, this.snackBar);
            });
    }

    async createTables() {
        //const q = 'create table if not exists users (id integer primary key autoincrement, name text not null, active integer default 1);'
        // nombre, departamento, provincia, sector_predio,
        //         municipio, vereda, lc_prediotipo,tipo, complemento,
        //         numero_predial, numero_catastral,
        //         longitud, latitud, enviado_servidor

        var baunit = `create table if not exists baunit (
      id integer primary key autoincrement,
      nombre text not null,
      departamento text not null,
      provincia text not null,
      sector_predio text not null,
      municipio text not null,
      vereda text not null,
      tipo text not null,
      complemento text not null,
      numero_predial text,
      numero_catastral text,
      longitud text,
      latitud text,
      enviado_servidor boolean default false);
      `
        await this.db.query(baunit)
            .then((r) => {
                sendMessages('Tabla baunit creada', this.messageService, this.snackBar);
            })
            .catch((err) => {
                sendMessages(err.message, this.messageService, this.snackBar);
            });

        var interesado = `CREATE TABLE IF NOT EXISTS interesado (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo_documento TEXT NOT NULL,
            documento_identidad TEXT NOT NULL,
            tipo TEXT NOT NULL,
            primer_nombre TEXT NOT NULL,
            primer_apellido TEXT NOT NULL,
            correo_electronico TEXT,
            sexo TEXT NOT NULL,
            departamento TEXT NOT NULL,
            provincia TEXT NOT NULL,
            municipio TEXT NOT NULL,
            porcentaje_propiedad REAL,
            segundo_nombre TEXT,
            segundo_apellido TEXT,
            grupo_etnico TEXT,
            telefono_1 TEXT,
            telefono_2 TEXT,
            notas TEXT,
            estado TEXT,
            autoriza_notificacion_correo BOOLEAN,
            autoriza_procesamiento_datos_personales BOOLEAN,
            baunit_id INTEGER,
            FOREIGN KEY(baunit_id) REFERENCES baunit(id) ON DELETE CASCADE
        );`;
        await this.db.query(interesado)
            .then(() => {
                sendMessages('Tabla interesado creada con clave ajena', this.messageService, this.snackBar);
            })
            .catch((err) => {
                sendMessages(err.message, this.messageService, this.snackBar);
            });

        var unidadEspacial = `CREATE TABLE IF NOT EXISTS unidad_espacial (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        baunit_id INTEGER,
        tipo TEXT CHECK(tipo IN ('gps', 'digitalizado', 'archivo_cargado')) NOT NULL DEFAULT 'gps',
        FOREIGN KEY(baunit_id) REFERENCES baunit(id) ON DELETE CASCADE
        );`;
        await this.db.query(unidadEspacial)
            .then(() => {
                sendMessages('Tabla unidad_espacial creada con éxito', this.messageService, this.snackBar);
            })
            .catch((err) => {
                sendMessages('Error al crear la tabla unidad_espacial: ' + err.message, this.messageService, this.snackBar);
            });

        var crPuntolindero = `CREATE TABLE IF NOT EXISTS cr_puntolindero (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        baunit_id INTEGER,
        unidad_espacial_id INTEGER,
        tipo TEXT CHECK(tipo = 'GPS') NOT NULL, 
        lon REAL,
        lat REAL,
        exactitud_horizontal REAL,
        descripcion TEXT,
        FOREIGN KEY(baunit_id) REFERENCES baunit(id) ON DELETE CASCADE,
        FOREIGN KEY(unidad_espacial_id) REFERENCES unidad_espacial(id) ON DELETE CASCADE
        );`;
        await this.db.query(crPuntolindero)
            .then(() => {
                sendMessages('Tabla cr_puntolindero creada con éxito', this.messageService, this.snackBar);
            })
            .catch((err) => {
                sendMessages('Error al crear la tabla cr_puntolindero: ' + err.message, this.messageService, this.snackBar);
            });
    }

    async dropTables() {
        /*const q = 'drop table if exists baunit;'
        return await this.db.query(q);*/

        await this.db.query('DROP TABLE IF EXISTS interesado;')
            .then(() => {
                sendMessages('Tabla interesado eliminada', this.messageService, this.snackBar);
            })
            .catch((err) => {
                sendMessages('Error al eliminar la tabla interesado: ' + err.message, this.messageService, this.snackBar);
            });


        return await this.db.query('DROP TABLE IF EXISTS baunit;')
            .then(() => {
                sendMessages('Tabla baunit eliminada', this.messageService, this.snackBar);
            })
            .catch((err) => {
                sendMessages('Error al eliminar la tabla baunit: ' + err.message, this.messageService, this.snackBar);
            });
    }

    async updateBaunitList() {
        //const q = 'select * from baunit';
        await this.db.query('select * from baunit')
            .then((r: any) => {
                if (r == undefined) {
                    this.baunitList = []
                } else {
                    if (r.values.length >= 0) {
                        this.baunitList = [];
                        r.values.forEach((row: Baunit) => {
                            var ba: Baunit = new Baunit(this, this.messageService)
                            //,row.nombre,row.departamento,
                            //row.provincia,row.sector_predio,row.municipio, row.vereda, row.tipo,
                            //row.complemento,row.numero_predial,row.numero_catastral, row.longitud,
                            //row.latitud,row.enviado_servidor,row.id
                            ba.setFromModel(row as Baunit);
                            this.baunitList.push(ba);
                        });
                        console.log('baunitlist', this.baunitList);
                        sendMessages('Baunits recuperadas: ' + this.baunitList.length.toString(), this.messageService, this.snackBar);
                        // console.log('Usuarios seleccionado',r.values);
                        // this.sqliteService.messages.push('Usuarios seleccionados');
                        // r.values.forEach( ( row: any ) =>{
                        //   console.log(row)
                        //   this.sqliteService.messages.push(row.name);
                    } else {
                        sendMessages('Baunits recuperadas: 0', this.messageService, this.snackBar);
                    }
                }
            })
            .catch(err => {
                sendMessages(err.message, this.messageService, this.snackBar);
            });
    }

    async updateInteresadosList() {
        await this.db.query('SELECT * FROM interesado')
            .then((r: any) => {
                if (r.values.length > 0) {

                    this.interesadoList = [];
                    r.values.forEach((row: Interesado) => {
                        var interesado = new Interesado(this, this.messageService);
                        interesado.setFromModel(row as Interesado);
                        this.interesadoList.push(interesado);
                    });
                    console.log('interesadosList', this.interesadoList);
                    sendMessages(`Interesados recuperados: ${this.interesadoList.length}`, this.messageService, this.snackBar);
                } else {
                    this.interesadoList = [];
                    sendMessages('No se encontraron interesados', this.messageService, this.snackBar);
                }
            })
            .catch((err) => {
                sendMessages(err.message, this.messageService, this.snackBar);
            });
    }

    async updateUnidadEspacialList() {
        await this.db.query('SELECT * FROM unidad_espacial')
            .then((r: any) => {
                if (r.values.length > 0) {
                    this.unidadEspacialList = [];
                    r.values.forEach((row: UnidadEspacial) => {
                        const unidadEspacial = new UnidadEspacial(this, this.messageService);
                        unidadEspacial.setFromModel(row as UnidadEspacial);
                        this.unidadEspacialList.push(unidadEspacial);
                    });
                    console.log('unidadEspacialList', this.unidadEspacialList);
                    sendMessages(`Unidades espaciales recuperadas: ${this.unidadEspacialList.length}`, this.messageService, this.snackBar);
                } else {
                    this.unidadEspacialList = [];
                    sendMessages('No se encontraron unidades espaciales', this.messageService, this.snackBar);
                }
            })
            .catch((err) => {
                sendMessages(`Error al recuperar unidades espaciales: ${err.message, this.messageService, this.snackBar}`, this.messageService, this.snackBar);
            });
    }

    async updateCrPuntoLinderoList() {
        await this.db.query('SELECT * FROM cr_puntolindero')
            .then((r: any) => {
                if (r.values.length > 0) {
                    this.crPuntoLinderoList = [];
                    r.values.forEach((row: CrPuntoLindero) => {
                        const crPuntoLindero = new CrPuntoLindero(this, this.messageService);
                        crPuntoLindero.setFromModel(row as CrPuntoLindero);
                        this.crPuntoLinderoList.push(crPuntoLindero);
                    });
                    console.log('CrPuntoLinderoList', this.crPuntoLinderoList)
                    sendMessages(`Puntos linderos recuperados: ${this.crPuntoLinderoList.length}`, this.messageService, this.snackBar);
                } else {
                    this.crPuntoLinderoList = [];
                    sendMessages('No se encontraron puntos linderos', this.messageService, this.snackBar);
                }
            })
            .catch((err) => {
                sendMessages(`Error al recuperar puntos linderos: ${err.message}`, this.messageService, this.snackBar);
            });
    }

    async deleteBaunit(baunitId: string | null) {
        try {
            const resultado = await this.db.query('SELECT * FROM baunit WHERE id = ?', [baunitId]);
            const baunitExistente = resultado.values;

            if (!baunitExistente || baunitExistente.length === 0) {
                throw new Error('El baunit con el ID especificado no existe.');
            }

            await this.db.run('DELETE FROM baunit WHERE id = ?', [baunitId]);


            await this.updateBaunitList();
            await this.updateInteresadosList();
            await this.updateUnidadEspacialList();
            await this.updateCrPuntoLinderoList();

            sendMessages(`Baunit con ID ${baunitId} y datos relacionados eliminados correctamente.`, this.messageService, this.snackBar);
        } catch (error:any) {
            console.error('Error al eliminar baunit y datos relacionados:', error);
            sendMessages(`Error al eliminar baunit y datos relacionados: ${error.message}`, this.messageService, this.snackBar);
        }
    }


    async marcarPredioComoEnviado(baunitId: string | null): Promise<void> {
        const resultado = await this.db.query('SELECT * FROM baunit WHERE id = ?', [baunitId]);
        const baunitExistente = resultado.values;
        console.log("el baunit es: ", baunitExistente);

        const query = `UPDATE baunit SET enviado_servidor = ? WHERE id = ?`;
        const values = [true, baunitId];
        console.log("se transforma: ", values)
        try {
            await this.db.run(query, values,undefined, 'one');
            await this.updateBaunitList();
            console.log(`Predio con ID ${baunitId} marcado como enviado.`);
        } catch (error) {
            console.error(`Error al marcar el predio con ID ${baunitId} como enviado:`, error);
        }
    }
    async addUser(username: string) {
        const q = 'insert into users (name) values (?)';
        return await this.db.run(q, [username], true, 'all')
    }

    async selectUser(username: string) {
        const q = 'select * from users where name = ?';
        return await this.db.query(q, [username]);
    }

    async getInteresadoPorDocumentoIdentidad(documentoIdentidad: string, baunitId: string): Promise<boolean> {
        try {
            const result = await this.db.query("SELECT * FROM interesado WHERE documento_identidad = ? AND baunit_id = ?", [documentoIdentidad, baunitId]);
            const values = result.values ?? [];
            return values.length > 0;
        } catch (error) {
            console.error('Error al buscar interesado por documento de identidad y baunit_id', error);
            throw error;
        }
    }



}


// CREATE TABLE track(
//   trackid     INTEGER, 
//   trackname   TEXT, 
//   trackartist INTEGER,
//   FOREIGN KEY(trackartist) REFERENCES artist(artistid)
// );