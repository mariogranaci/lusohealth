import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DisponibilidadeComponent } from './disponibilidade/disponibilidade.component';

const routes: Routes = [
  { path: 'availability', component: DisponibilidadeComponent }
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
