import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { ApiProvider } from '../providers/api/api';
import { SQLite } from '@ionic-native/sqlite';
import { DatabaseServiceProvider } from '../providers/database-service/database-service';
import { HerramientasPage } from '../pages/herramientas/herramientas';
import { NetworkProvider } from '../providers/network/network';
import { Network } from '@ionic-native/network';

import { Login } from '../pages/login/login';
import { Medicos } from '../pages/medicos/medicos';
import { Agenda } from '../pages/agenda/agenda';
import { Productos } from '../pages/productos/productos';
import { HistorialPage } from '../pages/historial/historial';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  pages: Array<{ title: string, component: any, icon: string }> = [
    { title: 'MEDICOS ASIGNADOS', component: Medicos, icon: 'icon1.png' },
    { title: 'AGENDA', component: Agenda, icon: 'icon2.png' },
    { title: 'HISTORIAL', component: HistorialPage, icon: 'history.png' },
    { title: 'PRODUCTOS', component: Productos, icon: 'icon3.png' },
    { title: 'OFF LINE', component: HerramientasPage, icon: 'wifi.png' }
  ];;

  userData: any = {};

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public storage: Storage,
    public api: ApiProvider,
    public events: Events,
    public sqlite: SQLite,
    public alertCtrl: AlertController,
    public databaseService: DatabaseServiceProvider,
    public network: Network,
    public networkProvider: NetworkProvider) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {

      this.sqlite.create({
        name: 'exeltis.db',
        location: 'default' // the location field is required
      }).then(async db => {
        this.databaseService.setDataBase(db);
        return await this.databaseService.createTables();
      }).then(() => {
        // Captura de información del usuario autenticado
        this.events.subscribe('authentication', data => this.userData = data);

        // Definiendo pantalla principal dependiendo si se encuentra autenticado o no
        this.storage.get('userData').then(async data => {
          // Se va a validar red...
          this.networkProvider.initializeNetworkEvents();

          let conexion = true;

          // Offline event
          this.events.subscribe('network:offline', async () => {
            //alert('network:offline ==> '+this.network.type);
            //  Se va a validar red!!!!!
            conexion = false;
            let alert2 = this.alertCtrl.create({
              title: 'Aviso',
              message: 'Se detectó que no hay conexión a internet, ' +
                //'¿Desea activar el modo Off line, para seguir trabajando sin problemas?',
                'Se va activar el modo Off line, para seguir trabajando sin problemas',
              cssClass: 'alertaPresentacion',
              enableBackdropDismiss: false,
              buttons: [{
                //text: 'SI',
                text: 'Aceptar',
                cssClass: 'botonAceptarPresentacion',
                handler: () => {
                  this.storage.set('offline', true)
                }
              }]
            });
            await alert2.present();

            // alert('Se detectó que no hay conexión, '+ 
            // 'si desea trabajar sin internet, active el modo Off line, por favor.'); 
            //'si desea trabajar sin internet, asegurse de que el modo Off line esté activado, por favor.',   
          });

          // Online event
          /*this.events.subscribe('network:online', () => {
              alert('network:online ==> '+this.network.type);        
          });*/

          if (conexion) {
            if (!this.networkProvider.isConnected()) {
              let alert2 = this.alertCtrl.create({
                title: 'Aviso',
                message: 'Se detectó que no hay conexión a internet, ' +
                  //'¿Desea activar el modo Off line, para seguir trabajando sin problemas?',
                  'Se va activar el modo Off line, para seguir trabajando sin problemas',
                cssClass: 'alertaPresentacion',
                enableBackdropDismiss: false,
                buttons: [{
                  //text: 'SI',
                  text: 'Aceptar',
                  cssClass: 'botonAceptarPresentacion',
                  handler: () => {
                    this.storage.set('offline', true);
                  }
                }]
              });
              await alert2.present();

              if (data) {
                this.userData = data;
                this.rootPage = Medicos;
              } else {
                this.rootPage = Login;
              }
              this.statusBar.styleDefault();
              this.splashScreen.hide();
            } else {
              if (data) {
                this.userData = data;
                this.rootPage = Medicos;
              } else {
                this.rootPage = Login;
              }
              this.statusBar.styleDefault();
              this.splashScreen.hide();
            }
          }
        })
      }).catch(error => console.error(error));
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  logout() {
    this.storage.clear();
    this.databaseService.deleteTables();
    this.nav.setRoot(Login);
  }

  static isConnected(network: Network): boolean {
    let conntype = network.type;
    console.log(conntype);
    return conntype && conntype !== 'unknown' && conntype !== 'none';
  }

}
