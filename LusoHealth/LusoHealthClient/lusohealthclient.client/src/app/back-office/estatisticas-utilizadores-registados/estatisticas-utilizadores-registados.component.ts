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

  private users: User[] = [];
  public userCount: number = 0;
  public professionalCount: number = 0;

  constructor(public service: BackOfficeService) { }

  ngOnInit() {
    this.getUsers();
  }


  getUsers() {
    this.service.getUsers().pipe();
  }
}
