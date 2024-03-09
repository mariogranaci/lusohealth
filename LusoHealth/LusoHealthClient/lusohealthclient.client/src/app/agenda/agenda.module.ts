import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisponibilidadeComponent } from './disponibilidade/disponibilidade.component';
import { AgendaRoutingModule } from './agenda-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { AgendaPacienteComponent } from './agenda-paciente/agenda-paciente.component';
import { HistoricoConsultasComponent } from './historico-consultas/historico-consultas.component';



@NgModule({
  declarations: [
    DisponibilidadeComponent,
    AgendaPacienteComponent,
    HistoricoConsultasComponent
  ],
  imports: [
    CommonModule,
    AgendaRoutingModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    HttpClientModule
  ]
})
export class AgendaModule { }
