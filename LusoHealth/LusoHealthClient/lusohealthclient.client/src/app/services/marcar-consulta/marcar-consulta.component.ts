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
  serviceInfo: MakeAppointment | null = null;
  private unsubscribe$ = new Subject<void>();
  categoria: string = "";
  especialidade: string = "";
  errorMessages: string[] = [];

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
        this.serviceInfo = serviceInfo;
        if (name) {
          name.innerText = this.serviceInfo.professionalName;
          this.categoria = this.serviceInfo.category;
          this.especialidade = this.serviceInfo.specialty;
        }
        console.log(serviceInfo);
      },
      error => {
        console.error(error);
        this.errorMessages.push("Error ao carregar informação do serviço.");
      }
    );
  }

  marcarClick() {
    //this.payement();

    if (this.serviceInfo) {
      const newAppointment = new Appointment(null, "praceta", "Presential", "descrição", "PaymentPending", 1, "5", "2", parseInt(this.serviceId));

      this.service.addAppointment(newAppointment).subscribe(
        response => {
          console.log('Consulta marcada com sucesso:', response.appointmentId);
          this.payement(response.appointmentId);
        },
        error => {
          console.error('Erro ao adicionar o appointment:', error);
          this.errorMessages.push("Erro ao marcar consulta.");
        }
      )
    }
    else {
      this.errorMessages.push("Algo correu mal.");
    }
     
  }

  payement(appointmentId: number) {
    if (this.serviceInfo) {
      this.service.requestStripeSession(this.serviceInfo.pricePerHour, appointmentId, this.serviceInfo.specialty);
    }
    else {
      this.errorMessages.push("Algo correu mal.");
    }
  }

  toggleCalendar() {
    this.checked = !this.checked;
  }
}
