import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Productos } from './productos';

@NgModule({
  imports: [
    IonicPageModule.forChild(Productos),
  ]
})
export class ProductosPageModule { }
