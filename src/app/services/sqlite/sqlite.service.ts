/**Este servicio, NativeSQLiteService, funciona en android o ios, 
 * y el servicio web, WebSQLiteService, no funciona en web 
 * */

import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite'
import { MatSnackBar } from '@angular/material/snack-bar';

import { MessageService } from '../message.service';

import { Baunit } from 'src/app/models/baunit';

import { sendMessages } from 'src/app/utilities/manageMessages';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  public db!: SQLiteDBConnection;
  public messages:string[]=[];
  public isDbConexionOk = false;

  //listas de objetos de la base de datos
  //todo el contenido de la base de datos debe reflejarse
  //aquí para que se muestre en los componentes
  baunitList: Baunit[]= [];

  constructor(public messageService:MessageService, public snackBar:MatSnackBar){ 
  }
  async setAndOpenDb(sqLiteDBConnection:SQLiteDBConnection){
    this.db=sqLiteDBConnection;
    var r = await this.db.open()
    .then( (r) => { 
            this.isDbConexionOk=true;
            sendMessages('Conexion a la base de datos abierta',this.messageService, this.snackBar);
    })
    .catch( (err) => {
      sendMessages('Conexion a la base de datos abierta',this.messageService, this.snackBar);
    });
  }

  async createTables(){
    //const q = 'create table if not exists users (id integer primary key autoincrement, name text not null, active integer default 1);'
    // nombre, departamento, provincia, sector_predio,
    //         municipio, vereda, lc_prediotipo,tipo, complemento,
    //         numero_predial, numero_catastral, 
    //         longitud, latitud, enviado_servidor
    
    var baunit=`create table if not exists baunit (
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
      .then((r) =>{
        sendMessages('Tabla baunit creada',this.messageService, this.snackBar);
      })
      .catch((err) => {
        sendMessages(err.message,this.messageService,this.snackBar);
      });

  }

  async dropTables(){
    const q = 'drop table if exists baunit;'
    return await this.db.query(q);
  }

  async updateBaunitList(){
      const q='select * from baunit';
      await this.db.query('select * from baunit')
      .then( (r: any) => {
          if (r==undefined){
            this.baunitList=[]
          }else{
            if (r.values.length >= 0){
              this.baunitList=[];
              r.values.forEach( ( row: Baunit ) =>{
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
            }else{
              sendMessages('Baunits recuperadas: 0', this.messageService, this.snackBar);              
            } 
          }           
      })
      .catch( err => {
        sendMessages(err.message, this.messageService, this.snackBar);                    
      });
  }

  async addUser(username: string){
    const q='insert into users (name) values (?)';
    return await this.db.run(q,[username],true,'all')
  }

  async selectUser(username: string){
    const q='select * from users where name = ?';
    return await this.db.query(q,[username]);
  }
}


// CREATE TABLE track(
//   trackid     INTEGER, 
//   trackname   TEXT, 
//   trackartist INTEGER,
//   FOREIGN KEY(trackartist) REFERENCES artist(artistid)
// );