import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { SQLite } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';

import localeEs from '@angular/common/locales/es-CO';
registerLocaleData(localeEs);

import { MyApp } from './app.component';
import { Medicos } from '../pages/medicos/medicos';
import { Agenda } from '../pages/agenda/agenda';
import { Login } from '../pages/login/login';
import { Productos } from '../pages/productos/productos';
import { DetalleProducto } from '../pages/detalle-producto/detalle-producto';
import { Presentacion } from '../pages/presentacion/presentacion';
import { HerramientasPage } from '../pages/herramientas/herramientas';
import { HistorialPage } from '../pages/historial/historial';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpClientModule } from '@angular/common/http';
import { ApiProvider } from '../providers/api/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatabaseServiceProvider } from '../providers/database-service/database-service';
import { NetworkProvider } from '../providers/network/network';
import { HistorialProvider } from '../providers/historial/historial';

@NgModule({
  declarations: [
    MyApp,
    Login,
    Medicos,
    Agenda,
    Productos,
    DetalleProducto,
    Presentacion,
    HerramientasPage,
    HistorialPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp, {
      navExitApp: false
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Login,
    Medicos,
    Agenda,
    Productos,
    DetalleProducto,
    Presentacion,
    HerramientasPage,
    HistorialPage
  ],
  providers: [
    StatusBar,
    SQLite,
    Network,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ApiProvider,
    DatabaseServiceProvider,
    NetworkProvider,
    HistorialProvider,
    { provide: LOCALE_ID, useValue: 'es-CO' }
  ]
})

export class AppModule { }
