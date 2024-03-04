import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MarcarConsultaComponent } from './marcar-consulta/marcar-consulta.component';
import { MarcacoesComponent } from './marcacoes/marcacoes.component';
import { MapaComponent } from './mapa/mapa.component';
import { GoogleMapsModule } from '@angular/google-maps';


const routes: Routes = [
  { path: 'make-appointment', component: MarcarConsultaComponent },
  { path: 'services', component: MarcacoesComponent },
  { path: 'map', component: MapaComponent }
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
