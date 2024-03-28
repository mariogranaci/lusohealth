import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../authentication/authentication.service';
import { User } from '../../shared/models/authentication/user';
import { ConfirmEmail } from '../../shared/models/authentication/confirmEmail';
import { Subject, take, takeUntil } from 'rxjs';
import { ServicesService } from '../services.service';
import { MakeAppointment } from '../../shared/models/services/makeAppointment';
import { Appointment } from '../../shared/models/services/appointment';
import { AvailableSlot } from '../../shared/models/services/availableSlot';

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
  selectedDate: Date = new Date();
  selectedOption: string = "";
  slots:  AvailableSlot[] = [];

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

  handleDateChange(selectedDate: Date): void {
    this.selectedDate = selectedDate;      ;

    this.getAvailability();
  }

  onOptionSelectionChange(selectedOption: any) {
    if (selectedOption !== null && selectedOption !== undefined) {
      this.selectedOption = selectedOption.target.value;
    }

    console.log("here", this.selectedOption);
    this.getAvailability();
  }

  getAvailability() {
    this.service.getAvailableSlots(parseInt(this.serviceId)).subscribe(
      response => {
        console.log("Sucess!", this.selectedDate);
        this.slots = response.filter((s: any) => {
          const slotDate = new Date(s.start);

          if (s.appointmentType === this.selectedOption || !this.selectedOption) {
            if (slotDate.toDateString() === this.selectedDate.toDateString()) {
              const slotTime = slotDate.getTime();
              const selectedTime = this.selectedDate.getTime();
              return slotTime > selectedTime;

            } else {
              return false;
            }
          } else {
              return false
          }
        }).map((s: any) => ({
          appointmentType: s.appointmentType,
          id: s.id,
          idService: s.idService,
          isAvailable: s.isAvailable,
          slotDuration: s.slotDuration,
          start: s.start
        }));

        console.log(this.slots,typeof this.slots.length);
      },
      error => {
        console.error('Erro: ', error);
      }
    );
  
  }

  convertToDate(dateTimeString: Date | undefined): string {
    if (!dateTimeString) {
      return "";
    }

    const monthsInPortuguese: string[] = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    let dateTime: Date = new Date(dateTimeString);

    let day: number = dateTime.getDate();
    let month: number = dateTime.getMonth();
    let year: number = dateTime.getFullYear();

    let formattedDate: string = `${day} ${monthsInPortuguese[month]} ${year}`;

    return formattedDate;
  }

  convertToHours(dateTimeString: Date | undefined): string {
    if (!dateTimeString) {
      return "";
    }

    let dateTime: Date = new Date(dateTimeString);

    let hours: number = dateTime.getHours();
    let formattedHours: string = hours < 10 ? '0' + hours : hours.toString();

    let min: number = dateTime.getMinutes();
    let formattedMinutes: string = min < 10 ? '0' + min : min.toString();

    return formattedHours + ":" + formattedMinutes;
  }

  getAppointmentType(type: string | undefined): string {
    switch (type) {
      case "Presential":
        return 'Presencial';
      case "Online":
        return 'Online';
      case "Home":
        return 'Domiciliária';
      default:
        return '';
    }
  }

}
