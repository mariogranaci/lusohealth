import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcarConsultaComponent } from './marcar-consulta/marcar-consulta.component';
import { ServicesRoutingModule } from './services-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { CalendarioComponent } from './calendario/calendario.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MarcarConsultaComponent,
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    RouterModule,
    SharedModule,
    CalendarioComponent,
    FormsModule,
  ],
  exports: [
    HttpClientModule
  ]
})
export class ServicesModule { }
