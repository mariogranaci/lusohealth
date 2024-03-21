import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultaProfissionalComponent } from './consulta-profissional/consulta-profissional.component';
import { ConsultaPacienteComponent } from './consulta-paciente/consulta-paciente.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'patient-appointment', component: ConsultaPacienteComponent },
  { path: 'professional-appointment', component: ConsultaProfissionalComponent }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
