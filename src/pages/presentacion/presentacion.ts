import { Component, ViewChild } from '@angular/core';
import {
  IonicPage, NavParams, Content,
  LoadingController, AlertController, Platform, ToastController
} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ApiProvider } from '../../providers/api/api';
import { trigger, state, style } from '@angular/animations';
import { DatabaseServiceProvider } from '../../providers/database-service/database-service';
import { getCurrenDateTime, getCurrenDate, getCurrenTime } from '../../commons/Utils';
import { resourcesUrl } from '../../commons/Constants';

@IonicPage()
@Component({
  selector: 'presentacion',
  templateUrl: 'presentacion.html',
  animations: [
    trigger('itemState', [
      state('enable', style({ display: 'block' })),
      state('disable', style({ display: 'none' }))
    ])
  ]
})
export class Presentacion {

  @ViewChild(Content) content: Content;

  presentando = false;
  cargando = true;

  tiposVisita = {
    lista: [],
    seleccion: 0
  };

  tipoVisitaSeleccionada: number;

  medico: any = {};
  productos: any[] = [];
  visita: any = {};
  urlArchivo: any;
  urlImagen: any;
  zoomVisor = 1.0;
  hayArchivo: boolean;
  loading: any;
  canExit = false;
  resourcesUrl: string;
  menuProductosState = 'disable';
  indiceProductoAbierto = 0;
  //indica si se trabaja sin conexión
  offline = false;

  constructor(
    public databaseProvider: DatabaseServiceProvider,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private platform: Platform,
    public storage: Storage,
    public api: ApiProvider
  ) {
    this.resourcesUrl = this.api.resourcesUrl;
  }

  ionViewDidLoad() {

    this.medico = this.navParams.get('medico');
    this.productos = this.navParams.get('productos');
    this.offline = this.navParams.get('offline');
    this.tipoVisitaSeleccionada = this.navParams.get('tipoVisitaSeleccionada');
    this.cargarProducto(this.productos[0], 0);
  }

  async ionViewCanLeave() {
    if (this.presentando) {
      const response = await this.cerrarPresentacion()
      this.canExit = response;
      return this.canExit;
    }
  }

  async presentacion() {
    // Verificar si se está trabajando sin conexión a internet
    const dataOff = await this.storage.get('offline');

    if (dataOff) {
      let alert = this.alertCtrl.create({
        title: 'Presentación',
        message: 'Estas a punto de iniciar la presentación de los productos <br /> ¿Deseas continuar?',
        cssClass: 'alertaPresentacion',
        buttons: [
          {
            text: 'ACEPTAR',
            cssClass: 'botonAceptarPresentacion',
            handler: data => {

              this.loading = this.loadingCtrl.create({
                content: 'Cargando ...',
                spinner: 'crescent'
              });
              this.loading.present();

              //obtener datos para el api, ya que con trabajo offline pueden no estar seteados
              this.storage.get("userData").then((data: any) => {

                if (data) {

                  this.databaseProvider.getCustomData(
                    "id,codigo,color,nombre,url_documento, url_logo, orden_producto", "medicosproductos",
                    "medico_id = " + this.medico.medico_id + " AND visitador_id = " + data.visitador.id +
                    " AND tipo_visita_id = " + this.tipoVisitaSeleccionada + " ORDER BY orden_producto ASC")
                    .then(result => {
                      console.log("resultado consulta abrirPresentacion...");
                      console.log(result);

                      var date = getCurrenDate();
                      var time = getCurrenTime();
                      let visita = `{"medico_id":"` + this.medico.medico_id + `","visitador_id":"` + data.visitador.id + `",
                          "fecha":"`+ date + `","tipo_visita_id":"` + this.tipoVisitaSeleccionada + `",
                          "fechainicio":"`+ date + ` ` + time + `", "agendada":0}`;

                      let visitajson = JSON.parse(visita);

                      //insertar visita en base de datos local
                      this.databaseProvider.insertVisita(visitajson)
                        .then(async resinsvis => {
                          visitajson.id_vis = resinsvis['insertId'];

                          console.log(visitajson);
                          /* this.navCtrl.push(Presentacion, {
                            medico: medico, productos: result,
                            visita: visitajson, offline: dataOff
                          }); */
                          this.productos = result;
                          await this.loading.dismiss();
                          this.cargarProducto(this.productos[0], 0);
                          this.visita = visitajson;
                          this.offline = dataOff;

                          this.presentando = true;
                          let toast = this.toastCtrl.create({
                            message: 'La presentación ha iniciado',
                            position: 'top',
                            duration: 3000,
                          });

                          await toast.present();
                        }).catch(async err => {
                          console.log(err);
                          await this.loading.dismiss();
                        });

                    }).catch(async err => {
                      console.log("error, consultado medicos productos");
                      console.log(err);
                      let alert = this.alertCtrl.create({
                        title: 'Error',
                        message: 'Ocurrio un error. Por favor intenta de nuevo'
                      });
                      await alert.present();
                      await this.loading.dismiss();
                    });
                }
              });
            }
          },
          {
            text: 'CANCELAR',
            cssClass: 'botonCancelarPresentacion'
          }
        ]
      });
      await alert.present();
    } else {
      // Trabajo online

      let alert = this.alertCtrl.create({
        title: 'Presentación',
        message: 'Estas a punto de iniciar la presentación de los productos <br /> ¿Deseas continuar?',
        cssClass: 'alertaPresentacion',
        buttons: [{
          text: 'ACEPTAR',
          cssClass: 'botonAceptarPresentacion',
          handler: data => {

            this.loading = this.loadingCtrl.create({
              content: 'Cargando ...',
              spinner: 'crescent'
            });
            this.loading.present();

            //obtener datos para el api, ya que con trabajo offline pueden no estar seteados
            this.storage.get("userData").then((data: any) => {

              this.api.api_token = data.api_token;
              this.api.visitador_id = data.visitador.id;


              this.api.abrirPresentacion(this.medico, null, this.tipoVisitaSeleccionada).subscribe(async (data: any) => {

                /*  this.navCtrl.push(Presentacion, { medico: medico, productos: data.productos, visita: data.visita }); */
                this.productos = data.productos;
                await this.loading.dismiss();
                this.cargarProducto(this.productos[0], 0);
                this.visita = data.visita;
                this.presentando = true;
                this.offline = true;


                let toast = this.toastCtrl.create({
                  message: 'La presentación ha iniciado',
                  position: 'top',
                  duration: 3000,
                });

                await toast.present();
              }, async () => {

                let alert = this.alertCtrl.create({
                  title: 'Error',
                  message: 'Ocurrio un error. Por favor intenta de nuevo'
                });
                await alert.present();
              });

            });

          }
        }, {
          text: 'CANCELAR',
          cssClass: 'botonCancelarPresentacion'
        }]
      });

      await alert.present();
    }
  }


  figureOutFile(file: string) {
    if (this.platform.is('ios')) {
      const baseUrl = location.href.replace('/index.html', '');
      return baseUrl + `/ assets / ${file} `;
    }
    if (this.platform.is('android')) {
      return `file:///android_asset/www/assets/${file}`;
    }
  }

  async cargarProducto(producto, indiceProducto) {
    this.content.scrollToTop();
    this.loading = this.loadingCtrl.create({
      content: 'Cargando ...',
      spinner: 'crescent'
    });
    // await this.loading.present();

    if (producto.url_documento) {
      this.hayArchivo = true;
      if (this.offline) {
        this.urlArchivo = "/assets/productos/" + producto.url_documento;
        this.urlImagen = "/assets/images/logos/";
        this.indiceProductoAbierto = indiceProducto;

        // Especificacion de que producto esta abierto
        for (let i = 0; i < this.productos.length; i++) {
          this.productos[i].opened = false;
        }
        producto.opened = true;

      } else {
        this.urlArchivo = resourcesUrl + "documentos/" + producto.url_documento;
        this.urlImagen = resourcesUrl + 'logos/';
        this.indiceProductoAbierto = indiceProducto;

        // Especificacion de que producto esta abierto
        for (let i = 0; i < this.productos.length; i++) {
          this.productos[i].opened = false;
        }
        producto.opened = true;
      }

    } else {
      this.hayArchivo = false;
    }
    await this.loading.dismiss();
    this.cargando = false;
  }

  cerrarPresentacion() {
    return new Promise<boolean>(async (resolve, reject) => {
      let alert = this.alertCtrl.create({
        cssClass: 'alertaPresentacion',
        message: 'Estas seguro que deseas cerrar la presentación?',
        title: 'Presentación',
        enableBackdropDismiss: false,
        buttons: [{
          text: 'ACEPTAR',
          cssClass: 'botonAceptarPresentacion',
          handler: async () => {
            this.loading = this.loadingCtrl.create({
              content: 'Cargando ...',
              spinner: 'crescent'
            });
            await this.loading.present();

            //cerrar presentación y finalizar visita dependiendo si es offline o no
            console.log('this.offline', this.offline);

            if (this.offline) {

              this.visita.fechafin = getCurrenDateTime();
              this.visita.terminada = 1;
              this.databaseProvider.finalizarVisita(this.visita)
                .then(async resultado => {
                  resolve(true);
                  await this.loading.dismiss();
                  let toast = this.toastCtrl.create({
                    message: 'La presentación ha finalizado correctamente',
                    position: 'top',
                    duration: 3000,
                  });
                  await toast.present();

                  this.presentando = false;
                }).catch(async err => {
                  await this.alertCtrl.create({
                    title: 'Error',
                    message: 'Ocurrio un error. Por favor intenta de nuevo'
                  });

                  reject(false);
                  await this.loading.dismiss();
                });

            } else {

              this.api.cerrarPresentacion(this.visita)
                .subscribe((resp) => {
                  this.visita.fechafin = resp['fecha_fin'];
                  this.visita.fechainicio = resp['fecha_inicio'];
                  this.visita.terminada = 1;
                  this.visita.id = resp['id'];
                  this.databaseProvider.finalizarVisita(this.visita)
                    .then(async resultado => {
                      resolve(true);
                      await this.loading.dismiss();
                      let toast = this.toastCtrl.create({
                        message: 'La presentación ha finalizado correctamente',
                        position: 'top',
                        duration: 3000,
                      });
                      await toast.present();

                      this.presentando = false;
                    }).catch(async err => {
                      await this.alertCtrl.create({
                        title: 'Error',
                        message: 'Ocurrio un error. Por favor intenta de nuevo'
                      });

                      reject(false);
                      await this.loading.dismiss();
                    });

                  //resolve(true);
                }, async () => {
                  await this.alertCtrl.create({
                    title: 'Error',
                    message: 'Ocurrio un error. Por favor intenta de nuevo'
                  });

                  reject(false);
                }, async () => {
                  await this.loading.dismiss();
                })
            }
          }
        }, {
          text: 'CANCELAR',
          cssClass: 'botonCancelarPresentacion',
          handler: () => {
            resolve(false);
          }
        }]
      });
      await alert.present();
    })
  }

  menuProductos() {
    if (this.menuProductosState == "disable") {
      this.menuProductosState = "enable";
    } else {
      this.menuProductosState = "disable";
    }
  }

  navegacionProductos(accion: string) {
    if (accion == "+") {
      this.indiceProductoAbierto++;

    } else if (accion == "-") {
      this.indiceProductoAbierto--;
    }

    this.cargarProducto(this.productos[this.indiceProductoAbierto], this.indiceProductoAbierto);
  }

  paginacion(e) {
    if (e.direction === 4 && !(this.indiceProductoAbierto <= 0)) {
      this.navegacionProductos('-');
    } else if (e.direction === 2 && !(this.indiceProductoAbierto >= this.productos.length - 1)) {
      this.navegacionProductos('+');
    }
  }

}
