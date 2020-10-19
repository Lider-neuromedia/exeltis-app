import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { Presentacion } from '../presentacion/presentacion';
import { DatabaseServiceProvider } from '../../providers/database-service/database-service';
import { Storage } from '@ionic/storage';
import { getCurrenDate, getCurrenTime, getCurrenDateTime } from '../../commons/Utils';

@Component({
  selector: 'agenda',
  templateUrl: 'agenda.html'
})
export class Agenda {
  
  date: any;
  daysInThisMonth: any;
  daysInLastMonth: any;
  daysInNextMonth: any;
  diasAgendadosMes: any = [];
  monthNames: string[];
  currentMonth: any;
  currentYear: any;
  currentDate: any;
  loading:any;
  selectedMonth:any;
  selectedDay:any;
  visitas:any = [];
  tiposVisita = {
    lista: [],
    seleccion: ''
  }

  constructor(private api: ApiProvider, private loadingCtrl: LoadingController, 
    private alertCtrl: AlertController, private navCtrl: NavController,
    public databaseProvider: DatabaseServiceProvider, public storage: Storage) {}

  ionViewWillEnter() {
    this.date = new Date();
    this.monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    this.getDaysOfMonth();
    this.visitasDia(null, null);
  }

  ionViewDidLoad(){

  }

  getDaysOfMonth() {

    this.daysInThisMonth = new Array();
    this.daysInLastMonth = new Array();
    this.daysInNextMonth = new Array();
    this.currentMonth = this.monthNames[this.date.getMonth()];
    this.currentYear = this.date.getFullYear();
    if(this.date.getMonth() === new Date().getMonth()) {
      this.currentDate = new Date().getDate();
    } else {
      this.currentDate = 999;
    }
  
    var firstDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();
    var prevNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
    for(var i = prevNumOfDays-(firstDayThisMonth-1); i <= prevNumOfDays; i++) {
      this.daysInLastMonth.push(i);
    }
  
    var thisNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDate();
    for (var i = 0; i < thisNumOfDays; i++) {
      this.daysInThisMonth.push(i+1);
    }
  
    var lastDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDay();
    var nextNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth()+2, 0).getDate();
    for (var i = 0; i < (6-lastDayThisMonth); i++) {
      this.daysInNextMonth.push(i+1);
    }
    var totalDays = this.daysInLastMonth.length+this.daysInThisMonth.length+this.daysInNextMonth.length;
    if(totalDays<36) {
      for(var i = (7-lastDayThisMonth); i < ((7-lastDayThisMonth)+7); i++) {
        this.daysInNextMonth.push(i);
      }
    }

    // Consulta de dias agendados para el visitador
    let mesAgendado = this.date.getMonth() + 1;

    if (mesAgendado < 10){

      mesAgendado = "0" + mesAgendado;
    }

    this.obtenerDiasAgendadosMes(this.currentYear + '-' + mesAgendado);
  }

  goToLastMonth() {
    
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
    this.getDaysOfMonth();
  }

  goToNextMonth() {

    this.date = new Date(this.date.getFullYear(), this.date.getMonth()+2, 0);
    this.getDaysOfMonth();
  }

  visitasDia(day, mes){

    let loading = this.loadingCtrl.create({
      content: 'Cargando ...',
      spinner: 'crescent'
    });
    loading.present();

    if(day){

      this.selectedDay = day;
      this.selectedMonth = this.monthNames[this.date.getMonth() + mes];

      var month:any = this.date.getMonth() +1 + mes;
      
    } else{
      
      this.selectedDay = this.currentDate;
      this.selectedMonth = this.currentMonth; 

      var month:any = this.date.getMonth() + 1;
      day = this.currentDate;      
    }
    
    if(month < 10){

      month = '0' + month; 
    }

    if(day < 10){

      day = '0'+ day;
    }
    
    var fecha = this.currentYear + '-' + month + '-' + day;

    //verificar si se está trabajando sin conexión a internet
    this.storage.get('offline').then(dataOff => {

      if (dataOff) {
        
        this.databaseProvider.getCustomData("*, visitas.terminada AS visita_terminada", "visitas "+
          " INNER JOIN medicos ON visitas.medico_id=medicos.medico_id ", " fecha = '"+fecha+"' AND "+
          " agendada = 1")
          .then(resultado => {
            console.log("Obteniendo visitas con médicos a partir de fecha...");
            console.log(resultado);
            this.visitas = resultado;
            loading.dismiss();
          })
          .catch(err => {
            console.log(err);
            let alert2 = this.alertCtrl.create({
              title: 'Error',
              message: 'Ocurrio un error: '+err.message
            });
            loading.dismiss();
            alert2.present();
          });

      }else{//trabajo online

        //obtener datos para el api, ya que con trabajo offline pueden no estar seteados
        this.storage.get("userData").then((data:any) => {
                  
          if(data){        
            
            this.api.api_token = data.api_token;
            this.api.visitador_id = data.visitador.id;

            this.api.agendaDia(fecha).subscribe(data => {

              this.visitas = data;
              loading.dismiss();
            });
    
          }
        })
        .catch((e) => {//se presentó un error al acceder al dato offline
          let alert2 = this.alertCtrl.create({
            title: 'Error',
            message: 'Ocurrio un error, vuelve a intentarlo'
          });
          alert2.present();
        });
        
      }

    })
    .catch((e) => {//se presentó un error al acceder al dato offline
      let alert2 = this.alertCtrl.create({
        title: 'Error',
        message: 'Ocurrio un error: '+e.message
      });
      alert2.present();
    });

  }

  reagendar(medico:any){

    if(!this.visitaTerminada(medico.visita_terminada)){

      let alert = this.alertCtrl.create({
        title: 'Reagendamiento De Citas',
        cssClass: 'alertaAgendamiento',
        inputs: [
          {
            name: 'fecha',
            placeholder: 'Selecciona',
            type: 'date'
          }
        ],
        buttons: [
          {
            text: 'REAGENDAR',
            cssClass: 'botonAgendar',
            handler: data => {


              //verificar si se está trabajando sin conexión a internet
              this.storage.get('offline').then(dataOff => {

                if (dataOff) {

                  this.databaseProvider.updateVisita("fecha = '"+data.fecha+"'", 
                    "id_vis = "+medico.id_vis)
                    .then(updvis => {

                      // Actualizando visitas para el dia consultado
                      this.visitasDia(this.selectedDay, 0);

                      // Actualizando las marcas de los dias agendados en el calendario
                      let mesConsultado = this.date.getMonth() + 1;

                      if(mesConsultado < 10){

                        mesConsultado = "0" + mesConsultado;
                      }

                      this.obtenerDiasAgendadosMes(this.currentYear + "-" + mesConsultado);

                      let alert2 = this.alertCtrl.create({
                        title: 'Exito',
                        message: 'El medico fue reagendado correctamente',
                        cssClass: 'alertaExitoAgendamiento',
                        buttons: [{
                          text: 'Aceptar',
                          cssClass: 'botonAceptar'
                        }]
                      });
                      alert2.present();

                    })
                    .catch(err => {
                      let alert2 = this.alertCtrl.create({
                        cssClass: 'alertaExitoAgendamiento',
                        message: 'Ocurrio un error '+err,
                        title: 'Error'
                      });
                      alert2.present();
                    });

                }else{//trabajo online

                  let nuevaFecha = data.fecha;
                  this.api.reagendarMedico(medico, data).subscribe(data => {
        
                    //Actualizar reagendamiento en base de datos local
                    this.databaseProvider.updateVisita("fecha = '"+nuevaFecha+"'", 
                    "id_servidor = "+data["id"])
                    .then(updvis => {

                      console.log("Visita actualizada localmente con éxito");

                    })
                    .catch(err => {
                      console.log("Error actualizando agendamiento en bd local...");
                      console.log(err);
                    });

                    // Actualizando visitas para el dia consultado
                    this.visitasDia(this.selectedDay, 0);

                    // Actualizando las marcas de los dias agendados en el calendario
                    let mesConsultado = this.date.getMonth() + 1;

                    if(mesConsultado < 10){

                      mesConsultado = "0" + mesConsultado;
                    }

                    this.obtenerDiasAgendadosMes(this.currentYear + "-" + mesConsultado);

                    let alert2 = this.alertCtrl.create({
                      title: 'Exito',
                      message: 'El medico fue reagendado correctamente',
                      cssClass: 'alertaExitoAgendamiento',
                      buttons: [{
                        text: 'Aceptar',
                        cssClass: 'botonAceptar'
                      }]
                    });
                    alert2.present();

                  }, data => {

                    let alert2 = this.alertCtrl.create({
                      cssClass: 'alertaExitoAgendamiento',
                      message: 'Ocurrio un error',
                      title: 'Error'
                    });
                    alert2.present();
                  });

                }

              })
              .catch((e) => {//se presentó un error al acceder al dato offline
                let alert2 = this.alertCtrl.create({
                  title: 'Error',
                  message: 'Ocurrio un error: '+e.message
                });
                alert2.present();
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
  }

  tiposVisitaDisponibles(medico:any){

    return new Promise((resolve, reject) => {

      // Consultado los tipos de visita disponibles
      this.loading = this.loadingCtrl.create({
        content: 'Cargando ...',
        spinner: 'crescent'
      });
      this.loading.present();

      this.api.tiposVisitaDisponibles(medico).subscribe((data:any) => {

        this.tiposVisita.lista = data;
        this.loading.dismiss();
        let opcionesTiposVisita = [];

        if(this.tiposVisita.lista.length > 1){

          for(let i = 0; i < this.tiposVisita.lista.length; i++){

            opcionesTiposVisita.push({
              label: this.tiposVisita.lista[i].nombre,
              name: 'tipo-visita',
              value: this.tiposVisita.lista[i].id,
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

                  if(data){

                    this.tiposVisita.seleccion = data;
                    resolve(data);

                  } else{

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
          alert.present();

        } else{

          this.tiposVisita.seleccion = data[0].id;
          resolve(data[0].id);
        }        
      });
    })
  }

  tiposVisitaDisponiblesOff(medico:any){

    return new Promise((resolve, reject) => {

      // Consultado los tipos de visita disponibles
      this.loading = this.loadingCtrl.create({
        content: 'Cargando ...',
        spinner: 'crescent'
      });
      this.loading.present();

      this.storage.get("userData").then((data:any) => {
        let visitador_id = data.visitador.id;

        this.databaseProvider.getCustomData("DISTINCT tipo_visita_id, tipo_visita_nombre", 
          "medicosproductos",
          "medico_id = "+medico.medico_id+" AND visitador_id = "+ visitador_id+
          "")
          .then(result => {
            console.log("resultado consulta...");
            console.log(result);

            this.tiposVisita.lista = result;
            this.loading.dismiss();
            let opcionesTiposVisita = [];

            if(this.tiposVisita.lista.length > 1){

              for(let i = 0; i < this.tiposVisita.lista.length; i++){
  
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
  
                      if(data){
  
                        this.tiposVisita.seleccion = data;
                        resolve(data);
  
                      } else{
  
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
              alert.present();
  
            } else{
  
              this.tiposVisita.seleccion = result[0].tipo_visita_id;
              resolve(result[0].tipo_visita_id);
            }

          })
          .catch(err => {
            console.log("error, consultado medicos productos");
            console.log(err);
          });


      });

    })
  }

  presentacion(medico){
    
    if(!this.visitaTerminada(medico.visita_terminada)){

      //verificar si se está trabajando sin conexión a internet
      this.storage.get('offline').then(dataOff => {

        if (dataOff) {
          

          this.tiposVisitaDisponiblesOff(medico).then(data => {//aqui iria la lógica para validar con los
            //datos que se almacenarán, del nuevo ws

            let tipoVisitaSeleccionada = data;
            
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
        
                    if (medico.fecha!=getCurrenDate()) {
                      let alert = this.alertCtrl.create({
                        cssClass: 'alertaPresentacion',      
                        message: 'La visita esta programada para otro día',
                        title: 'Alerta',
                        buttons: [
                          {
                            text: 'ACEPTAR',
                            cssClass: 'botonAceptarPresentacion'
                          }
                        ]
                      });
                      alert.present();
                      this.loading.dismiss();
                    }else{
                      
                      //obtener datos para el api, ya que con trabajo offline pueden no estar seteados
                      this.storage.get("userData").then((data:any) => {
                        
                        if (data) {
                          
                          this.databaseProvider.getCustomData(
                            "id,codigo,color,nombre,url_documento, url_logo", "medicosproductos",
                            "medico_id = "+medico.medico_id+" AND visitador_id = "+ data.visitador.id+
                            " AND tipo_visita_id = "+tipoVisitaSeleccionada+" ORDER BY orden_producto ASC")
                            .then(result => {
                              console.log("resultado consulta abrirPresentacion...");
                              console.log(result);

                              medico.fechainicio = getCurrenDateTime();
                              medico.tipo_visita_id = tipoVisitaSeleccionada;

                              //actualizar visita en base de datos local
                              this.databaseProvider.updateVisita("fechainicio = '"+medico.fechainicio+"', "+
                                "tipo_visita_id = '"+tipoVisitaSeleccionada+"'", 
                                "id_vis = "+medico.id_vis)
                                .then(resinsvis => {
                                  console.log("resultado actualización visita");
                                  console.log(resinsvis);
                                  this.navCtrl.push(Presentacion, {medico: medico, productos: result, 
                                    visita: medico, offline: dataOff});
                                  
                                  this.loading.dismiss();
                                })
                                .catch(err => {
                                  console.log(err);
                                  this.loading.dismiss();
                                });
                              

                            })
                            .catch(err => {
                              console.log("error, consultado medicos productos");
                              console.log(err);
                              let alert = this.alertCtrl.create({
                                title: 'Error',
                                message: 'Ocurrio un error. Por favor intenta de nuevo'
                              });
                              alert.present();
                              this.loading.dismiss();
                            });

                        }
                      
                      });
                    }
                    
                  }
                },
                {
                  text: 'CANCELAR',
                  cssClass: 'botonCancelarPresentacion'
                }
              ]
            });
        
            alert.present();
          })
          .catch(() => {

            let alert = this.alertCtrl.create({
              cssClass: 'alertaPresentacion',
              message: 'Por favor selecciona un tipo de visita',
              title: 'Error',
              buttons: [{
                cssClass: 'botonAceptarPresentacion',
                text: 'Aceptar'
              }]
            })

            alert.present();
          })


        }else{//trabajo online

          this.tiposVisitaDisponibles(medico).then(data => {

            let tipoVisitaSeleccionada = data;
        
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
        
                      this.api.abrirPresentacion(medico, medico.visita_id, tipoVisitaSeleccionada).subscribe((data:any) => {
        
                        this.navCtrl.push(Presentacion, {medico: medico, productos: data.productos, visita: data.visita});
                      }, 
                      (err:any) => {
        
                        this.loading.dismiss();
        
                        // Alerta para cuando la cita esta programada para otro dia
                        if(err.status == 403){
        
                          let alert = this.alertCtrl.create({
                            cssClass: 'alertaPresentacion',      
                            message: 'La visita esta programada para otro día',
                            title: 'Alerta',
                            buttons: [
                              {
                                text: 'ACEPTAR',
                                cssClass: 'botonAceptarPresentacion'
                              }
                            ]
                          });
                          alert.present();
        
                        // Alerta para cuando se genera un error
                        } else{
        
                          let alert = this.alertCtrl.create({
                            cssClass: 'alertaPresentacion',      
                            message: 'Ocurrio un error. Por favor intenta de nuevo',
                            title: 'Error',
                            buttons: [
                              {
                                text: 'ACEPTAR',
                                cssClass: 'botonAceptarPresentacion'
                              }
                            ]
                          });
                          alert.present();
                        }                
                      },
                      () => {
        
                        this.loading.dismiss();
                      })
                    }
                  },
                  {
                    text: 'CANCELAR',
                    cssClass: 'botonCancelarPresentacion'
                  }
                ]
              });
        
              alert.present();
            
          })
          .catch(() => {

            let alert = this.alertCtrl.create({
              cssClass: 'alertaPresentacion',
              message: 'Por favor selecciona un tipo de visita',
              title: 'Error',
              buttons: [{
                cssClass: 'botonAceptarPresentacion',
                text: 'Aceptar'
              }]
            })

            alert.present();
          })

        }

      })
      .catch((e) => {//se presentó un error al acceder al dato offline
        let alert2 = this.alertCtrl.create({
          title: 'Error',
          message: 'Ocurrio un error: '+e.message
        });
        alert2.present();
      });


    }
  
  }

  obtenerDiasAgendadosMes(fecha){

    let loading = this.loadingCtrl.create({
      content: 'Cargando ...',
      spinner: 'crescent'
    });
    loading.present();

    this.diasAgendadosMes = [];

    //verificar si se está trabajando sin conexión a internet
    this.storage.get('offline').then(dataOff => {

      if (dataOff) {

        this.databaseProvider.getCustomData('fecha', 'visitas', "fecha like '%"+fecha+"%'")
          .then(result => {
            console.log("Consultando dias agendados...");
            console.log(result);
            result.forEach(fecha => {
              let dia = fecha.fecha.substring(8,10);
              
              if (dia != this.currentDate) {
                this.diasAgendadosMes.push(parseInt(dia.match(/\d+/),10));
              }
            });
            console.log(this.diasAgendadosMes);
            loading.dismiss();
          })
          .catch(err => {
            console.log("error");
            loading.dismiss();
          });

        

      }else{//trabajo online

        //obtener datos para el api, ya que con trabajo offline pueden no estar seteados
        this.storage.get("userData").then((data:any) => {
                  
          if(data){        
            
            this.api.api_token = data.api_token;
            this.api.visitador_id = data.visitador.id;

            this.api.obtenerDiasAgendadosMes(fecha).subscribe((response:any) => {     

              this.diasAgendadosMes = response.filter((value, index, array) => {
    
                return value != this.currentDate;
              })
              console.log("this.diasAgendadosMes Online");
              console.log(this.diasAgendadosMes);
            }, 
            () => {
    
              loading.dismiss();
            }, 
            () => {
              loading.dismiss();
            });
    
          }
        })
        .catch((e) => {//se presentó un error al acceder al dato offline
          let alert2 = this.alertCtrl.create({
            title: 'Error',
            message: 'Ocurrio un error, vuelve a intentarlo'
          });
          alert2.present();
        });

      }

    })
    .catch((e) => {//se presentó un error al acceder al dato offline
      let alert2 = this.alertCtrl.create({
        title: 'Error',
        message: 'Ocurrio un error: '+e.message
      });
      alert2.present();
    });

  }

  visitaTerminada(estado){

    if(estado == 1){

      let alert = this.alertCtrl.create({
        cssClass: 'alertaPresentacion',
        message: 'La visita ya fue realizada',
        title: 'Error',
        buttons: [
          {
            text: 'ACEPTAR',
            cssClass: 'botonAceptarPresentacion',
          }
        ]
      });
      alert.present();

      return true;

    } else{

      return false;
    }

  }
}
