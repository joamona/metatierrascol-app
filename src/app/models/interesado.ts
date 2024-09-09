import {MessageService} from "../services/message.service";
import {SqliteService} from "../services/sqlite/sqlite.service";
import {sendMessages} from "../utilities/manageMessages";
import {CR_InteresadoTipo} from "../enumerations/cr_interesado-tipo";
import {CR_DocumentoTipo} from "../enumerations/cr_documento-tipo";
import {CR_SexoTipo} from "../enumerations/cr_sexo-tipo";
import {Grupo_Etnico} from "../enumerations/grupo_etnico";
import {Estado} from "../enumerations/estado";
import { departamentos } from '../interfaces/listas/listaDepartamentos';
import {municipios} from "../interfaces/listas/listaMunicipios";
export function createDummyInteresado(sqliteService: SqliteService, messageService: MessageService): Interesado {
    var interesado = new Interesado(sqliteService, messageService);
    interesado.documento_identidad = '12345678X';
    interesado.tipo_documento = CR_DocumentoTipo.Cedula_Ciudadania;
    interesado.primer_nombre = 'Nombre';
    interesado.primer_apellido = 'Apellido';
    interesado.correo_electronico = 'email@ejemplo.com';
    interesado.telefono_1 = '600123456';
    interesado.telefono_2 = '600654321';
    interesado.notas = 'Esto es una nota de prueba.';
    interesado.tipo = CR_InteresadoTipo.Persona_Natural
    interesado.sexo = CR_SexoTipo.Sin_Determinar
    interesado.autoriza_notificacion_correo = true;
    interesado.departamento = 'Antioquia';
    interesado.provincia = 'Norte';
    interesado.municipio = '5086';
    interesado.porcentaje_propiedad = 100;
    interesado.segundo_nombre = 'SegundoNombre';
    interesado.segundo_apellido = 'SegundoApellido';
    interesado.grupo_etnico = Grupo_Etnico.Indigena;
    interesado.estado = Estado.Casado;
    interesado.autoriza_procesamiento_datos_personales = true;
    return interesado;
}


export class Interesado {
    autoriza_procesamiento_datos_personales: boolean = false;
    tipo: CR_InteresadoTipo = CR_InteresadoTipo.Persona_Natural;
    tipo_documento: CR_DocumentoTipo = CR_DocumentoTipo.Cedula_Ciudadania;
    documento_identidad: string = '';
    primer_nombre: string = '';
    primer_apellido: string = '';
    sexo: CR_SexoTipo = CR_SexoTipo.Sin_Determinar;
    correo_electronico: string = '';
    autoriza_notificacion_correo: boolean = false;
    departamento: string = '';
    provincia: string = '';
    municipio: string = '';
    porcentaje_propiedad: number = 0;
    baunit_id: string = '';

    // Opcionales
    id: string = '';
    segundo_nombre: string = '';
    segundo_apellido: string = '';
    grupo_etnico: Grupo_Etnico = Grupo_Etnico.Ninguno;
    telefono_1: string = '';
    telefono_2: string = '';
    notas: string = '';
    estado: Estado = Estado.Soltero;

    constructor(public sqliteService: SqliteService, public messageService: MessageService) {}

    setFromModel(interesado: Interesado) {
        // Obligatorios
        this.autoriza_procesamiento_datos_personales = interesado.autoriza_procesamiento_datos_personales;
        this.tipo = interesado.tipo;
        this.tipo_documento = interesado.tipo_documento;
        this.documento_identidad = interesado.documento_identidad;
        this.primer_nombre = interesado.primer_nombre;
        this.primer_apellido = interesado.primer_apellido;
        this.sexo = interesado.sexo;
        this.correo_electronico = interesado.correo_electronico;
        this.autoriza_notificacion_correo = interesado.autoriza_notificacion_correo;
        this.departamento = interesado.departamento;
        this.provincia = interesado.provincia;
        this.municipio = interesado.municipio;
        this.porcentaje_propiedad = interesado.porcentaje_propiedad;
        this.baunit_id = interesado.baunit_id;

        // Opcionales
        this.id = interesado.id ?? '';
        this.segundo_nombre = interesado.segundo_nombre ?? '';
        this.segundo_apellido = interesado.segundo_apellido ?? '';
        this.grupo_etnico = interesado.grupo_etnico ?? undefined;
        this.telefono_1 = interesado.telefono_1 ?? '';
        this.telefono_2 = interesado.telefono_2 ?? '';
        this.notas = interesado.notas ?? '';
        this.estado = interesado.estado ?? undefined;
    }


    async setFromId(newId: string | number) {
        await this.sqliteService.db.query('SELECT * FROM interesado WHERE id = ?', [newId])
            .then((r: any) => {
                if (r.values.length > 0) {
                    const row = r.values[0];
                    // Obligatorios
                    this.autoriza_procesamiento_datos_personales = row.autoriza_procesamiento_datos_personales;
                    this.tipo = row.tipo;
                    this.tipo_documento = row.tipo_documento;
                    this.documento_identidad = row.documento_identidad;
                    this.primer_nombre = row.primer_nombre;
                    this.primer_apellido = row.primer_apellido;
                    this.sexo = row.sexo;
                    this.correo_electronico = row.correo_electronico;
                    this.autoriza_notificacion_correo = row.autoriza_notificacion_correo;
                    this.departamento = row.departamento;
                    this.provincia=row.provincia;
                    this.municipio = row.municipio;
                    this.porcentaje_propiedad = row.porcentaje_propiedad;
                    this.baunit_id = row.baunit_id;

                    // Opcionales
                    this.id = row.id;
                    this.segundo_nombre = row.segundo_nombre;
                    this.segundo_apellido = row.segundo_apellido;
                    this.grupo_etnico = row.grupo_etnico;
                    this.telefono_1 = row.telefono_1;
                    this.telefono_2 = row.telefono_2;
                    this.notas = row.notas;
                    this.estado = row.estado;

                    sendMessages(`Interesado id ${this.id} recuperado con éxito`, this.messageService, this.sqliteService.snackBar);
                } else {
                    sendMessages(`No hay interesados con id ${newId}`, this.messageService, this.sqliteService.snackBar);
                }
            })
            .catch((err) => {
                sendMessages(err.message, this.messageService, this.sqliteService.snackBar);
            });
    }


    asListOfValues() {
        return [
            this.baunit_id,
            this.tipo_documento, this.documento_identidad, this.tipo, this.primer_nombre, this.primer_apellido,
            this.correo_electronico, this.sexo, this.departamento, this.provincia, this.municipio, this.porcentaje_propiedad,
            this.segundo_nombre, this.segundo_apellido, this.grupo_etnico, this.telefono_1, this.telefono_2,
            this.notas, this.estado, this.autoriza_notificacion_correo,
            this.autoriza_procesamiento_datos_personales
        ];
    }

    /*async insert() {
        const q = `INSERT INTO interesado (
        baunit_id, tipo_documento, documento_identidad, tipo, primer_nombre, primer_apellido, 
        correo_electronico, sexo, departamento, provincia, municipio, porcentaje_propiedad, 
        segundo_nombre, segundo_apellido, grupo_etnico, telefono_1, telefono_2, 
        notas, estado, autoriza_notificacion_correo, 
        autoriza_procesamiento_datos_personales
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`;

        await this.sqliteService.db.run(q, this.asListOfValues(), undefined, 'one')
            .then((r: any) => {
                this.id = r.changes.values[0].id;
                sendMessages(`Interesado ${this.id} guardado`, this.messageService, this.sqliteService.snackBar);
            })
            .catch((err) => {
                sendMessages(err.message, this.messageService, this.sqliteService.snackBar);
            });
        await this.sqliteService.updateInteresadosList();
    }*/
    async insert() {
        const q = `INSERT INTO interesado (
        baunit_id, tipo_documento, documento_identidad, tipo, primer_nombre, primer_apellido, 
        correo_electronico, sexo, departamento, provincia, municipio, porcentaje_propiedad, 
        segundo_nombre, segundo_apellido, grupo_etnico, telefono_1, telefono_2, 
        notas, estado, autoriza_notificacion_correo, 
        autoriza_procesamiento_datos_personales
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await this.sqliteService.db.run(q, this.asListOfValues())
            .then( (r:any) => {
                this.id = r.changes.lastId.toString();
                sendMessages(`Interesado ${this.id} guardado`, this.messageService, this.sqliteService.snackBar);
                console.log(`Interesado ${this.id} guardado`)
            })
            .catch( (err) =>{
                sendMessages(err.message,this.messageService, this.sqliteService.snackBar)
            })
        await this.sqliteService.updateInteresadosList();
    }


    async update() {
        const q = `UPDATE interesado SET (
        baunit_id, tipo_documento, documento_identidad, tipo, primer_nombre, primer_apellido, 
        correo_electronico, sexo, departamento, provincia, municipio, porcentaje_propiedad, 
        segundo_nombre, segundo_apellido, grupo_etnico, telefono_1, telefono_2, 
        notas, estado, autoriza_notificacion_correo, 
        autoriza_procesamiento_datos_personales) = (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) WHERE id = ?`;
        const values = this.asListOfValues();
        values.push(this.id);
        await this.sqliteService.db.run(q, values, undefined, 'one')
            .then(() => {
                sendMessages(`Interesado ${this.id} actualizado`, this.messageService, this.sqliteService.snackBar);
            })
            .catch((err) => {
                sendMessages(err.message, this.messageService, this.sqliteService.snackBar);
            });
        await this.sqliteService.updateInteresadosList();
    }


    async delete() {
        const q = `DELETE FROM interesado WHERE id = ?`;
        await this.sqliteService.db.run(q, [this.id], undefined, 'one')
            .then(() => {
                sendMessages(`Interesado ${this.id} borrado`, this.messageService, this.sqliteService.snackBar);
            })
            .catch((err) => {
                sendMessages(err.message, this.messageService, this.sqliteService.snackBar);
            });
        await this.sqliteService.updateInteresadosList();
    }

}
