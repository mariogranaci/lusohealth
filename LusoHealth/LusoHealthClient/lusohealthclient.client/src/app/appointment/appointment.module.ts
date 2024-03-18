import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultaPacienteComponent } from './consulta-paciente/consulta-paciente.component';
import { ConsultaProfissionalComponent } from './consulta-profissional/consulta-profissional.component';
import { AppointmentRoutingModule } from './appointment-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    ConsultaPacienteComponent,
    ConsultaProfissionalComponent
  ],
  imports: [
    CommonModule,
    AppointmentRoutingModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    HttpClientModule
  ]
})
export class AppointmentModule { }
