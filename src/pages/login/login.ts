import { IonicPage, NavController, LoadingController, MenuController, AlertController, Events } from 'ionic-angular';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

import { DatabaseServiceProvider } from '../../providers/database-service/database-service';
import { ApiProvider } from '../../providers/api/api';
import { Medicos } from '../medicos/medicos';

@IonicPage()
@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class Login {

  auth = {
    username: '',
    password: ''
  };

  errorLogin: boolean = false;

  constructor(
    public databaseService: DatabaseServiceProvider,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public menuCtrl: MenuController,
    public navCtrl: NavController,
    public storage: Storage,
    public api: ApiProvider,
    public events: Events
  ) { }

  ionViewDidLoad() {
    this.menuCtrl.enable(false);
  }

  async autenticacion() {
    const loading = this.loadingCtrl.create({
      content: 'Iniciando sesión'
    });
    await loading.present();

    this.api.autenticacion(this.auth)
      .subscribe(async data => {
        await this.storage.set('userData', data);
        this.events.publish('authentication', data);

        //crear tablas
        await this.databaseService.createTables();

        await this.navCtrl.setRoot(Medicos);
        await loading.dismiss();
      }, async () => {
        const alert = this.alertCtrl.create({
          cssClass: 'loginFallido',
          message: 'Datos Incorrectos',
          title: 'Error',
          buttons: [{
            cssClass: 'botonAceptar',
            text: 'Aceptar'
          }]
        });

        await alert.present();

        // this.errorLogin = true;
        await loading.dismiss();
      })
  }

}
