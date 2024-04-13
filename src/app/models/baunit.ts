import { LC_PredioTipo } from "../enumerations/lc_predio-tipo";
import { SectorPredio } from "../enumerations/sector-predio";
import { MessageService } from "../services/message.service";
import { SqliteService } from "../services/sqlite/sqlite.service";
import { sendMessages } from "../utilities/manageMessages";


export function createDummyBaunit(sqliteService: SqliteService, messageService: MessageService):Baunit{
    /**Recibe un id, crea un baunit con valores falsos, y recupera los valores de la 
     * bbdd actualizando los valores del objeto
    */
    // var baunit = new Baunit(sqliteService,messageService,'nombre','departamento','provincia',SectorPredio.Este,'municipio',
    //     'vereda',LC_PredioTipo.Baldio,'complemento','numero_predial','numero_catastral',
    //     'longitud','latitud',false,id);

    var baunit = new Baunit(sqliteService, messageService);
    baunit.nombre = 'Dummy nombre';
    baunit.tipo = LC_PredioTipo.Baldio;
    baunit.departamento = 'Antioquia';
    baunit.provincia = 'Norte';
    baunit.municipio = '5086';
    baunit.sector_predio = SectorPredio.Este;
    baunit.vereda = 'Dummy vereda';
    baunit.complemento = 'Dummy complemento';

    //opcionales. Se inicializan a '', si es undefined;
    baunit.numero_predial = 'Dummy número predial';
    baunit.numero_catastral = 'Dummy número catastral';
    baunit.longitud = 'Dummy longitud';;
    baunit.latitud = 'Dummy latitud';;
    baunit.enviado_servidor = false;
    return baunit;
}

export class Baunit {
    //obligatorios
    nombre: string = '';
    tipo: LC_PredioTipo = LC_PredioTipo.Baldio;
    departamento: string = '';
    provincia: string = '';
    municipio: string = '';
    sector_predio: SectorPredio = SectorPredio.Este;
    vereda: string = '';
    complemento: string = '';

    //opcionales. Se inicializan a '', si es undefined;
    numero_predial: string = '';
    numero_catastral: string = '';
    longitud: string = '';
    latitud: string = '';
    enviado_servidor: boolean = false;
    id: string = '';//el id de sqlite

    // constructor(public sqliteService: SqliteService, public messageService: MessageService, nombre: string, departamento:string, 
    //             provincia:string, sector_predio:SectorPredio,
    //             municipio:string, vereda:string, 
    //             tipo:LC_PredioTipo, complemento:string,

    //             numero_predial?:string, 
    //             numero_catastral?:string,
    //             longitud?:string, latitud?:string,
    //             enviado_servidor?:boolean, id?:string) {
    constructor(public sqliteService: SqliteService, public messageService: MessageService){
    }

    setFromModel(baunit: Baunit){
        //obligatorios
        this.nombre = baunit.nombre;
        this.tipo = baunit.tipo;
        this.departamento = baunit.departamento;
        this.provincia = baunit.provincia;
        this.municipio = baunit.municipio;
        this.sector_predio = baunit.sector_predio;
        this.vereda = baunit.vereda;
        this.complemento=baunit.complemento;
        
        //opcionales
        this.numero_predial = baunit.numero_predial ?? '';
        this.numero_catastral = baunit.numero_catastral ?? '';
        this.longitud = baunit.longitud ?? '';
        this.latitud = baunit.latitud ?? '';
        this.enviado_servidor = baunit.enviado_servidor ?? false;
        this.id = baunit.id ?? '';
    }

    async setFromId(newId: string | number){
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
                    this.tipo=row.tipo
                    this.departamento=row.departamento
                    this.provincia=row.provincia
                    this.municipio=row.municipio
                    this.sector_predio=row.sector_predio
                    this.vereda=row.vereda
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

    asListOfValues():any[]{
        return [this.nombre,this.tipo,this.departamento, this.provincia, this.municipio,this.sector_predio,
             this.vereda, this.complemento,
            this.numero_predial, this.numero_catastral, 
            this.longitud, this.latitud,
            this.enviado_servidor]
    }
    /*async insert(){
        var q=`insert into baunit (
            nombre, tipo, departamento, provincia,
            municipio, sector_predio, vereda, complemento,
            numero_predial, numero_catastral, 
            longitud, latitud, enviado_servidor
        ) values (?,?,?,?,?,?,?,?,?,?,?,?,?) returning id`;
        await this.sqliteService.db.run(q, this.asListOfValues(),undefined,'one')
        .then( (r:any) => {
            this.id =r.changes.values[0].id;
            sendMessages('Predio ' + this.id.toString() + ' guardado',
                this.messageService, this.sqliteService.snackBar);
        })
        .catch( (err) =>{
            sendMessages(err.message,this.messageService, this.sqliteService.snackBar)
        })
        await this.sqliteService.updateBaunitList();
    }*/
    async insert(){
        var q=`insert into baunit (
            nombre, tipo, departamento, provincia,
            municipio, sector_predio, vereda, complemento,
            numero_predial, numero_catastral, 
            longitud, latitud, enviado_servidor
        ) values (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        await this.sqliteService.db.run(q, this.asListOfValues())
            .then( (r:any) => {
                this.id = r.changes.lastId.toString();
                sendMessages(`Predio ${this.id} guardado`, this.messageService, this.sqliteService.snackBar);
                console.log(`Predio ${this.id} guardado`)
            })
            .catch( (err) =>{
                sendMessages(err.message,this.messageService, this.sqliteService.snackBar)
            })
        await this.sqliteService.updateBaunitList();
    }
    async update(){
        var q=`update baunit set (
            nombre, tipo, departamento, provincia, 
            municipio, sector_predio, vereda, complemento,
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
  }