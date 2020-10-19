import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite';
import { ExeltisDBDef, MEDICOS_TABLE_CREATE, 
  VISITAS_TABLE_CREATE, MEDICOSPRODUCTOS_TABLE_CREATE,
  MEDICOS_TABLE_DROP, VISITAS_TABLE_DROP, MEDICOSPRODUCTOS_TABLE_DROP, PRODUCTOS_TABLE_CREATE, PRODUCTOS_TABLE_DROP, PRODUCTOS_LINEA_TABLE_CREATE, PRODUCTOS_CATEGORIA_TABLE_CREATE, PRODUCTOS_LINEA_TABLE_DROP, PRODUCTOS_CATEGORIA_TABLE_DROP
} from '../../commons/ExeltisDBDef';

/*
  Generated class for the DatabaseServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DatabaseServiceProvider {

  db: SQLiteObject = null;

  constructor(public http: HttpClient) {
    console.log('Hello DatabaseServiceProvider name ' + ExeltisDBDef.DATABASE_NAME);
  }

  setDataBase(db: SQLiteObject){
    if (this.db === null) {
      this.db = db;
    }
  }

  createTables(){
    return this.db.executeSql(MEDICOS_TABLE_CREATE, [])
            .then(() => {
              console.log("Created table MEDICOS_TABLE_CREATE")
              this.db.executeSql(VISITAS_TABLE_CREATE, [])
                .then(() => {
                  console.log("Created table VISITAS_TABLE_CREATE")
                  this.db.executeSql(MEDICOSPRODUCTOS_TABLE_CREATE, [])
                    .then(() => {
                      console.log("Created table MEDICOSPRODUCTOS_TABLE_CREATE")
                      this.db.executeSql(PRODUCTOS_TABLE_CREATE, [])
                        .then(() => {
                          console.log("Created table PRODUCTOS_TABLE_CREATE")
                          this.db.executeSql(PRODUCTOS_LINEA_TABLE_CREATE, [])
                            .then(() => {
                              console.log("Created table PRODUCTOS_LINEA_TABLE_CREATE")
                              this.db.executeSql(PRODUCTOS_CATEGORIA_TABLE_CREATE, [])
                                .then(() => {
                                  console.log("Created table PRODUCTOS_CATEGORIA_TABLE_CREATE")
                                })
                                .catch(e => {
                                  console.log("ERROR Creating table PRODUCTOS_CATEGORIA_TABLE_CREATE... ");
                                  console.log(e);
                                });
                            })
                            .catch(e => {
                              console.log("ERROR Creating table PRODUCTOS_LINEA_TABLE_CREATE... ");
                              console.log(e);
                            });
                        })
                        .catch(e => {
                          console.log("ERROR Creating table PRODUCTOS_TABLE_CREATE... ");
                          console.log(e);
                        });
                    })
                    .catch(e => {
                      console.log("ERROR Creating table MEDICOSPRODUCTOS_TABLE_CREATE... ");
                      console.log(e);
                    });
                })
                .catch(e => {
                  console.log("ERROR Creating table VISITAS_TABLE_CREATE... ");
                  console.log(e);
                });
            })
            .catch(e => {
              console.log("ERROR Creating table MEDICOS_TABLE_CREATE... ");
              console.log(e);
            });
  }

  deleteTables(){
    return this.db.executeSql(MEDICOS_TABLE_DROP, [])
            .then(() => {
              console.log("Droped table MEDICOS_TABLE_DROP")
              this.db.executeSql(VISITAS_TABLE_DROP, [])
                .then(() => {
                  console.log("Droped table VISITAS_TABLE_DROP")
                  this.db.executeSql(MEDICOSPRODUCTOS_TABLE_DROP, [])
                    .then(() => {
                      console.log("Droped table MEDICOSPRODUCTOS_TABLE_DROP")
                      this.db.executeSql(PRODUCTOS_TABLE_DROP, [])
                        .then(() => {
                          console.log("Droped table PRODUCTOS_TABLE_DROP")
                          this.db.executeSql(PRODUCTOS_LINEA_TABLE_DROP, [])
                            .then(() => {
                              console.log("Droped table PRODUCTOS_LINEA_TABLE_DROP")
                              this.db.executeSql(PRODUCTOS_CATEGORIA_TABLE_DROP, [])
                                .then(() => {
                                  console.log("Droped table PRODUCTOS_CATEGORIA_TABLE_DROP")
                                })
                                .catch(e => {
                                  console.log("ERROR Dropping table PRODUCTOS_CATEGORIA_TABLE_DROP... ");
                                  console.log(e);
                                });
                            })
                            .catch(e => {
                              console.log("ERROR Dropping table PRODUCTOS_LINEA_TABLE_DROP... ");
                              console.log(e);
                            });
                        })
                        .catch(e => {
                          console.log("ERROR Dropping table PRODUCTOS_TABLE_DROP... ");
                          console.log(e);
                        });
                    })
                    .catch(e => {
                      console.log("ERROR Dropping table MEDICOSPRODUCTOS_TABLE_DROP... ");
                      console.log(e);
                    });
                })
                .catch(e => {
                  console.log("ERROR Dropping table VISITAS_TABLE_DROP... ");
                  console.log(e);
                });
            })
            .catch(e => {
              console.log("ERROR Dropping table MEDICOS_TABLE_DROP... ");
              console.log(e);
            });
  }

  getData(tableName: string, condition: string){

    if (condition!="")
        condition = " WHERE " + condition;
    else
        condition = "";

    // 1. Armamos un String con el query a ejecutar
    let sql: string = "SELECT * FROM " + tableName + condition;


    return this.db.executeSql(sql, [])
    .then(response => {

      // switch (tableName) {
      //   case "medicos":
      //     let medicos = [];
      //     for (let index = 0; index < response.rows.length; index++) {
      //       medicos.push( response.rows.item(index) );
      //     }
      //     return Promise.resolve( medicos );
          
      
      //   default:
      //     break;
      // }
      let datos = [];
      for (let index = 0; index < response.rows.length; index++) {
        datos.push( response.rows.item(index) );
      }
      return Promise.resolve( datos );
      
    })
    .catch(error => Promise.reject(error));
  }

  getCustomData(select: string, tableName: string, condition: string){

    if (select!="")
        select = select;
    else
        select = "*";

    if (condition!="")
        condition = " WHERE " + condition;
    else
        condition = "";

    // 1. Armamos un String con el query a ejecutar
    let sql: string = "SELECT " + select + " FROM " + tableName + condition;

    //console.log(sql);

    return this.db.executeSql(sql, [])
    .then(response => {
      let datos = [];
      for (let index = 0; index < response.rows.length; index++) {
        datos.push( response.rows.item(index) );
      }
      return Promise.resolve( datos );
      
    })
    .catch(error => Promise.reject(error));
  }

  insertMedico(medico: any){
    let sql = 'INSERT INTO '+ExeltisDBDef.MEDICOS.TABLE_NAME+
              ' ('+ExeltisDBDef.MEDICOS.medico_id+', '+
              ExeltisDBDef.MEDICOS.visitador_id+', '+
              'page, '+
              ExeltisDBDef.MEDICOS.nombre_medico+', '+
              ExeltisDBDef.MEDICOS.especialidad+')' +
              ' VALUES(?,?,?,?,?)';
              /*console.log("medico")
              console.log(medico)
              console.log(medico.medico_id, medico.visitador_id, medico.page,
                medico.nombre_medico, medico.especialidad);*/
    return this.db.executeSql(sql, [medico.medico_id, medico.visitador_id, medico.page,
                              medico.nombre_medico, medico.especialidad])
                              .then((resp) => {
                                console.log("inserted or ignored")
                                console.log(resp)
                              })
                              .catch(e => {
                                console.log("ERROR inserting row... ");
                                console.log(e);
                              });
  }

  insertAgendamiento(agendamiento: any){
    let sql = 'INSERT INTO visitas'+
              ' (medico_id, '+
              'visitador_id, '+
              'fecha, '+
              'agendada, terminada, id_servidor, tipo_visita_id )' +
              ' VALUES(?,?,?,?,?,?,?)';
    
    let values = [agendamiento.medico_id, agendamiento.visitador_id,
      agendamiento.fecha];
    
    let agendada = ((agendamiento.agendada==undefined)?1:agendamiento.agendada);
    let terminada = ((agendamiento.terminada==undefined)?0:agendamiento.terminada);
    let id = ((agendamiento.id==undefined)?((agendamiento.visita_id==undefined)?"":agendamiento.visita_id):agendamiento.id);

    values.push(agendada);
    values.push(terminada);
    values.push(id);
    values.push(agendamiento.tipo_visita_id);

    /*
    [agendamiento.medico_id, agendamiento.visitador_id,
                              agendamiento.fecha, 
                              ((agendamiento.agendada==undefined)?1:agendamiento.agendada), 
                              ((agendamiento.terminada==undefined)?0:agendamiento.terminada)
                              ((agendamiento.id==undefined)?"":agendamiento.id)]
                              */

    return new Promise((resolve, reject) => {
        this.db.executeSql(sql, values)
                              .then((resp) => {
                                console.log("inserted or ignored")
                                console.log(resp)
                                resolve(resp);
                              })
                              .catch(e => {
                                console.log("ERROR inserting visita row... ");
                                console.log(e);
                                reject(e);
                              });

                        });
  }

  insertVisita(visita: any){
    let sql = 'INSERT INTO visitas'+
              ' (medico_id, '+
              'visitador_id, '+
              'fecha, '+
              'fechainicio, tipo_visita_id, agendada )' +
              ' VALUES(?,?,?,?,?,?)';
    return new Promise((resolve, reject) => {
        this.db.executeSql(sql, [visita.medico_id, visita.visitador_id,
                              visita.fecha, visita.fechainicio, visita.tipo_visita_id,
                            visita.agendada])
                              .then((resp) => {
                                console.log("inserted or ignored")
                                console.log(resp)
                                resolve(resp);
                              })
                              .catch(e => {
                                console.log("ERROR inserting visita row... ");
                                console.log(e);
                                reject(e);
                              });

                        });
  }

  /**
   * Actualiza registros de la tabla visitas
   * @param campos string cadena de texto con los campos a actualizar de la siguiente forma 'title=val, completed=val, other=val'
   * @param camposcondicion string cadena de texto con la condición para actualizar registros específicos 'id=val, other=val'
   * @return Promise
   */
  updateVisita(campos: string, camposcondicion: string){

    //let sql = 'UPDATE visitas SET title=?, completed=? WHERE id=?';
   //this.db.executeSql(sql, [task.title, task.completed, task.id]);

   if (campos != "" && camposcondicion != "") {

    let sql = 'UPDATE visitas SET '+campos+' WHERE '+camposcondicion;
    console.log(sql);

    return new Promise((resolve, reject) => {
            this.db.executeSql(sql, [])
              .then((resp) => {
                console.log("updated or ignored")
                console.log(resp)
                resolve(resp);
              })
              .catch(e => {
                console.log("ERROR updating visita row... ");
                console.log(e);
                reject(e);
              });

          });
    
    }

  }

  /**
   * Actualiza la fecha de finalización de una visita, y cambia su estado a terminada
   * @param visita any objeto con los datos a actualizar
   * @return Promise
   */
  finalizarVisita(visita: any){

    let sql = '';
    let values = [];
    if (visita.id!=undefined) {
      if (visita.id!='') {//si entra aquí es porque viene de modo en linea
        //por tanto se debe usar el dato fecha inicio
        sql = 'UPDATE visitas SET fechafin=?, fechainicio=?, terminada=? WHERE id_servidor=?';
        visita.id_vis = visita.id;
        values = [visita.fechafin, visita.fechainicio, visita.terminada, visita.id_vis]
      }
    }else{
      sql = 'UPDATE visitas SET fechafin=?, terminada=? WHERE id_vis=?';
      values = [visita.fechafin, visita.terminada, visita.id_vis]
    }

    console.log(sql);

    return new Promise((resolve, reject) => {
      this.db.executeSql(sql, values)
        .then((resp) => {
          console.log("updated or ignored")
          console.log(resp)
          resolve(resp);
        })
        .catch(e => {
          console.log("ERROR updating visita row... ");
          console.log(e);
          reject(e);
        });

    });

  }

  insertMedicosProductos(medicoproducto: any){
    let sql = 'INSERT INTO medicosproductos'+
              ' (medico_id, '+
              'visitador_id, '+
              'tipo_visita_id, '+
              'tipo_visita_nombre, '+
              'id, '+
              'codigo, '+
              'color, '+
              'nombre, '+
              'url_documento, url_logo, orden_producto )' +
              ' VALUES(?,?,?,?,?,?,?,?,?,?,?)';
    return new Promise((resolve, reject) => {
        this.db.executeSql(sql, [medicoproducto.medico_id, medicoproducto.visitador_id,
                              medicoproducto.tipo_visita_id, medicoproducto.tipo_visita_nombre, 
                              medicoproducto.id, medicoproducto.codigo, medicoproducto.color,
                              medicoproducto.nombre, medicoproducto.url_documento,
                              medicoproducto.url_logo, medicoproducto.orden_producto])
                              .then((resp) => {
                                console.log("inserted or ignored")
                                console.log(resp)
                                resolve(resp);
                              })
                              .catch(e => {
                                console.log("ERROR inserting medicosproductos row... ");
                                console.log(e);
                                reject(e);
                              });

                        });
  }

  insertProductos(producto: any){
    let sql = 'INSERT INTO productos'+
              ' (id, '+
              'codigo, '+
              'color, '+
              'nombre, '+
              'page, '+
              'linea_id, '+
              'categoria_id, '+
              'url_documento, url_logo )' +
              ' VALUES(?,?,?,?,?,?,?,?,?)';

    if (producto.categorias.length>0) {
      console.log("hay categoria");

      let sql_ins_cat = 'INSERT INTO productos_categoria'+
              ' (producto_id, '+
              'categoria_id, '+
              'nombre )' +
              ' VALUES(?,?,?)';

      producto.categorias.forEach(categoria => {
        console.log("Aquiii categoria");
        console.log(categoria);
        this.db.executeSql(sql_ins_cat, [producto.id, categoria.id, categoria.nombre])
          .then((resp) => {
            console.log("inserted or ignored, productos_categoria")
            console.log(resp);
          })
          .catch(e => {
            console.log("ERROR inserting productos_categoria row... ");
            console.log(e);
          });
      });
    }
    
    if (producto.lineas.length>0) {
      console.log("hay lineas");

      let sql_ins_lineas = 'INSERT INTO productos_linea'+
              ' (producto_id, '+
              'linea_id, '+
              'nombre )' +
              ' VALUES(?,?,?)';

      producto.lineas.forEach(linea => {
        console.log("Aquiii linea");
        console.log(linea);
        this.db.executeSql(sql_ins_lineas, [producto.id, linea.id, linea.nombre])
          .then((resp) => {
            console.log("inserted or ignored, productos_linea")
            console.log(resp);
          })
          .catch(e => {
            console.log("ERROR inserting productos_linea row... ");
            console.log(e);
          });
      });
    }
      
    return new Promise((resolve, reject) => {
        this.db.executeSql(sql, [producto.id, producto.codigo, producto.color,
                              producto.nombre, producto.page, producto.linea_id,
                              producto.categoria_id,
                              producto.url_documento, producto.url_logo])
                              .then((resp) => {
                                console.log("inserted or ignored, producto")
                                console.log(resp)
                                resolve(resp);
                              })
                              .catch(e => {
                                console.log("ERROR inserting productos row... ");
                                console.log(e);
                                reject(e);
                              });

                        });
  }

}
