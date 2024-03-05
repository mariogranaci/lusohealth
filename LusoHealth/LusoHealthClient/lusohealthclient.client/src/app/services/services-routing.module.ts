import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MarcarConsultaComponent } from './marcar-consulta/marcar-consulta.component';
import { MarcacoesComponent } from './marcacoes/marcacoes.component';
import { MapaComponent } from './mapa/mapa.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentFailureComponent } from './payment-failure/payment-failure.component';


const routes: Routes = [
  { path: 'make-appointment', component: MarcarConsultaComponent },
  { path: 'services', component: MarcacoesComponent },
  { path: 'map', component: MapaComponent },
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'payment-failure', component: PaymentFailureComponent }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
