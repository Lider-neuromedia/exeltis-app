import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { apiUrl, resourcesUrl } from '../../commons/Constants';


@Injectable()
export class ApiProvider {

  // apiUrl:string = "http://exeltis-ventas.test/api/";
  // apiUrl:string = "http://pruebasneuro.co/N-1032/api/";
  // apiUrl:string = "http://www.exeltis.pruebasneuro.co/api/";

  // resourcesUrl:string = "http://www.exeltis.pruebasneuro.co/images/";

  apiUrl:string = apiUrl;

  resourcesUrl:string = resourcesUrl;

  api_token:string = '';
  visitador_id:any = 0;
  busqueda:string = ''; 
  page:any;

  constructor(public http: HttpClient, public storage: Storage) {}
  
  autenticacion(auth:any){

    let options = {
      params: new HttpParams().set('username', auth.username)
                              .set('password', auth.password)
    }

    return this.http.get(this.apiUrl + 'login', options);
  }

  getInfoApi(Observable){
    
    /*return new Promise((resolve, reject) => {
      try {
        resolve( Observable.subscribe(resolve) ); 
      } catch (error) {
        console.log("ERRORRRRR");
        reject(
          console.log(error)
        ); 
      }
    })*/
    //return new Promise(resolve => { Observable.subscribe(resolve); })
    return new Promise((resolve, reject) => { Observable.subscribe(
        data => {
          resolve( data );
        },
        err => {
          console.log("Error occured.");
          console.log(err);
          reject(err);
        }
      );
    })

  }

  getStoredData(){

    return this.storage.ready().then(() => {

      return this.storage.get('userData');
    });
  }

  getMedicos(){

    return this.getStoredData().then((data:any) => {

      this.api_token = data.api_token;
      this.visitador_id = data.visitador.id;

      let options: any = {
        params: new HttpParams().set('api_token', this.api_token)
                                .set('visitador_id', this.visitador_id)
                                .set('page', this.page)
      }
  
      if(this.busqueda.length > 0){
  
        options.params = options.params.set('busqueda', this.busqueda);
  
      } else{
  
        options.params = options.params.delete('busqueda');
      }    
      
      return this.getInfoApi(this.http.get(this.apiUrl + 'medicos', options));
    });
  }

  lineasProducto(){

    let options = {
      params: new HttpParams().set('api_token', this.api_token)
    }

    return this.http.get(this.apiUrl + 'lineas', options);
  }

  categoriasProducto(){

    let options = {
      params: new HttpParams().set('api_token', this.api_token)
    }

    return this.http.get(this.apiUrl + 'categorias', options);
  }  

  getProductos(filtro:any){

    let parametros = new HttpParams().set('api_token', this.api_token)
                                     .set('page', this.page);

    if(filtro.hasOwnProperty('linea')){

      parametros = parametros.set('linea', filtro.linea);
    }

    if(filtro.hasOwnProperty('categoria')){

      parametros = parametros.set('categoria', filtro.categoria);
    }

    if(filtro.hasOwnProperty('busqueda')){

      parametros = parametros.set('busqueda', filtro.busqueda);
    }

    let options = {
      params: parametros
    }

    return this.http.get(this.apiUrl + 'productos', options);
  }

  agendarMedico(medico:any, data:any){

    let info = {
      api_token: this.api_token,
      visitador_id: medico.visitador_id,
      medico_id: medico.medico_id,
      fecha:  data.fecha
    }

    let options = {
      params: new HttpParams().set('api_token', this.api_token)      
                              .set('visitador_id', medico.visitador_id)
                              .set('medico_id', medico.medico_id)
                              .set('fecha',  data.fecha)
      
    }

    return this.http.post(this.apiUrl + 'visita', JSON.stringify(info), options);
  }

  reagendarMedico(medico:any, data:any){

    let info = {
      api_token: this.api_token,
      fecha: data.fecha
    }

    let options = {
      params: new HttpParams().set('api_token', this.api_token)
                              .set('fecha', data.fecha)
    }

    return this.http.post(this.apiUrl + 'visita/' + medico.visita_id, JSON.stringify(info), options);
  }

  agendaDia(fecha){

    let options = {
      params: new HttpParams().set('api_token', this.api_token)
                              .set('visitador_id', this.visitador_id)                              
    }

    if(fecha){

      options.params = options.params.set('fecha', fecha);
    }

    return this.http.get(this.apiUrl + 'visitas', options);
  }

  obtenerDiasAgendadosMes(fecha){

    let options = {
      params: new HttpParams().set('api_token', this.api_token)
                              .set('visitador_id', this.visitador_id)
    }

    return this.http.get(this.apiUrl + 'visitas/dias-agendados/' + fecha, options);
  }

  abrirPresentacion(medico, visita, tipoVisita){

    let options = {
      params: new HttpParams().set('api_token', this.api_token)
                              .set('tipo_visita', tipoVisita)         
    }

    if(visita){

      options.params = options.params.set('visita_id', visita);

    } else{

      options.params = options.params.set('visitador_id', this.visitador_id);
    }

    return this.http.get(this.apiUrl + 'medicos/' + medico.medico_id + '/abrir-presentacion', options);
  }

  cerrarPresentacion(visita){

    let options = {
      params: new HttpParams().set('api_token', this.api_token)
    }

    return this.http.post(this.apiUrl + 'medicos/' + visita.id + '/cerrar-presentacion', JSON.stringify({a: 'a'}), options);
  }

  tiposVisitaDisponibles(data){

    let options = {
      params: new HttpParams().set('api_token', this.api_token)
                              .set('medico_id', data.medico_id)
                              .set('visitador_id', data.visitador_id)
    }

    return this.http.get(this.apiUrl + 'tipos-visita', options);
  }

  obtenerMedicosProductos(){

    return this.getStoredData().then((data:any) => {

      this.api_token = data.api_token;
      this.visitador_id = data.visitador.id;

      let options: any = {
        params: new HttpParams().set('api_token', this.api_token)
                                .set('visitador', this.visitador_id)
      }  
      
      return this.getInfoApi(this.http.get(this.apiUrl + 'presentaciones', options));
    });
    
  }

  cargarVisita(visita){

    console.log("visita: -> ", visita);

    /*
    headers: new HttpHeaders({
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin' : 'http//:localhost:8080'
      }),*/
    let options = {
      
      params: new HttpParams().set('api_token', this.api_token)
    }
    
    const formData = new FormData();
    formData.append('medico_id', visita.medico_id);
    formData.append('visitador_id', visita.visitador_id);
    
    if (visita.tipo_visita_id!=null&&visita.tipo_visita_id!='') {
      formData.append('tipo_visita_id', ((visita.tipo_visita_id==null)?"":visita.tipo_visita_id));  
    }
    
    formData.append('fecha', visita.fecha);

    if (visita.fechainicio!=null&&visita.fechainicio!='') {
      formData.append('fecha_inicio', ((visita.fechainicio==null)?"":visita.fechainicio));
    }

    if (visita.fechafin!=null&&visita.fechafin!='') {
      formData.append('fecha_fin', ((visita.fechafin==null)?"":visita.fechafin));
    }
    
    formData.append('agendada', visita.agendada);
    formData.append('terminada', visita.terminada);

    return this.getInfoApi(this.http.post(this.apiUrl + 'visita/offline', 
        formData, 
         options));
    // return this.http.post(this.apiUrl + 'visita/offline', 
    //     {
    //       headers: httpHeaders,
    //       medico_id: visita.medico_id, 
    //       visitador_id: visita.visitador_id, 
    //       tipo_visita_id: visita.tipo_visita_id, 
    //       fecha: visita.fecha,
    //       fecha_inicio: visita.fechainicio,
    //       fecha_fin: visita.fechafin,
    //       agendada: visita.agendada,
    //       terminada: visita.terminada
    //     }, 
    //      options);
  }

  actualizarVisita(visita){

    let options = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/x-www-form-urlencoded'
      }),
      params: new HttpParams().set('api_token', this.api_token)
    }

    /*let body1 = new URLSearchParams();
    body1.set('medico_id', visita.medico_id);
    body1.set('visitador_id', visita.visitador_id);
    body1.set('tipo_visita_id', ((visita.tipo_visita_id==null)?"":visita.tipo_visita_id));
    body1.set('fecha', visita.fecha);
    body1.set('fecha_inicio', ((visita.fechainicio==null)?"":visita.fechainicio));
    body1.set('fecha_fin', ((visita.fechafin==null)?"":visita.fechafin));
    body1.set('agendada', visita.agendada);
    body1.set('terminada', visita.terminada);*/
    
    let body =  "medico_id=" + visita.medico_id + 
    "&visitador_id=" + visita.visitador_id + 
    ((visita.tipo_visita_id==null||visita.tipo_visita_id=='')?"":"&tipo_visita_id=" + ((visita.tipo_visita_id==null)?"":visita.tipo_visita_id)) + 
    "&fecha=" + visita.fecha + 
    ((visita.fechainicio==null||visita.fechainicio=='')?"":"&fecha_inicio=" + ((visita.fechainicio==null)?"":visita.fechainicio)) + 
    ((visita.fechafin==null||visita.fechafin=='')?"":"&fecha_fin=" + ((visita.fechafin==null)?"":visita.fechafin)) + 
    "&agendada=" + visita.agendada +"&terminada=" + visita.terminada;
    
    console.log(body);
    /*const formData = new FormData();
    formData.append('medico_id', visita.medico_id);
    formData.append('visitador_id', visita.visitador_id);
    formData.append('tipo_visita_id', ((visita.tipo_visita_id==null)?"":visita.tipo_visita_id));
    formData.append('fecha', visita.fecha);
    formData.append('fecha_inicio', ((visita.fechainicio==null)?"":visita.fechainicio));
    formData.append('fecha_fin', ((visita.fechafin==null)?"":visita.fechafin));
    formData.append('agendada', visita.agendada);
    formData.append('terminada', visita.terminada);*/

//"medico_id=2314859&visitador_id=28&tipo_visita_id=1&fecha=2019-06-14&fecha_inicio=2019-06-15+10%3A25%3A50&fecha_fin=2019-06-15+10%3A40%3A30&agendada=1&terminada=1", 
    return this.getInfoApi(this.http.put(this.apiUrl + 'visita/update/' + visita.id_servidor, 
        body,        
        options));//'visita/update/3'
  }

}
