import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstatisticasClassificacaoProfissionalComponent } from './estatisticas-classificacao-profissional/estatisticas-classificacao-profissional.component';
import { EstatisticasUtilizadoresRegistadosComponent } from './estatisticas-utilizadores-registados/estatisticas-utilizadores-registados.component';
import { EstatisticasUtilizadoresAnoComponent } from './estatisticas-utilizadores-ano/estatisticas-utilizadores-ano.component';
import { EstatisticasProfissionalConcelhoComponent } from './estatisticas-profissional-concelho/estatisticas-profissional-concelho.component';
import { EstatisticasConsultasProfissionalComponent } from './estatisticas-consultas-profissional/estatisticas-consultas-profissional.component';



@NgModule({
  declarations: [EstatisticasClassificacaoProfissionalComponent, EstatisticasUtilizadoresRegistadosComponent,
    EstatisticasUtilizadoresAnoComponent, EstatisticasProfissionalConcelhoComponent,
    EstatisticasConsultasProfissionalComponent],
  imports: [
    CommonModule
  ]
})
export class BackofficeModule { }
