import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController, AlertController, LoadingController, MenuController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { Presentacion } from '../presentacion/presentacion';
import { DatabaseServiceProvider } from '../../providers/database-service/database-service';
import { Storage } from '@ionic/storage';
import { ExeltisDBDef } from '../../commons/ExeltisDBDef';
import { HttpClient } from '@angular/common/http';
import { HerramientasPage } from '../herramientas/herramientas';
import { Network } from '@ionic-native/network';

@Component({
  selector: 'medicos',
  templateUrl: 'medicos.html'
})

export class Medicos {

  medicos: any = [];
  busqueda: string = '';
  current_page: any = 1;
  last_page: any;
  paginationProgress: string = "0%";
  dateComponent: any;
  loading: any;
  tiposVisita = {
    lista: [],
    seleccion: 0
  };

  constructor(
    public databaseProvider: DatabaseServiceProvider,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public menuCtrl: MenuController,
    public sanitizer: DomSanitizer,
    public navCtrl: NavController,
    public api: ApiProvider,
    public storage: Storage,
    public http: HttpClient,
    public network: Network
  ) { }

  ionViewDidLoad() {
    this.api.busqueda = this.busqueda || '';
    this.dateComponent = this.sanitizer.bypassSecurityTrustHtml('<ion-item><ion-label>Start Time</ion-label><ion-datetime displayFormat="h:mm A" pickerFormat="h mm A"></ion-datetime></ion-item>')
    this.menuCtrl.enable(true);
    this.listar();
  }

  agendar(medico: any) {

    let alert = this.alertCtrl.create({
      title: 'Agendamiento De Citas',
      cssClass: 'alertaAgendamiento',
      inputs: [
        {
          id: 'campo-fecha-agenda-medico',
          name: 'fecha',
          placeholder: 'Selecciona',
          type: 'date'
        }
      ],
      buttons: [
        {
          text: 'AGENDAR',
          cssClass: 'botonAgendar',
          handler: data => {


            //verificar si se está trabajando sin conexión a internet
            this.storage.get('offline').then(dataOff => {

              if (dataOff) {

                console.log("Guardando en base de datos local...")
                if (data != undefined) {
                  if (data.fecha != "") {
                    medico.fecha = data.fecha;
                    console.log(medico);
                    this.databaseProvider.insertAgendamiento(medico)
                      .then(async resp => {
                        let alert2 = this.alertCtrl.create({
                          title: 'Exito',
                          message: 'El medico fue agendado correctamente',
                          cssClass: 'alertaExitoAgendamiento',
                          buttons: [{
                            text: 'Aceptar',
                            cssClass: 'botonAceptar'
                          }]
                        });
                        await alert2.present();
                      })
                      .catch(async err => {
                        console.log("error registro no almacenado");
                        let alert2 = this.alertCtrl.create({
                          title: 'Error',
                          message: 'Ocurrio un error: ' + err.message
                        });
                        await alert2.present();
                      });
                  }
                }

              } else {//trabajo online

                //if(MyApp.isConnected(this.network)){

                this.api.agendarMedico(medico, data).subscribe(dataresp => {

                  let alert2 = this.alertCtrl.create({
                    title: 'Exito',
                    message: 'El medico fue agendado correctamente',
                    cssClass: 'alertaExitoAgendamiento',
                    buttons: [{
                      text: 'Aceptar',
                      cssClass: 'botonAceptar'
                    }]
                  });
                  alert2.present();
                  //almacenar en base de datos local
                  if (dataresp != undefined) {

                    console.log(dataresp);
                    this.databaseProvider.insertAgendamiento(dataresp)
                      .then(resp => {
                        console.log("Agendamiento almacenado también localmente");
                        console.log(dataresp);
                      })
                      .catch(err => {
                        console.log("error registro no almacenado");

                      });

                  }


                }, dataerr => {


                  console.log("error registro no enviado");
                  console.log(dataerr);
                  console.log("Guardando en base de datos local...")
                  if (data != undefined) {
                    if (data.fecha != "") {
                      medico.fecha = data.fecha;
                      console.log(medico);
                      this.databaseProvider.insertAgendamiento(medico)
                        .then(async resp => {
                          let alert2 = this.alertCtrl.create({
                            title: 'Exito',
                            message: 'El medico fue agendado correctamente',
                            cssClass: 'alertaExitoAgendamiento',
                            buttons: [{
                              text: 'Aceptar',
                              cssClass: 'botonAceptar'
                            }]
                          });
                          await alert2.present();
                        })
                        .catch(async err => {
                          console.log("error registro no almacenado");
                          let alert2 = this.alertCtrl.create({
                            title: 'Error',
                            message: 'Ocurrio un error: ' + err.message
                          });
                          await alert2.present();
                        });
                    }
                  }

                });

                // }else{
                //   let alert2 = this.alertCtrl.create({
                //     title: 'Aviso',
                //     message: 'No hay conexión a internet, active el modo Off line, por favor.',
                //     cssClass: 'alertaExitoAgendamiento',
                //     buttons: [{
                //       text: 'Aceptar',
                //       cssClass: 'botonAceptar'
                //     }]
                //   });
                //   alert2.present();
                // }


              }

            })
              .catch(async (e) => {//se presentó un error al acceder al dato offline
                let alert2 = this.alertCtrl.create({
                  title: 'Error',
                  message: 'Ocurrio un error: ' + e.message
                });
                await alert2.present();
              });


          }
        },
        {
          text: 'CANCELAR',
          cssClass: 'botonCancelarAgenda'
        }
      ]
    });

    alert.present();
  }

  async presentacion(medico: any) {

    const data = await this.tiposVisitaDisponiblesOff(medico);
    let tipoVisitaSeleccionada = data;

    // Obtener datos para el api, ya que con trabajo offline pueden no estar seteados
    const resp = await this.storage.get("userData");
    if (resp) {
      const result = await this.databaseProvider.getCustomData(
        "id,codigo,color,nombre,url_documento, url_logo, orden_producto", "medicosproductos",
        "medico_id = " + medico.medico_id + " AND visitador_id = " + resp.visitador.id +
        " AND tipo_visita_id = " + tipoVisitaSeleccionada + " ORDER BY orden_producto ASC");

      this.navCtrl.push(Presentacion, {
        medico: medico, productos: result, offline: true,
        tipoVisitaSeleccionada
      });
    }
  }

  async listar() {

    let loading = this.loadingCtrl.create({
      content: 'Buscando ...',
      spinner: 'crescent'
    });

    await loading.present();

    this.api.page = this.current_page;

    //Obtener token
    this.storage.get('userData').then(data => {

      if (data) {

        this.api.api_token = data.api_token;

      }
    })

    //verificar si ya hubo sincronización de datos
    this.storage.get('dataSincronized').then(data => {
      console.log("dataSincronized");
      console.log(data);
      if (data) {

        this.storage.get('userData').then(userdata => {

          if (userdata) {
            this.databaseProvider.getData("medicos", ExeltisDBDef.MEDICOS.visitador_id +
              " = '" + userdata.visitador.id + "'" +
              ((this.api.busqueda != "") ? " AND nombre_medico like '%" + this.api.busqueda + "%'" :
                " AND page = " + this.current_page))
              .then(async medicos => {
                console.log(ExeltisDBDef.MEDICOS.visitador_id +
                  " = '" + userdata.visitador.id + "' AND page = " + this.current_page);

                if (this.api.busqueda != "") {
                  let paginas = Math.ceil(medicos.length / 10);
                  console.log(paginas);

                  this.databaseProvider.getData("medicos", ExeltisDBDef.MEDICOS.visitador_id +
                    " = '" + userdata.visitador.id + "'" +
                    " AND nombre_medico like '%" + this.api.busqueda + "%' LIMIT 10 " +
                    " OFFSET " + ((this.current_page * 10) - 10))
                    .then(async medicoslim => {
                      console.log(ExeltisDBDef.MEDICOS.visitador_id +
                        " = '" + userdata.visitador.id + "'" +
                        " AND nombre_medico like '%" + this.api.busqueda + "%' LIMIT 10 " +
                        " OFFSET " + ((this.current_page * 10) - 10));

                      this.medicos = medicoslim;

                      this.last_page = paginas;
                      this.avancePaginacion();


                      await loading.dismiss();

                    })
                    .catch(async error => {
                      console.log(error);
                      await loading.dismiss();
                    });


                } else {

                  this.medicos = medicos;
                  console.log(this.medicos);
                  console.log("medicos asignados desde bd local")

                  this.storage.get('last_page').then(last_page => {
                    this.last_page = last_page;
                    this.avancePaginacion();
                  });

                  await loading.dismiss();
                }

              })
              .catch(async error => {
                console.log(error);
                await loading.dismiss();
              });
          }

        })
          .catch(async error => {
            console.log(error);
            await loading.dismiss();
          });


      } else {//si aún no se sincronizó se llama al servicio

        this.api.getMedicos().then(async (data: any) => {

          //console.log(data);
          this.medicos = data.data;
          //console.log("data.data"+data.data);
          //console.log("this.medicos"+this.medicos);
          if (this.medicos != undefined) {
            //agrega los registros a la base de datos local

            this.medicos.forEach(element => {
              element.page = data.current_page;
              this.databaseProvider.insertMedico(element);
              console.log("elemento ");
              console.log(element);
            });

            //console.log("data.last_page "+data.last_page)
            if (data.last_page > 1) {

              //obtener el resto de medicos de las demás páginas
              for (let index = 2; index < (data.last_page + 1); index++) {

                //console.log("ciclo "+index)
                this.storeMedicos(index);
                //console.log("store called!");

              }
            }

            //se habilita flag para indicar que ya se sincronizó
            this.storage.set('dataSincronized', true);
            //Cantidad total de páginas
            this.storage.set('last_page', data.last_page);

          }

          this.current_page = data.current_page;
          this.last_page = data.last_page;
          this.avancePaginacion();
          await loading.dismiss();

        }).catch(error => {

          console.log("Error de conexión a internet " + error);
          console.log("Trayendo datos de base de datos local...");


          this.storage.get('userData').then(userdata => {

            if (userdata) {
              this.databaseProvider.getData("medicos", ExeltisDBDef.MEDICOS.visitador_id +
                " = '" + userdata.visitador.id + "' AND page = " + this.current_page)
                .then(async medicos => {
                  console.log(ExeltisDBDef.MEDICOS.visitador_id +
                    " = '" + userdata.visitador.id + "' AND page = " + this.current_page);
                  this.medicos = medicos;
                  console.log(this.medicos);
                  console.log("medicos asignados desde bd local")

                  this.storage.get('last_page').then(last_page => {
                    this.last_page = last_page;
                  });
                  this.avancePaginacion();
                  await loading.dismiss();
                })
                .catch(async error => {
                  console.log(error);
                  await loading.dismiss();
                });
            }

          })
            .catch(async error => {
              console.log(error);
              await loading.dismiss();
            });


        });

        /**
         * 
         */
        HerramientasPage.sincronizarDatos(this.storage, this.api,
          this.loadingCtrl, this.databaseProvider, this.http);

      }
    }).catch(error => {
      console.log("Error this.storage.get('dataSincronized') " + error);
    });

  }

  buscar() {

    this.api.busqueda = this.busqueda;
    this.current_page = 1;
    this.listar();
  }

  paginacion(e) {

    if (e.direction === 4 && this.current_page > 1) {

      this.current_page--;

    } else if (e.direction === 2 && this.current_page < this.last_page) {

      this.current_page++;
    }

    this.listar();
  }

  avancePaginacion() {

    this.paginationProgress = (this.current_page * 100) / this.last_page + "%";
  }

  storeMedicos(page) {
    let medicostmp;

    let apit = new ApiProvider(this.http, this.storage);
    apit.page = page;

    apit.getMedicos()
      .then((data: any) => {
        console.log(data);
        console.log("ciclo data.current_page " + data.current_page);
        medicostmp = data.data;
        medicostmp.forEach(element => {
          element.page = data.current_page;
          this.databaseProvider.insertMedico(element);
        });

      })
      .catch(error => {
        console.log("No se pudo obtener registro de WS " + error);
      });
  }

  tiposVisitaDisponiblesOff(medico: any) {

    return new Promise(async (resolve, reject) => {

      // Consultado los tipos de visita disponibles
      this.loading = this.loadingCtrl.create({
        content: 'Cargando ...',
        spinner: 'crescent'
      });
      await this.loading.present();

      this.storage.get("userData").then((data: any) => {
        let visitador_id = data.visitador.id;

        this.databaseProvider.getCustomData("DISTINCT tipo_visita_id, tipo_visita_nombre",
          "medicosproductos",
          "medico_id = " + medico.medico_id + " AND visitador_id = " + visitador_id +
          "")
          .then(async result => {
            console.log("resultado consulta...");
            console.log(result);

            this.tiposVisita.lista = result;
            await this.loading.dismiss();
            let opcionesTiposVisita = [];

            if (this.tiposVisita.lista.length > 1) {

              for (let i = 0; i < this.tiposVisita.lista.length; i++) {

                opcionesTiposVisita.push({
                  label: this.tiposVisita.lista[i].tipo_visita_nombre,
                  name: 'tipo-visita',
                  value: this.tiposVisita.lista[i].tipo_visita_id,
                  type: 'radio'
                })
              }

              let alert = this.alertCtrl.create({
                cssClass: 'alertaPresentacion',
                message: 'Escoge el tipo de visita.',
                inputs: opcionesTiposVisita,
                title: 'Tipos de visita',
                buttons: [
                  {
                    cssClass: 'botonAceptarPresentacion',
                    text: 'Aceptar',
                    handler: data => {

                      if (data) {

                        this.tiposVisita.seleccion = data;
                        resolve(data);

                      } else {

                        reject("error");
                      }

                    }
                  },
                  {
                    cssClass: 'botonCancelarPresentacion',
                    text: 'Cancelar'
                  }
                ]
              });
              await alert.present();

            } else {

              this.tiposVisita.seleccion = result[0].tipo_visita_id;
              resolve(result[0].tipo_visita_id);
            }

          }).catch(err => {
            console.log("error, consultado medicos productos");
            console.log(err);
          });
      });
    })
  }


}