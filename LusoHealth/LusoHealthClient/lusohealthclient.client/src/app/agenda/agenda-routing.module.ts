import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DisponibilidadeComponent } from './disponibilidade/disponibilidade.component';
import { AgendaPacienteComponent } from './agenda-paciente/agenda-paciente.component';
import { HistoricoConsultasComponent } from './historico-consultas/historico-consultas.component';
import { AgendaProfissionalComponent } from './agenda-profissional/agenda-profissional.component';


const routes: Routes = [
  { path: 'availability', component: DisponibilidadeComponent },
  { path: 'patient-agenda', component: AgendaPacienteComponent },
  { path: 'historico-consultas', component: HistoricoConsultasComponent },
  { path: 'professional-agenda', component: AgendaProfissionalComponent }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AgendaRoutingModule { }
