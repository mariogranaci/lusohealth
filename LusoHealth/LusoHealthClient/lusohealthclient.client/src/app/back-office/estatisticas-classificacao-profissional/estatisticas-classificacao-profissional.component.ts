import { Component } from '@angular/core';
import { BackOfficeService } from '../backoffice.service';

@Component({
  selector: 'app-estatisticas-classificacao-profissional',
  templateUrl: './estatisticas-classificacao-profissional.component.html',
  styleUrl: './estatisticas-classificacao-profissional.component.css'
})
export class EstatisticasClassificacaoProfissionalComponent {
  constructor(public service: BackOfficeService) { }

  ngOnInit() {
    this.getProfessionalsByRanking();
  }

  getProfessionalsByRanking() {
    this.service.getProfessionalsByRanking().subscribe(
      (response: any) => {
        console.log("Success!", response);
      },
      (error: any) => {
        console.error('Error: ', error);
      }
    );
  }
}
