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
  public userCount: number = 0;
  public professionalCount: number = 0;
  public userEmailCount: number = 0;
  public professionalEmailCount: number = 0;

  constructor(public service: BackOfficeService) { }

  ngOnInit() {
    this.getValidUsers();
  }

   getValidUsers() {
     this.service.getValidUsers().subscribe(
       (response: any) => {
         console.log("Success!", response);
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
}

