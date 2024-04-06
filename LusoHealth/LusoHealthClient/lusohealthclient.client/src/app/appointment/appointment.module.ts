import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultaPacienteComponent } from './consulta-paciente/consulta-paciente.component';
import { ConsultaProfissionalComponent } from './consulta-profissional/consulta-profissional.component';
import { AppointmentRoutingModule } from './appointment-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt-PT';
import { ChatComponent } from './chat/chat.component';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    ConsultaPacienteComponent,
    ConsultaProfissionalComponent,
    ChatComponent
  ],
  imports: [
    CommonModule,
    AppointmentRoutingModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    HttpClientModule
  ],
  providers: [
    // Registra a localidade pt-PT como padrão para todo o app
    { provide: LOCALE_ID, useValue: 'pt-PT' }
  ],
})
export class AppointmentModule { }
