import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { Specialty } from '../../shared/models/profile/specialty';
import { ServicesService } from '../../services/services.service';
import { AgendaService } from '../../agenda/agenda.service';
import { Appointment } from '../../shared/models/services/appointment';
import { Service } from '../../shared/models/services/service';
import { Professional } from '../../shared/models/profile/professional';

@Component({
  selector: 'app-agenda-paciente',
  templateUrl: './agenda-paciente.component.html',
  styleUrl: './agenda-paciente.component.css'
})
export class AgendaPacienteComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];

  professionalTypes: ProfessionalType[] = [];

  specialties: Specialty[] = [];
  specialtiesFiltered: Specialty[] = [];

  appointments: Appointment[] = [];

  services: Service[] = [];

  constructor(public servicesService: ServicesService, public agendaService: AgendaService) {}

  ngOnInit() {
    this.getServices().then(() => {
      this.getProfessionalTypes();
      this.getSpecialties();
      this.getNextAppointments();
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
        console.log(this.appointments[0].timesTamp);
        this.appointments[0].timesTamp = new Date ('2025-03-10T17:45:00');
        console.log(this.appointments[0].timesTamp);
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
    this.servicesService.getSpecialties().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (specialities: Specialty[]) => {
        this.specialties = specialities;

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

  resetDropdowns() {
    const categoryDropdown = document.getElementById("category") as HTMLSelectElement;
    const specialtyDropdown = document.getElementById("specialty") as HTMLSelectElement;

    categoryDropdown.selectedIndex = 0;
    specialtyDropdown.selectedIndex = 0;
  }

  filterSpecialties(): void {

    const selectedCategory = document.getElementById("category") as HTMLSelectElement;

    const professionalType = this.professionalTypes.find(type => type.name === selectedCategory.value);

    if (professionalType) {

      this.specialtiesFiltered = this.specialties.filter(specialty => specialty.professionalTypeId === professionalType.id);

    } else {

      this.specialtiesFiltered = [];
    }
  }

  findSpecialtyByServiceId(serviceId: number | null): String | null {
    const service = this.services.find(s => s.serviceId === serviceId);
    if (service) {
      return service.specialty;
    }
    return null;
  }

  getProfessionalById(serviceId: number | null): string {
    const professional = this.services.find(s => s.professional.services.find(p => p.serviceId === serviceId))?.professional;

    return professional?.professionalInfo.firstName + " " + professional?.professionalInfo.lastName;
  }

  getAppointmentType(type: string | null): string{
    switch (type) {
      case "0":
        return 'Presencial';
      case "1":
        return 'Online';
      case "2":
        return 'Domiciliária';
      default:
        return '';
    }
  }

  convertToHours(dateTimeString: Date | null): number {
    if (!dateTimeString) {
      return 0; // Or any other default value you prefer
    }

    // Create a new Date object from the input string
    let dateTime: Date = new Date(dateTimeString);

    // Extract hours in 24-hour format
    let hours: number = dateTime.getHours();

    return hours;
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
}
