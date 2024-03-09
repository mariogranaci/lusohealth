import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisponibilidadeComponent } from './disponibilidade/disponibilidade.component';
import { AgendaRoutingModule } from './agenda-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    DisponibilidadeComponent
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
