import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { HistorialProvider } from '../../providers/historial/historial';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-historial',
  templateUrl: 'historial.html',
})
export class HistorialPage {

  today = new Date();
  minDate = this.today.getFullYear();
  maxDate = new Date().toISOString();

  max: string;
  min: string;

  loading = true;
  last_page = 1;
  total: 0;
  current_page = 1;

  offline = false;

  busqueda = '';

  historial: any[] = [];

  constructor(
    private historialProvider: HistorialProvider,
    private storage: Storage
  ) { }

  ionViewDidLoad() {
    this.cargarHistorial();
  }

  async cargarHistorial() {

    // Verificar si se está trabajando sin conexión a internet
    const dataOff = await this.storage.get('offline');

    this.offline = dataOff;

    if (!dataOff) {
      this.historialProvider.getAllHistorial(this.current_page, this.busqueda, this.min, this.max)
        .then((resp: any) => {
          this.last_page = resp.last_page;
          this.total = resp.total;
          this.current_page = resp.current_page;
          this.historial = resp.data;

          /*  this.offline = false; */
          this.loading = false;
        });
    } else {
      this.loading = false;
      /* this.offline = true; */

    }
  }

  paginacion(e) {
    this.loading = true;
    if (e.direction === 4 && this.current_page > 1) {
      this.current_page--;
    } else if (e.direction === 2 && this.current_page < this.last_page) {
      this.current_page++;
    }
    this.loading = true;
    this.cargarHistorial();
  }

  buscar() {
    this.loading = true;
    this.cargarHistorial();
  }

  limpiarFiltro() {
    this.loading = true;
    this.busqueda = '';
    this.max = undefined;
    this.min = undefined;
    this.cargarHistorial();

  }



}
