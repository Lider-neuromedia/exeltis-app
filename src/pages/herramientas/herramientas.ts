import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ApiProvider } from '../../providers/api/api';
import { DatabaseServiceProvider } from '../../providers/database-service/database-service';
import { pad, inArray } from '../../commons/Utils';
import { HttpClient } from '@angular/common/http';
import { NetworkProvider } from '../../providers/network/network';


@IonicPage()
@Component({
  selector: 'page-herramientas',
  templateUrl: 'herramientas.html',
})
export class HerramientasPage {

  offline: boolean = false;
  isenabled: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public storage: Storage, public loadingCtrl: LoadingController,
    public api: ApiProvider, public databaseProvider: DatabaseServiceProvider,
    public http: HttpClient, public alertCtrl: AlertController,
    public networkProvider: NetworkProvider) {

    this.storage.get('offline').then(dataOff => {
      this.offline = dataOff
      console.log("getting...")
    });

  }

  async setOffline(ev) {

    if (ev.cancelable) {
      ev.preventDefault();
    }
    console.log("Cambio " + this.offline);
    await this.storage.set('offline', this.offline);

    if (this.offline) {

      this.loadingCtrl.create({
        content: 'Descargando datos necesarios para trabajo sin conexión, espere por favor...',
        spinner: 'crescent'
      });

      HerramientasPage.sincronizarDatos(this.storage, this.api, this.loadingCtrl,
        this.databaseProvider, this.http);
    }

  }

  /**
   * Descarga los datos necesarios para trabajo offline, medicosProductos, días agendados
   * @param storage Storage 
   * @param api ApiProvider acceso al api
   * @param databaseProvider DatabaseServiceProvider acceso a funciones de base de datos
   */
  public static async sincronizarDatos(storage: Storage, api: ApiProvider,
    loadingCtrl: LoadingController, databaseProvider: DatabaseServiceProvider,
    http: HttpClient) {

    let loading = loadingCtrl.create({
      content: 'Descargando datos necesarios para trabajo sin conexión, espere por favor...',
      spinner: 'crescent'
    });

    storage.get('userData').then(async userdata => {

      if (userdata) {

        api.api_token = userdata.api_token;
        api.visitador_id = userdata.visitador.id;

        //verificar si ya hubo sincronización de datos para presentaciones
        storage.get('presentacionesSync').then(presentacionesSync => {

          if (presentacionesSync) {//si ya sincronizó no volver a sincronizar

          } else {

            api.obtenerMedicosProductos().then(async (data: any) => {

              data.forEach(element => {
                console.log("Showing element...");
                console.log(element);

                element.productos.forEach(producto => {
                  producto.medico_id = element.medico_id;
                  producto.visitador_id = element.visitador_id;
                  producto.tipo_visita_id = element.tipo_visita.id;
                  producto.tipo_visita_nombre = element.tipo_visita.nombre;
                  databaseProvider.insertMedicosProductos(producto)
                    .then(result => {
                      console.log(result);
                    })
                    .catch(err => {
                      console.log(err);
                    })
                });

              });

              //bandera para indicar que ya se guardaron los datos
              await storage.set('presentacionesSync', true);

            }).catch(err => {
              console.log(err);

            });
          }

        })
          .catch(err => {
            console.log("no se pudo determinar si se sincronizó ya");
          });

        //verificar si ya hubo sincronización de datos para agenda y calendario
        storage.get('calendarioSync').then(async calendarioSync => {

          if (calendarioSync) {//si ya sincronizó no volver a sincronizar
            await loading.dismiss();
          } else {

            var dateobj = new Date();
            let fechames = dateobj.getFullYear() + '-' + pad((dateobj.getMonth() + 1));
            var date = dateobj.getFullYear() + '-' + pad((dateobj.getMonth() + 2));
            let fechamesadicional = date;

            api.obtenerDiasAgendadosMes(fechames).subscribe((response: any) => {

              console.log(fechames + " response obtenerDiasAgendadosMes " + fechamesadicional);
              console.log(response);
              let diasprocesados = [];
              response.forEach(dia => {
                console.log(diasprocesados);
                if (!inArray(dia, diasprocesados)) {

                  let fechatmp = fechames + '-' + pad(dia);
                  console.log(fechatmp);

                  diasprocesados.push(dia);

                  //obtener las visitas de cada día
                  api.agendaDia(fechatmp).subscribe((data: any) => {

                    console.log("data");
                    console.log(data);
                    data.forEach(agendadia => {
                      agendadia.fecha = fechatmp;
                      agendadia.agendada = 1;
                      agendadia.terminada = agendadia.visita_terminada;
                      console.log("element");
                      console.log(agendadia);

                      //insertar en base de datos local
                      databaseProvider.insertAgendamiento(agendadia)
                        .then(resp => {
                          console.log("agendamiento almacenado con éxito");
                          console.log(resp);

                        })
                        .catch(err => {
                          console.log("error registro no almacenado");
                          console.log(err);
                        });

                    });

                  });

                }

              });

            },
              () => {
                //loading.dismiss();
              },
              () => {
                //loading.dismiss();
              });

            //obtener agendamientos mes siguiente
            api.obtenerDiasAgendadosMes(fechamesadicional).subscribe((response: any) => {

              let diasprocesados = [];
              response.forEach(dia => {
                console.log(diasprocesados);
                if (!inArray(dia, diasprocesados)) {

                  let fechatmp = fechamesadicional + '-' + pad(dia);
                  console.log(fechatmp);
                  //obtener las visitas de cada día
                  api.agendaDia(fechatmp).subscribe((data: any) => {

                    console.log("data");
                    console.log(data);
                    data.forEach(agendadia => {
                      agendadia.fecha = fechatmp;
                      agendadia.agendada = 1;
                      agendadia.terminada = agendadia.visita_terminada;
                      console.log("element");
                      console.log(agendadia);

                      //insertar en base de datos local
                      databaseProvider.insertAgendamiento(agendadia)
                        .then(resp => {
                          console.log("agendamiento almacenado con éxito");
                          console.log(resp);
                          diasprocesados.push(dia);
                        })
                        .catch(err => {
                          console.log("error registro no almacenado");
                          console.log(err);
                        });

                    });

                  });

                }

              });

            },
              () => {
                //loading.dismiss();
              },
              () => {
                //loading.dismiss();
              });


            //traer datos sobre los productos
            api.getProductos("").subscribe(async data => {

              let productos;
              let productoResponse: any = data;

              console.log("productoResponse");
              console.log(productoResponse);

              // obteniendo respuesta sin filtros      
              if (productoResponse.hasOwnProperty('data')) {

                if (Array.isArray(productoResponse.data)) {

                  console.log(productoResponse.data);
                  productos = productoResponse.data;


                  if (productos != undefined) {
                    //agrega los registros a la base de datos local

                    productos.forEach(element => {
                      element.page = productoResponse.current_page;
                      databaseProvider.insertProductos(element);
                      console.log("elemento ");
                      console.log(element);
                    });

                    //console.log("data.last_page "+data.last_page)
                    if (productoResponse.last_page > 1) {

                      api.api_token = userdata.api_token;
                      api.visitador_id = userdata.visitador.id;
                      //obtener el resto de medicos de las demás páginas
                      for (let index = 2; index < (productoResponse.last_page + 1); index++) {

                        console.log("ciclo " + index)
                        this.storeProductos(api.api_token, index, storage, http, databaseProvider);

                      }
                    }

                    //Cantidad total de páginas
                    storage.set('last_pageProd', productoResponse.last_page);


                  }


                }

              }

              await loading.dismiss()

            },
              async () => {
                await loading.dismiss();
              });

            //bandera para indicar que ya se guardaron los datos
            storage.set('calendarioSync', true);

          }

        })
          .catch(async err => {
            console.log("no se pudo determinar si se sincronizó ya calendarioSync");
            await loading.dismiss();
          });

      } else {
        await loading.dismiss();
      }

    })
      .catch(async error => {
        console.log(error);
        await loading.dismiss();
      });

    await loading.present();

  }

  static storeProductos(api_token, page, storage: Storage, http: HttpClient,
    databaseProvider: DatabaseServiceProvider) {

    let apit = new ApiProvider(http, storage);
    apit.page = page;
    apit.api_token = api_token;

    apit.getProductos("")
      .subscribe(data => {

        let productos;
        let productoResponse: any = data;

        // obteniendo respuesta sin filtros      
        if (productoResponse.hasOwnProperty('data')) {

          if (Array.isArray(productoResponse.data)) {

            console.log(productoResponse.data);
            productos = productoResponse.data;

            if (productos != undefined) {
              //agrega los registros a la base de datos local

              productos.forEach(element => {
                element.page = productoResponse.current_page;
                databaseProvider.insertProductos(element);
                console.log("elemento ");
                console.log(element);
              });

            }

          }
        }

      });


  }

  async uploadData() {

    if (this.networkProvider.isConnected()) {
      this.isenabled = false;
      let loading = this.loadingCtrl.create({
        content: 'Subiendo información, el proceso va a continuar en segundo plano, espere por favor...',
        spinner: 'crescent'
      });

      await loading.present();

      this.uploadUpdVis(loading);



    } else {
      let alert2 = this.alertCtrl.create({
        title: 'Aviso',
        message: 'No existe una conexión a internet, ' +
          'para poder subir los datos, ' +
          'asegúrese de que cuenta con una conexión de internet estable ' +
          'y vuelva a intentarlo.',
        cssClass: 'alertaExitoAgendamiento',
        buttons: [{
          text: 'Aceptar',
          cssClass: 'botonAceptar'
        }]
      });
      alert2.present();
    }

  }

  uploadUpdVis(loading: Loading) {

    const promisesUpdVis = [];

    //traer registros de visitas que se hallan descargado desde el servidor principal
    this.databaseProvider.getCustomData('', 'visitas',
      "(id_servidor IS NOT NULL AND id_servidor IS NOT '') ")//AND subida IS NOT 'true'
      .then(result => {
        console.log("Consultando visitas...");
        console.log(result);

        if (result.length <= 0) {
          //loading.dismiss();
          this.uploadVisNuevas(loading);
        } else {

          result.forEach(visita => {

            promisesUpdVis.push(

              this.api.actualizarVisita(visita)
                .then(data => {
                  console.log("respuesta exitosa!!");
                  console.log(data);

                  //actualizar visita en base de datos local
                  this.databaseProvider.updateVisita("subida = 'true'",
                    "id_vis = " + visita.id_vis)
                    .then(async resupdvis => {
                      console.log("resultado actualización visita");
                      console.log(resupdvis);
                      await loading.dismiss();
                    })
                    .catch(async err => {
                      console.log(err);
                      await loading.dismiss();
                    })


                })
                .catch(async err => {
                  let alert = this.alertCtrl.create({
                    title: 'Error',
                    message: 'Ocurrio un error subiendo visita ' + visita.id_vis + '. Por favor intenta de nuevo'
                  });
                  await alert.present();
                  await loading.dismiss();
                })


            );

          });

          Promise.all(promisesUpdVis)
            .then(() => {
              console.log("Todo resuelto promisesUpdVis")
              this.uploadVisNuevas(loading);
            })
            .catch(err => {
              console.log("Todo resuelto catch")
              //this.uploadVisNuevas(loading);
            });

        }

      })
      .catch(err => {
        console.log("error getCustomData()");
        console.log(err);
        this.uploadVisNuevas(loading);
      });

  }

  uploadVisNuevas(loading: Loading) {

    const promisesCreateVis = [];

    this.databaseProvider.getCustomData('', 'visitas',
      "(id_servidor IS NULL OR id_servidor = '') AND " +
      "subida IS NOT 'true'")//tipo_visita_id IS NOT NULL AND fechainicio IS NOT NULL AND fechafin IS NOT NULL AND "+
      //"terminada IS NOT NULL AND 
      .then(async result => {
        console.log("Consultando visitas...");
        console.log(result);

        if (result.length <= 0) {
          await loading.dismiss();
          this.isenabled = true;
        } else {

          result.forEach(async visita => {
            // await loading.present();
            this.api.cargarVisita(visita)
              .then(data => {
                console.log("respuesta exitosa!!", data);

                promisesCreateVis.push(
                  //actualizar visita en base de datos local
                  this.databaseProvider.updateVisita("subida = 'true', id_servidor = '" + data['id'] + "'",
                    "id_vis = " + visita.id_vis)
                    .then(resupdvis => {
                      console.log("resultado actualización visita");
                      console.log(resupdvis);

                    })
                    .catch(err => {
                      console.log(err);
                    })
                );

              })
              .catch(async err => {
                let alert = this.alertCtrl.create({
                  title: 'Error',
                  message: 'Ocurrio un error subiendo visita ' + visita.id_vis + '. Por favor intenta de nuevo'
                });
                await alert.present();
                // loading.dismiss();
                // this.isenabled = false;
              });

          });

          Promise.all(promisesCreateVis)
            .then(async () => {
              console.log("Todo resuelto promisesCreateVis")
              await loading.dismiss();
              this.isenabled = true;
            })
            .catch(err => {
              console.log("Todo resuelto")
              // loading.dismiss();
              // this.isenabled = true;
            });

        }
        // this.api.cargarVisita(result[2]).subscribe(data => {
        //   console.log("respuesta exitosa!!");
        //   console.log(data);
        // });
      })
      .catch(async err => {
        console.log("error getcustomData()");
        console.log(err);
        await loading.dismiss();
        this.isenabled = true;
      });

  }

}
