import { Component, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
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
  selectedDateOption: string = "Year";

  constructor(public backoffice: BackOfficeService) { }

  ngOnInit() {
    this.getAnuallyRegisteredUsers(this.selectedDateOption);
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.dataLoaded = false;
    this.childComponent?.setSelectedOption(option);
    this.dataLoaded = true;
  }

  selectDateOption(option: string) {
    this.selectedDateOption = option;
    this.dataLoaded = false;
    this.getAnuallyRegisteredUsers(this.selectedDateOption);
    this.childComponent?.setSelectedDateOption(option);
    this.dataLoaded = true;
  }



  getAnuallyRegisteredUsers(timeUnit: string) {
    let startDate: string;
    let endDate: string;
    
    switch (timeUnit) {
      case 'Day':
        const startDateDay = new Date();
        startDateDay.setDate(startDateDay.getDate() - 7);
        startDate = this.getDateString(startDateDay.getFullYear(), startDateDay.getMonth(), startDateDay.getDate());
        endDate = this.getDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        break;
      case 'Month':
        const startDateMonth = new Date();
        startDateMonth.setDate(startDateMonth.getDate() - 30);
        startDate = this.getDateString(startDateMonth.getFullYear(), startDateMonth.getMonth(), startDateMonth.getDate());
        endDate = this.getDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        break;
      case 'Year':
        console.log('Year: ', new Date().getTime());
        startDate = this.getDateString(new Date().getFullYear() - 5, 0, 1);
        endDate = this.getDateString(new Date().getFullYear(), 11, 31);
        break;
      default:
        console.error('Invalid time unit');
        return;
    }

    this.backoffice.getAnuallyRegisteredUsers(startDate, endDate, timeUnit).subscribe(
      (response: any) => {
        console.log("Success!");
        this.data = response;
        this.dataLoaded = true;
        console.log("enfim",this.data);
      },
      (error: any) => {
        console.error('Error: ', error);
      }
    );
  }

  getDateString(year: number, month?: number, day?: number): string {
    const date = new Date(year, month || 0, day || 1);
    console.log(date);
    return formatDate(date, 'yyyy-MM-dd', 'pt-PT');
  }
}
