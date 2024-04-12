import { Component } from '@angular/core';
import { BackofficeModule } from '../backoffice.module';
import { BackOfficeService } from '../backoffice.service';
import { User } from '../../shared/models/authentication/user';

@Component({
  selector: 'app-estatisticas-utilizadores-registados',
  templateUrl: './estatisticas-utilizadores-registados.component.html',
  styleUrl: './estatisticas-utilizadores-registados.component.css'
})
export class EstatisticasUtilizadoresRegistadosComponent {

  private users: any[] = [];
  userCount: number = 0;
  professionalCount: number = 0;
  userEmailCount: number = 0;
  professionalEmailCount: number = 0;

  compareRegistrationClients: string = '';
  compareRegistrationProfessionals: string = '';

  constructor(public service: BackOfficeService) { }

  ngOnInit() {
    this.getValidUsers();
    this.getRegistrationComparison();
  }

   getValidUsers() {
     this.service.getValidUsers().subscribe(
       (response: any) => {
         this.users = response;

         this.users.forEach(user => {
           if (user.userType === 'P') {
             this.professionalCount++;
             if (user.emailConfirmed) {
               this.professionalEmailCount++;
             }
           } else if (user.userType === 'U') {
             this.userCount++;
             if (user.emailConfirmed) {
               this.userEmailCount++;
             }
           }
         });
       },
       error => {
         console.error('Error: ', error);
       }
     );
  }

  getRegistrationComparison() {
    this.service.compareRegistration().subscribe(
      (response: any) => {
        console.log("resposta", response);
        this.compareRegistrationClients = response.patient;
        this.compareRegistrationProfessionals = response.professional;
      },
      (error: any) => {
        console.error('Error: ', error);
      }
    );
  }
}

