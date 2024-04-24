import { Component, ViewChild } from '@angular/core';
import { BackOfficeService } from '../backoffice.service';
import { BarChartComponent } from '../charts/bar-chart/bar-chart.component';

@Component({
  selector: 'app-estatisticas-utilizadores-ano',
  templateUrl: './estatisticas-utilizadores-ano.component.html',
  styleUrl: './estatisticas-utilizadores-ano.component.css'
})
export class EstatisticasUtilizadoresAnoComponent {
  @ViewChild(BarChartComponent) childComponent: BarChartComponent | undefined;

  data: any[] = [];
  dataLoaded: boolean = false;
  chart: any;
  selectedOption: string = "Patients";

  constructor(public backoffice: BackOfficeService) { }

  ngOnInit() {
    this.getAnuallyRegisteredUsers();
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.dataLoaded = false;
    this.childComponent?.setSelectedOption(option);
    this.dataLoaded = true;
  }

  getAnuallyRegisteredUsers() {
    this.backoffice.getAnuallyRegisteredUsers().subscribe(
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
}
