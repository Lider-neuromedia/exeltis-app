import { Component } from '@angular/core';
import { IonicPage, NavParams, LoadingController } from 'ionic-angular';
import { trigger, state, style } from '@angular/animations';
import { resourcesUrl } from '../../commons/Constants';

@IonicPage()
@Component({
  selector: 'detalle-producto',
  templateUrl: 'detalle-producto.html',
  animations: [
    trigger('itemState', [
      state('enable', style({display: 'block'})),
      state('disable', style({display: 'none'}))
    ])
  ]
})
export class DetalleProducto {  

  producto:any = {};
  hayArchivo:boolean;
  urlArchivo:any;
  loading:any;
  zoomVisor:number = 1.0;
  menuProductosState:string = 'disable';
  //indica si se trabaja sin conexión
  offline: boolean = false;

  constructor(
    public navParams: NavParams,
    private loadingCtrl: LoadingController) { }

  ionViewDidLoad() {
    
    this.producto = this.navParams.get('producto');
    this.offline = this.navParams.get('offline');
    
    if(this.producto.url_documento) {

      this.loading = this.loadingCtrl.create({
        content: 'Cargando ...',
        spinner: 'crescent'
      });
      this.loading.present();

      if (this.offline) {
        
        this.hayArchivo = true;
        this.urlArchivo = "/assets/productos/"+this.producto.url_documento;

      }else{
        
        this.hayArchivo = true;

        this.urlArchivo = resourcesUrl+"documentos/" + this.producto.url_documento;
        
        /*this.loadPdf("http://exeltis.pruebasneuro.co/images/documentos/" + this.producto.url_documento).then(document => {
          
          this.urlArchivo = document;
        },
        error => {
          
          console.log(error);
        });*/      
        
      }
      
    } else{
      
      this.hayArchivo = false;
    }

    this.loading.dismiss();

  }  
  
  loadPdf(url) {
    
    return new Promise<string>((resolve, reject) => {
  
      const request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'blob';
  
      request.onload = () => {
        
        if (request.status === 200) {

          const blob = new Blob([request.response], { type: 'application/pdf' });
          resolve(URL.createObjectURL(blob));

        } else{

          reject("error");
        }
      };
  
      request.send();
    });
  }

  pdfLoading(pdf){

    console.log("loading pdf");
    this.loading.present();
  }

  pdfLoadedPage(pdf){

    console.log("pdf loaded");
    this.loading.dismiss();
  }

  zoomIn(){

    this.zoomVisor += 0.1;
  }

  zoomOut(){

    if(this.zoomVisor > 0){

      this.zoomVisor -= 0.1;
    }
  }

  menuProductos(){

    if(this.menuProductosState == "disable"){

      this.menuProductosState = "enable";

    } else{

      this.menuProductosState = "disable";
    }
  }

  // this.urlArchivo = this.sanitizer.bypassSecurityTrustResourceUrl(this.producto.url_documento);   


  // const fileTransfer : FileTransferObject = this.transfer.create();
      // fileTransfer.download(this.producto.url_documento, this.file.dataDirectory + this.producto.id + '.pdf').then(entry => {
        
      //   console.log('bn');     
      //   // this.urlArchivo = entry.toURL();    
        
        
      // }, error => {

      //   console.log("error");
      // });

  // loadPdf(url) {
  //   const xhr = new XMLHttpRequest();
  //   xhr.open('GET', url, true);
  //   xhr.responseType = 'blob';

  //   xhr.onload = (e: any) => {
  //     console.log(xhr);
  //     if (xhr.status === 200) {
  //       const blob = new Blob([xhr.response], { type: 'application/pdf' });
  //       this.urlArchivo = URL.createObjectURL(blob);
  //     }
  //   };

  //   xhr.send();
  // }



  //   // var arrBuffer = this.base64ToArrayBuffer(entry.toURL());
  //   // this.urlArchivo = new Blob([arrBuffer], { type: 'application/pdf' });

  // base64ToArrayBuffer(data) {
  //   var input = data.substring(data.indexOf(',') + 1);
  //   var binaryString = window.atob(input);
  //   var binaryLen = binaryString.length;
  //   var bytes = new Uint8Array(binaryLen);
  //   for (var i = 0; i < binaryLen; i++) {
  //     var ascii = binaryString.charCodeAt(i);
  //     bytes[i] = ascii;
  //   }
  //   return bytes;
  // };

}
