import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcarConsultaComponent } from './marcar-consulta/marcar-consulta.component';
import { ServicesRoutingModule } from './services-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { CalendarioComponent } from './calendario/calendario.component';
import { MarcacoesComponent } from './marcacoes/marcacoes.component';
import { FormsModule } from '@angular/forms';
import { MapaComponent } from './mapa/mapa.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentFailureComponent } from './payment-failure/payment-failure.component';


@NgModule({
  declarations: [
    MarcarConsultaComponent,
    MarcacoesComponent,
    MapaComponent,
    PaymentSuccessComponent,
    PaymentFailureComponent
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    RouterModule,
    SharedModule,
    CalendarioComponent,
    FormsModule,
    MatPaginatorModule,
  ],
  exports: [
    HttpClientModule
  ]
})
export class ServicesModule { }
