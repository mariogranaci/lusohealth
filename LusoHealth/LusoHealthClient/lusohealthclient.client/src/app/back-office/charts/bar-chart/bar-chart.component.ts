import { Component, Input } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css'
})
export class BarChartComponent {
  @Input() data: any;
  @Input() dataType: string = 'Professional';
  @Input() dateType: string = 'Year';

  chart: any;

  constructor() { }

  ngOnInit() {
    this.RenderChart();
  }

  setSelectedOption(option: string) {
    this.dataType = option;
    console.log(this.dataType);
    this.chart.destroy();
    this.RenderChart();
  }

  setSelectedDateOption(option: string){
    this.dateType = option;

    this.chart.destroy();
    this.RenderChart()
  }

  RenderChart() {
    var data = this.dataType === 'Client' ? this.data.patients : this.data.professionals;

    const label = this.dataType === 'Client' ? 'Clientes' : 'Profissionais';
    const unit = this.dateType === 'Year' ? 'ano' : this.dateType === 'Month' ? 'mês' : 'dia';
    

    this.chart = new Chart("bar-chart", {
      type: 'bar',
      data: {
        labels: data.map((y: { key: any; }) => y.key),
        datasets: [{
          label: `Número de ${label} registados por ${unit}`,
          data: data.map((c: { count: any; }) => c.count),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      },
    });

  }
}

