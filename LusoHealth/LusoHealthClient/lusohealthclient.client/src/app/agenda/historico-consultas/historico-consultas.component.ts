import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { Specialty } from '../../shared/models/profile/specialty';
import { ServicesService } from '../../services/services.service';
import { AgendaService } from '../agenda.service';
import { Appointment } from '../../shared/models/servic/appointment';
import { Service } from '../../shared/models/servic/service';
import { Professional } from '../../shared/models/profile/professional';

@Component({
  selector: 'app-historico-consultas',
  templateUrl: './historico-consultas.component.html',
  styleUrl: './historico-consultas.component.css'
})
export class HistoricoConsultasComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];

  professionalTypes: ProfessionalType[] = [];

  specialties: Specialty[] = [];
  specialtiesFiltered: Specialty[] = [];

  appointments: Appointment[] = [];
  appointmentsFiltered: Appointment[] = [];

  services: Service[] = [];

  displayedAppointments: Appointment[] = [];
  initialAppointmentCount = 3;

  constructor(public servicesService: ServicesService, public agendaService: AgendaService) { }

  ngOnInit() {
    this.getServices().then(() => {
      this.getProfessionalTypes();
      this.getSpecialties();
      this.getPreviousAppointments();
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

  getPreviousAppointments() {
    this.agendaService.getPreviousAppointments().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (appointments: Appointment[]) => {
        this.appointments = appointments;
        this.appointmentsFiltered = appointments;
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

  getSpecialties() {
    this.agendaService.getSpecialties().pipe(
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

    this.specialtiesFiltered = [];

    this.updateDisplayedAppointments();
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

  filterProfessionalsCategory(): void {

    this.appointmentsFiltered = this.appointments;

    const selectedCategory = document.getElementById("category") as HTMLSelectElement | null;
    const selectedSpecialty = document.getElementById("specialty") as HTMLSelectElement | null;

    if (selectedCategory && selectedCategory.value != "Qualquer") {

      const professionalType = this.professionalTypes.find(type => type.name.trim() === selectedCategory.value.trim());

      if (professionalType) {

        this.appointmentsFiltered = this.appointments.filter(appointment => {
          return this.getProfessionalById(appointment.idService)?.professionalType.trim() === professionalType.name.trim();
        });

        if (selectedSpecialty) {

          const specialty = this.specialties.find(type => type.name.trim() === selectedSpecialty.value.trim());

          if (specialty) {

            this.appointmentsFiltered = this.appointments.filter(appointment => {
              const specialtyFound = this.findSpecialtyByServiceId(appointment.idService);
              if (specialtyFound) {
                return (specialtyFound.trim() === specialty.name.trim());
              }
              return false;
            });
          } else if (selectedSpecialty.value == "Qualquer") {

            this.appointmentsFiltered = this.appointments.filter(appointment => {
              return this.getProfessionalById(appointment.idService)?.professionalType.trim() === professionalType.name.trim();
            });
          }
        }
      }
    }
    else {
      this.appointmentsFiltered = this.appointments;
      this.updateDisplayedAppointments();
    }
    this.updateDisplayedAppointments();
  }

  getAppointmentType(type: string | null): string {
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

  findSpecialtyByServiceId(serviceId: number | null): String | null {
    const service = this.services.find(s => s.serviceId === serviceId);

    if (service) {
      return service.specialty;
    }
    return null;
  }

  getProfessionalNameById(serviceId: number | null): string {
    const professional = this.services.find(s => s.professional.services.find(p => p.serviceId === serviceId))?.professional;

    return professional?.professionalInfo.firstName + " " + professional?.professionalInfo.lastName;
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
    let formattedHours: string = hours < 10 ? '0' + hours : hours.toString();

    let min: number = dateTime.getMinutes();
    let formattedMinutes: string = min < 10 ? '0' + min : min.toString();

    return formattedHours + ":" + formattedMinutes;
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

  updateDisplayedAppointments() {
    this.displayedAppointments = this.appointmentsFiltered.slice(0, this.initialAppointmentCount);
  }

  orderBy() {

    const option = document.getElementById("order") as HTMLSelectElement | null;

    switch (option?.value) {
      case 'd<':
        // Order by date ascending
        this.appointmentsFiltered.sort((a, b) => {
          const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : 0;   
          const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timestampA - timestampB;
        });
        this.updateDisplayedAppointments();
        break;
      case 'd>':
        // Order by date descending
        this.appointmentsFiltered.sort((a, b) => {
          const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timestampB - timestampA;
        });
        this.updateDisplayedAppointments();
        break;
      default:
        break;
    }
  }
}
