import { Component } from '@angular/core';
import { BackOfficeService } from '../backoffice.service';


@Component({
  selector: 'app-estatisticas-consultas-profissional',
  templateUrl: './estatisticas-consultas-profissional.component.html',
  styleUrl: './estatisticas-consultas-profissional.component.css'
})
export class EstatisticasConsultasProfissionalComponent {
  data: any[] = [];
  dataLoaded: boolean = false;
  chart: any;
  selectedOption: number = 0;
  filterOptions: any[] = [];

  constructor(public backoffice: BackOfficeService) { }

  ngOnInit() {
    this.getAppointmentsPerProfessional();
    this.getCategorys();
  }

  applyFilter(selectedOption: any) {
    if (selectedOption !== null && selectedOption !== undefined) {
      this.selectedOption = selectedOption.target.value;
    }

    console.log("here", this.selectedOption);
    this.dataLoaded = false;
    this.getAppointmentsPerProfessional();
  }

  getAppointmentsPerProfessional() {
    this.backoffice.getAppointmentsPerProfessional(this.selectedOption).subscribe(
      (response: any) => {
        console.log("Success!");
        this.data = response;
        this.dataLoaded = true;
        console.log(this.data);
      },
        (error: any) => {
        console.error('Error: ', error);
      }
    );
  }

  getCategorys() {
    this.backoffice.getProfessionalTypes().subscribe(
      (response: any) => {
        console.log("Success!", response);
        this.filterOptions = response;
        this.filterOptions.push({
          id: 0,
          name: 'Categorias'
        });

        console.log(this.filterOptions);
      },
      (error: any) => {
        console.error('Error: ', error);
      }
    );
  }
}
