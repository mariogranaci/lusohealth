import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../authentication/authentication.service';
import { User } from '../../shared/models/authentication/user';
import { ConfirmEmail } from '../../shared/models/authentication/confirmEmail';
import { Subject, take, takeUntil } from 'rxjs';
import { ServicesService } from '../services.service';
import { MakeAppointment } from '../../shared/models/services/makeAppointment';
import { Appointment } from '../../shared/models/services/appointment';


@Component({
  selector: 'app-marcar-consulta',
  templateUrl: './marcar-consulta.component.html',
  styleUrl: './marcar-consulta.component.css'
})
export class MarcarConsultaComponent {
  checked = false;
  serviceId: string = "";
  private unsubscribe$ = new Subject<void>();
  categoria: string = "";
  especialidade: string = "";

  constructor(private authenticationService: AuthenticationService,
    private router: Router,
    private activateRoute: ActivatedRoute, private service: ServicesService) {

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  

  ngOnInit(): void {

    this.getServiceId().then(() => {
      this.getServiceInfo();
    });
  }

  getServiceId(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.authenticationService.user$.pipe(take(1)).subscribe({
        next: (user: User | null) => {
          if (!user) {
            this.router.navigateByUrl('/');
          } else {
            this.activateRoute.queryParamMap.subscribe({
              next: (params: any) => {
                this.serviceId = params.get('serviceId')
                resolve();
              }
            });
          }
        }
      });
    });
  }


  getServiceInfo() {
    const name = document.getElementById('name-title');
    this.service.getServiceInfo(parseInt(this.serviceId)).pipe(takeUntil(this.unsubscribe$)).subscribe(
      (serviceInfo: MakeAppointment) => {
        if (name) {
          name.innerText = serviceInfo.professionalName;
          this.categoria = serviceInfo.category;
          this.especialidade = serviceInfo.specialty;
        }
        console.log(serviceInfo);
      },
      error => {
        console.log(error);
      }
    );
  }

  marcarClick() {
    const newAppointment = new Appointment(null, "praceta", "Presential", "descrição", "Pending", 1, "5", "2" , parseInt(this.serviceId));

    this.service.addAppointment(newAppointment).subscribe(
      response => {
        console.log('Appointment adicionado com sucesso:', response);
      },
      error => {
        console.error('Erro ao adicionar o appointment:', error);
      }
    )
  }

  toggleCalendar() {
    this.checked = !this.checked;
  }
}
