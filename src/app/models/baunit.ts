import { LC_PredioTipo } from "../enumerations/lc_predio-tipo";
import { SectorPredio } from "../enumerations/sector-predio";
import { MessageService } from "../services/message.service";
import { SqliteService } from "../services/sqlite/sqlite.service";
import { sendMessages } from "../utilities/manageMessages";


export function createDummybaunitFromId(sqliteService: SqliteService, messageService: MessageService):Baunit{
    /**Recibe un id, crea un baunit con valores falsos
    */
    var baunit = new Baunit(sqliteService,messageService,'nombre','departamento','provincia',SectorPredio.Este,'municipio',
        'vereda',LC_PredioTipo.Baldio,'complemento','numero_predial','numero_catastral',
        'longitud','latitud',false,'-1');
    return baunit;
}

export class Baunit {
    //obligatorios
    nombre: string;
    departamento: string ;
    provincia: string;
    sector_predio: SectorPredio;
    municipio: string;
    vereda: string;
    tipo: LC_PredioTipo;
    complemento: string;

    //opcionales. Se inicializan a '', si es undefined;
    numero_predial: string;
    numero_catastral: string;
    longitud: string;
    latitud: string;
    enviado_servidor: boolean = false;
    id: string;//el id de sqlite
    
    constructor(public sqliteService: SqliteService, public messageService: MessageService, nombre: string, departamento:string, 
                provincia:string, sector_predio:SectorPredio,
                municipio:string, vereda:string, 
                tipo:LC_PredioTipo, complemento:string,

                numero_predial?:string, 
                numero_catastral?:string,
                longitud?:string, latitud?:string,
                enviado_servidor?:boolean, id?:string) {
    
    //obligatorios

    this.nombre = nombre;
    this.departamento = departamento;
    this.provincia = provincia;
    this.sector_predio = sector_predio;
    this.municipio = municipio;
    this.vereda = vereda;
    this.tipo = tipo;
    this.complemento=complemento;
    
    //opcionales
    this.numero_predial = numero_predial ?? '';
    this.numero_catastral = numero_catastral ?? '';
    this.longitud = longitud ?? '';
    this.latitud = latitud ?? '';
    this.enviado_servidor = enviado_servidor ?? false;
    this.id = id ?? '';
    }
    asListOfValues():any[]{
        return [this.nombre,this.departamento, this.provincia, this.sector_predio,
            this.municipio, this.vereda, this.tipo, this.complemento,
            this.numero_predial, this.numero_catastral, 
            this.longitud, this.latitud,
            this.enviado_servidor]
    }
    async insert(){
        var q=`insert into baunit (
            nombre, departamento, provincia, sector_predio,
            municipio, vereda, tipo, complemento,
            numero_predial, numero_catastral, 
            longitud, latitud, enviado_servidor
        ) values (?,?,?,?,?,?,?,?,?,?,?,?,?) returning id`;
        await this.sqliteService.db.run(q, this.asListOfValues(),undefined,'one')
        .then( (r:any) => {
            this.id =r.changes.values[0].id;
            sendMessages('Predio ' + r.changes.values[0].id.toString() + ' guardado',
                this.messageService, this.sqliteService.snackBar);
        })
        .catch( (err) =>{
            sendMessages(err.message,this.messageService, this.sqliteService.snackBar)
        })
        await this.sqliteService.updateBaunitList();
    }
    async update(){
        var q=`update baunit set (
            nombre, departamento, provincia, sector_predio,
            municipio, vereda, tipo, complemento,
            numero_predial, numero_catastral, 
            longitud, latitud, enviado_servidor
        ) = (?,?,?,?,?,?,?,?,?,?,?,?,?) where id = ?`;
        var v = this.asListOfValues();
        v.push(this.id);//añado el valor de la condición where
        await this.sqliteService.db.run(q, v,undefined,'one')
        .then( (r:any) => {
            sendMessages('Predio ' + this.id + ' actualizado',this.messageService, this.sqliteService.snackBar);
        })
        .catch( (err) =>{
            sendMessages(err.message,this.messageService, this.sqliteService.snackBar)
        })
        await this.sqliteService.updateBaunitList();

    }
    async delete(){
        var q=`delete from baunit where id = ?`;
        await this.sqliteService.db.run(q, [this.id],undefined,'one')
        .then( (r:any) => {
            console.log(r);
            sendMessages('Predio ' + r.changes.lastId.toString() + ' borrado. Num predios borrados: ' + r.changes.changes.toString(),
                this.messageService, this.sqliteService.snackBar);
        })
        .catch( (err) =>{
            sendMessages(err.message,this.messageService, this.sqliteService.snackBar);
        })
        await this.sqliteService.updateBaunitList();
    }
    async setDataFromId(newId: string | number){
        await this.sqliteService.db.query('select * from baunit where id = ?', [newId])
        .then( (r: any) => {
            if (r==undefined){
                sendMessages('Undefined. No hay predios con id ' + this.id,this.messageService, this.sqliteService.snackBar)
            }else{
                if (r.values.length ==0){ 
                    sendMessages('No hay predios con id ' + this.id,this.messageService, this.sqliteService.snackBar)
                }else{
                    var row: Baunit = r.values[0];
                    this.nombre=row.nombre
                    this.departamento=row.departamento
                    this.provincia=row.provincia
                    this.sector_predio=row.sector_predio
                    this.municipio=row.municipio
                    this.vereda=row.vereda
                    this.tipo=row.tipo
                    this.complemento=row.complemento
                    this.numero_predial=row.numero_predial
                    this.numero_catastral=row.numero_catastral
                    this.longitud=row.longitud
                    this.latitud=row.latitud
                    this.enviado_servidor=row.enviado_servidor
                    this.id = row.id
                    sendMessages('Predio id ' + this.id + ' recuperado con éxito',
                        this.messageService, this.sqliteService.snackBar)

                }
            }
        })
        .catch((err)=>{
            sendMessages(err.message,this.messageService, this.sqliteService.snackBar);
        });    
    }

  }