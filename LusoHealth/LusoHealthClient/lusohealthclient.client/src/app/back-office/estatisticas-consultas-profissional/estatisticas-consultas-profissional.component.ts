import { Component } from '@angular/core';
import { BackOfficeService } from '../backoffice.service';

@Component({
  selector: 'app-estatisticas-consultas-profissional',
  templateUrl: './estatisticas-consultas-profissional.component.html',
  styleUrl: './estatisticas-consultas-profissional.component.css'
})
export class EstatisticasConsultasProfissionalComponent {
  private users: any[] = [];
  public userCount: number = 0;
  public professionalCount: number = 0;
  public userEmailCount: number = 0;
  public professionalEmailCount: number = 0;

  constructor(public service: BackOfficeService) { }

  ngOnInit() {
    this.getAppointmentsPerProfessional();
  }

  getAppointmentsPerProfessional() {
    this.service.getAppointmentsPerProfessional().subscribe(
      (response: any) => {
        console.log("aaaaaaaaaaaaaaaaaa!", response);
      },
        (error: any) => {
        console.error('Error: ', error);
      }
    );
  }
}
