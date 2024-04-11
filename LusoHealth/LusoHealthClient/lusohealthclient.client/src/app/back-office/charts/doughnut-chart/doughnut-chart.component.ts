import { Component, Input } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrl: './doughnut-chart.component.css'
})
export class DoughnutChartComponent {
  @Input() data: any;

  constructor() { }

  ngOnInit() {
    this.RenderChart();
  }

  RenderChart() {
    console.log(this.data);
    const myChart = new Chart("doughnut-chart", {
      type: 'doughnut',
      data: {
        labels: this.data.map((s: { specialtyName: any; }) => s.specialtyName),
        datasets: [{
          label: "Número de consultas por especialidade",
          data: this.data.map((s: { numberOfAppointments: any; }) => s.numberOfAppointments),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        },
        layout: {
          padding: {
            top: 20, // Adjust this value to create space between the title and the chart
            bottom: 20,
            left: 20,
            right: 20
          }
        },
        cutout: '30%',
        
      }
    });
  }
}

