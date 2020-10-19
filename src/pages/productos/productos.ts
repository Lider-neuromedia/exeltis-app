import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { DetalleProducto } from '../detalle-producto/detalle-producto';
import { DatabaseServiceProvider } from '../../providers/database-service/database-service';
import { Storage } from '@ionic/storage';
import { clearOverrides } from '@angular/core/src/view';
import { urlImagen } from '../../commons/Constants';

/**
 * Generated class for the ProductosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'productos',
  templateUrl: 'productos.html',
})
export class Productos {

  filtro:any = {};
  lineas:any = [];
  categorias:any = [];
  productos:any;
  current_page:number = 1;
  last_page:number;
  paginationProgress:string = "0%";
  urlImagen: string;
  dataOff: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public api: ApiProvider, public loadingCtrl: LoadingController,
    private alertCtrl: AlertController, public databaseProvider: DatabaseServiceProvider, 
    public storage: Storage) {}

  ionViewDidLoad() {
    
    this.listar();    
    
    this.api.lineasProducto().subscribe(data => {
      
      this.lineas = data;
      
      this.api.categoriasProducto().subscribe(data => {
        
        this.categorias = data;       
        
      });
    });
    
    
  }
  
  listar(){
    
    let loading = this.loadingCtrl.create({
      content: 'Cargando ...',
      spinner: 'crescent'
    });
  
    loading.present();

    this.api.page = this.current_page;

    //verificar si se está trabajando sin conexión a internet
    this.storage.get('offline').then(dataOff => {

      this.dataOff = dataOff;

      if (dataOff) {

        this.urlImagen = "/assets/images/logos/";

        let join = "";
        let condition = "";

        console.log("filtro:");
        console.log(this.filtro);
        if (this.filtro.linea!=""&&this.filtro.linea!=undefined) {
          console.log("hay filtro de linea")
          console.log(this.filtro.linea);
          join += " INNER JOIN productos_linea ON productos.id=productos_linea.producto_id ";
          condition += ((condition=="")?"":" AND ")+" productos_linea.linea_id = '"+this.filtro.linea+"' ";
        }
        if (this.filtro.categoria!=""&&this.filtro.categoria!=undefined) {
          console.log("hay filtro de categoria")
          console.log(this.filtro.categoria);
          join += " INNER JOIN productos_categoria ON productos.id=productos_categoria.producto_id ";
          condition += ((condition=="")?"":" AND ")+" productos_categoria.categoria_id = '"+this.filtro.categoria+"' ";
        }
        if (this.filtro.busqueda!=""&&this.filtro.busqueda!=undefined) {
          console.log("hay filtro de busqueda")
          console.log(this.filtro.busqueda);
          condition += ((condition=="")?"":" AND ")+" productos.nombre like '%"+this.filtro.busqueda+"%' ";
        }
        console.log("SQL = "+" productos"+ join + 
        ((condition=="")?" page = '"+this.api.page+"'":condition));
        this.databaseProvider.getCustomData("", "productos"+join, 
          ((condition=="")?" page = '"+this.api.page+"'":condition))
          .then(resultado => {

            if (condition != "") {
              let paginas = Math.ceil(resultado.length / 6);
              console.log("paginas: "+paginas);
              
              this.databaseProvider.getCustomData("", "productos"+join, 
                ((condition=="")?" page = '"+this.api.page+"'":condition +
                " LIMIT 6 "+
                " OFFSET " + ( (this.current_page*6)-6 )))
                .then(resultado => {
                  this.productos = resultado;

                  this.last_page = paginas;
                  this.avancePaginacion();
                
                
                  loading.dismiss();

                })
                .catch(err => {
                  console.log("ocurrió un error consultando productos...");
                  console.log(err);
                  loading.dismiss();
                });

            }else{

              console.log("Consultando productos...");
              console.log(resultado);
              this.productos = resultado;
  
  
              this.storage.get('last_pageProd').then(last_pageProd => {
                this.last_page = last_pageProd;
                this.avancePaginacion();
              });
            }

            if (this.lineas.length<=0||this.categorias.length<=0) {
              //obtener lineas para filtros
              this.databaseProvider.getCustomData("DISTINCT linea_id AS id, nombre", "productos_linea", 
              "")
                .then(lineas => {
                  console.log("Consultando productos...");
                  console.log(lineas);
                  this.lineas = lineas;

                  //obtener categorias para filtros
                  this.databaseProvider.getCustomData("DISTINCT categoria_id AS id, nombre", 
                    "productos_categoria", " true ORDER BY nombre ASC ")
                    .then(categorias => {
                      console.log("Consultando categorias...");
                      console.log(categorias);
                      this.categorias = categorias;


                      loading.dismiss();
                    })
                    .catch(err => {
                      console.log("ocurrió un error consultando categorias...");
                      console.log(err);
                      loading.dismiss();
                    });


                })
                .catch(err => {
                  console.log("ocurrió un error consultando lineas...");
                  console.log(err);
                  loading.dismiss();
                });
            }else{
              loading.dismiss();
            }

            
          })
          .catch(err => {
            console.log("ocurrió un error consultando productos...");
            console.log(err);
            loading.dismiss();
          });

      }else{//trabajo online

        this.urlImagen = urlImagen;

        this.api.getProductos(this.filtro).subscribe(data => {

          let productoResponse:any = data;

          this.last_page = productoResponse.last_page;

          this.avancePaginacion();

          // obteniendo respuesta sin filtros      
          if(productoResponse.hasOwnProperty('data')){

            if(Array.isArray(productoResponse.data)){

              this.productos = productoResponse.data;

            } else{

              // Obteniendo respuesta con filtros

              this.productos = Array();

              let productosKeys = Object.keys(productoResponse.data);

              for(var i=0; i < productosKeys.length; i++){

                this.productos.push(productoResponse.data[productosKeys[i]]);
              }
            }        
          }

          loading.dismiss();

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

  paginacion(e){
    
    if(e.direction == 4 && this.current_page > 1){

      this.current_page--;

    } else if(e.direction == 2 && this.current_page < this.last_page){

      this.current_page++;
    }

    
    console.log(this.last_page);

    this.listar();
  }

  buscar(){

    this.current_page = 1;
    this.listar();
  }

  detalleProducto(producto){

    this.navCtrl.push(DetalleProducto, {producto: producto, offline: this.dataOff});
  }

  limpiarFiltro(){

    this.filtro.linea = "";
    this.filtro.categoria = "";
    this.filtro.busqueda = "";
  }

  avancePaginacion(){

    this.paginationProgress = (this.current_page * 100) / this.last_page + "%";
  }
}
