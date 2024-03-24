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
  availableSlots: AvailableSlot[] = [];
  displayedAvailabity: boolean = false;

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
    if (this.serviceInfo) {
      const newAppointment = new Appointment(null, null, null, null, null, 1, null, null, null, parseInt(this.serviceId));

      this.service.addAppointment(newAppointment).subscribe(
        response => {
          console.log('Consulta marcada com sucesso:', response.appointmentId);
          this.payment(response.appointmentId);
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

  private payment(appointmentId: number) {
    if (this.serviceInfo) {
      this.service.requestStripeSession(this.serviceInfo.pricePerHour, appointmentId, this.serviceInfo.specialty);
    }
    else {
      this.errorMessages.push("Algo correu mal.");
    }
  }

  toggleCalendar() {
    this.checked = !this.checked;

    if (this.checked && !this.displayedAvailabity) {
      this.getAvailability();
    }
  }

  getAvailability() {
    /*this.service.getAvailableSlots(parseInt(this.serviceId), )

    const parentDiv = document.getElementById('available-slot');

    for (const slot of slots) {
      const container = document.createElement('div');
      container.classList.add('box-slot');

      const leftDiv = document.createElement('div');
      leftDiv.classList.add('left');
      const timeDiv = document.createElement('div');
      timeDiv.classList.add('hours-slots');

      const timeText = document.createElement('b');
      timeText.textContent = '${slot.time}';
      timeDiv.appendChild(timeText);
      leftDiv.appendChild(timeDiv);

      const dateDiv = document.createElement('div');
      dateDiv.classList.add('data-slots');
      dateDiv.textContent = '${slot.date}';
      leftDiv.appendChild(dateDiv);

      container.appendChild(leftDiv);

      const rightDiv = document.createElement('div');
      rightDiv.classList.add('right');

      const typeDiv = document.createElement('div');
      typeDiv.classList.add('type-appointment');
      typeDiv.textContent = '&{slot.type_of_apointment}';
      rightDiv.appendChild(typeDiv);

      const button = document.createElement('button');
      button.classList.add('btn-edit');
      button.textContent = 'Marcar';
      rightDiv.appendChild(button);

      container.appendChild(rightDiv);

      if (parentDiv) {
        parentDiv.appendChild(container);
      } else {
        console.error(`Div não foi encontrada`);
      }
    }

    this.displayedAvailabity = true;
  }*/
  }
}
