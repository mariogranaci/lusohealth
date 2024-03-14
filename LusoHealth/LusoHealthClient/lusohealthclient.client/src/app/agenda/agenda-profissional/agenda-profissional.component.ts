import { Component } from '@angular/core';
import { Appointment } from '../../shared/models/services/appointment';
import { ServicesService } from '../../services/services.service';
import { AgendaService } from '../agenda.service';
import { Service } from '../../shared/models/services/service';
import { Specialty } from '../../shared/models/profile/specialty';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { Subject, take, takeUntil } from 'rxjs';
import { Professional } from '../../shared/models/profile/professional';


@Component({
  selector: 'app-agenda-profissional',
  templateUrl: './agenda-profissional.component.html',
  styleUrls: ['./agenda-profissional.component.css']
})

export class AgendaProfissionalComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];

  professionalTypes: ProfessionalType[] = [];

  specialties: Specialty[] = [];

  appointments: any[] = [];
  appointmentsPending: any[] = [];

  services: Service[] = [];

  displayedAppointmentsPending: Appointment[] = [];
  initialAppointmentPendingCount = 3;

  displayedAppointments: Appointment[] = [];
  initialAppointmentCount = 3;

  constructor(public servicesService: ServicesService,public agendaService: AgendaService) {}

  ngOnInit() {
    this.getServices().then(() => {
      this.getProfessionalTypes();
      this.getSpecialties();
      this.getNextAppointments();
      this.getPendingAppointments();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getProfessionalTypes() {
    this.servicesService.getProfessionalTypes().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (professionalTypes: ProfessionalType[]) => {
        this.professionalTypes = professionalTypes;
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  getNextAppointments() {
    this.agendaService.getNextAppointments().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (appointments: Appointment[]) => {
        this.appointments = appointments;
        this.updateDisplayedAppointments();
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  getPendingAppointments() {
    this.agendaService.getPendingAppointments().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (appointments: Appointment[]) => {
        this.appointmentsPending = appointments;
        this.updateDisplayedAppointmentsPending();
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }


  getSpecialties() {
    this.agendaService.getSpecialties().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (specialities: Specialty[]) => {
        this.specialties = specialities;
        /*console.log(this.specialties);*/
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  getServices(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.servicesService.getServices().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (services: any) => {
          this.services = services;
          resolve();
        },
        error: (error) => {
          console.log(error);
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
          reject(error);
        }
      });
    });
  }



  getAppointmentType(type: string | null ): string {
    /*console.log(type);*/
    if (type) {
      const number = parseInt(type);
      switch (number) {
        case 0:
          return 'Presencial';
        case 1:
          return 'Online';
        case 2:
          return 'Domiciliária';
        default:
          return '';
      }
    }
    return '';
  }

  findSpecialtyByServiceId(serviceId: number | null): String | null {
    const service = this.services.find(s => s.serviceId === serviceId);
    if (service) {
      return service.specialty;
    }
    return null;
  }

 getPatientNameById(idPatient: string | null): string {
   const patient = this.appointments.find(p => p.idPatient === idPatient);
   if (patient) {
     return patient.patient.user.firstName + " " + patient.patient.user.lastName;
   }
   return '';
  }

  getPatientNamePendingById(idPatient: string | null): string {
    const patient = this.appointmentsPending.find(p => p.idPatient === idPatient);
    if (patient) {
      return patient.patient.user.firstName + " " + patient.patient.user.lastName;
    }
    return '';
  }

  getProfessionalById(serviceId: number | null): Professional | undefined {
    const professional = this.services.find(s => s.professional.services.find(p => p.serviceId === serviceId))?.professional;

    return professional;
  }

  convertToHours(dateTimeString: Date | null): string {
    if (!dateTimeString) {
      return ""; // Or any other default value you prefer
    }

    let dateTime: Date = new Date(dateTimeString);

    let hours: number = dateTime.getHours();

    let min: number = dateTime.getMinutes();

    return hours + ":" + min;
  }

  convertToDate(dateTimeString: Date | null): string {
    if (!dateTimeString) {
      return ""; // Or any other default value you prefer
    }

    const monthsInPortuguese: string[] = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Create a new Date object from the input string
    let dateTime: Date = new Date(dateTimeString);

    // Extract day, month, and year
    let day: number = dateTime.getDate();
    let month: number = dateTime.getMonth();
    let year: number = dateTime.getFullYear();

    // Format the date in the desired format
    let formattedDate: string = `${day} ${monthsInPortuguese[month]} ${year}`;

    return formattedDate;
  }

  loadMoreAppointments() {
    this.initialAppointmentCount += 3;
    this.updateDisplayedAppointments();
  }

  loadMoreAppointmentsPending() {
    this.initialAppointmentPendingCount += 3;
    this.updateDisplayedAppointmentsPending();
  }

  updateDisplayedAppointments() {
    this.displayedAppointments = this.appointments.slice(0, this.initialAppointmentCount);
    //console.log(typeof this.displayedAppointments[0].type);
  }

  updateDisplayedAppointmentsPending() {
    this.displayedAppointmentsPending = this.appointmentsPending.slice(0, this.initialAppointmentPendingCount);
  }
}