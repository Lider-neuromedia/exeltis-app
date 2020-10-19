import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { apiUrl } from '../../commons/Constants';

@Injectable()
export class HistorialProvider {

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  async getAllHistorial(page: any = 1, medico: string = '', fecha_inicio = '', fecha_fin = '') {
    const data = await this.getStoredData();

    let options = {
      params: new HttpParams().set('api_token', data.api_token)
        .set('visitador_id', data.visitador.id)
        .set('medico', medico)
        .set('fecha_inicio', fecha_inicio)
        .set('fecha_fin', fecha_fin)
        .set('page', page)
    }

    return this.getInfoApi(this.http.get(apiUrl + 'historial-visitas', options));

  }

  getInfoApi(Observable) {
    return new Promise((resolve, reject) => {
      Observable.subscribe(
        data => {
          resolve(data);
        }, err => {
          console.log("Error occured.");
          console.log(err);
          reject(err);
        }
      );
    })
  }

  async getStoredData() {
    await this.storage.ready();
    return await this.storage.get('userData');
  }

}
