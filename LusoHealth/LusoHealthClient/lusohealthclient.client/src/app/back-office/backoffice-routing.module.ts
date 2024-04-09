import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EstatisticasClassificacaoProfissionalComponent } from './estatisticas-classificacao-profissional/estatisticas-classificacao-profissional.component';
import { EstatisticasConsultasProfissionalComponent } from './estatisticas-consultas-profissional/estatisticas-consultas-profissional.component';
import { EstatisticasProfissionalConcelhoComponent } from './estatisticas-profissional-concelho/estatisticas-profissional-concelho.component';
import { EstatisticasUtilizadoresAnoComponent } from './estatisticas-utilizadores-ano/estatisticas-utilizadores-ano.component';
import { EstatisticasUtilizadoresRegistadosComponent } from './estatisticas-utilizadores-registados/estatisticas-utilizadores-registados.component';

const routes: Routes = [
  { path: 'statistics-professional-classification', component: EstatisticasClassificacaoProfissionalComponent },
  { path: 'statistics-professional-appointments', component: EstatisticasConsultasProfissionalComponent },
  { path: 'statistics-professional-county', component: EstatisticasProfissionalConcelhoComponent },
  { path: 'statistics-users-year', component: EstatisticasUtilizadoresAnoComponent },
  { path: 'statistics-users-registered', component: EstatisticasUtilizadoresRegistadosComponent },
  { path: 'statistics-professional-year', component: EstatisticasUtilizadoresRegistadosComponent }
]


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})

export class BackOfficeRoutingModule { }


