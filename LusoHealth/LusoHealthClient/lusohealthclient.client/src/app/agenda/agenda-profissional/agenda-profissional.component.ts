import { Component } from '@angular/core';
import { ServicesService } from '../../services/services.service';
import { AgendaService } from '../agenda.service';
import { Service } from '../../shared/models/servic/service';
import { Specialty } from '../../shared/models/profile/specialty';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { Subject, take, takeUntil } from 'rxjs';
import { Professional } from '../../shared/models/profile/professional';
import { AppointmentService } from '../../appointment/appointment.service';
import { Appointment } from '../../shared/models/servic/appointment';


@Component({
  selector: 'app-agenda-profissional',
  templateUrl: './agenda-profissional.component.html',
  styleUrls: ['./agenda-profissional.component.css']
})

export class AgendaProfissionalComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  loading: boolean = false;

  // Arrays para armazenar os dados obtidos dos serviços
  professionalTypes: ProfessionalType[] = [];

  specialties: Specialty[] = [];

  appointments: any[] = [];
  appointmentsPending: any[] = [];

  services: Service[] = [];

  displayedAppointmentsPending: Appointment[] = [];
  initialAppointmentPendingCount = 3;

  displayedAppointments: Appointment[] = [];
  initialAppointmentCount = 3;

  phrases: string[] = [
    "Poderá ver a sua disponibiliadade ao clicar no botão Ver Disponibilidade.",
    "Poderá aceitar ou rejeitar os pedidos de consultas.",
    "Poderá clicar em ver detalhes, para ver mais detalhadamente as informações da consulta."
  ];
  currentPhraseIndex: number = 0;
  currentPhrase: string = this.phrases[0];
  selectedAppointment: Appointment | null = null;

  constructor(private servicesService: ServicesService, private agendaService: AgendaService,
    private appointmentService: AppointmentService) { }

  /*
  * Método chamado após a inicialização do componente
  */

  ngOnInit() {
    this.loading = true;
    this.getServices().then(() => {
      this.getProfessionalTypes();
      this.getSpecialties();
      this.getNextAppointments();
      this.getPendingAppointments();
      this.loading = false;
    });
  }

  // Método chamado quando o componente é destruído
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /*
  * Método para alterar o estado de um agendamento para "agendado"
  * @param appointment - O agendamento a ser marcado como agendado
  */
  changeAppointmentScheduled() {
    if (this.selectedAppointment != null) {
      const appontmentDto = new Appointment(this.selectedAppointment.timestamp, this.selectedAppointment.location, this.selectedAppointment.address, null, null, null,
        this.selectedAppointment.duration, this.selectedAppointment.idPatient, this.selectedAppointment.id, this.selectedAppointment.idProfessional,
        this.selectedAppointment.idService, null, null, null);
      this.appointmentService.scheduleAppointment(appontmentDto).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (response: any) => {
          console.log("Appointment scheduled successfully:", response);
          this.getServices().then(() => {
            this.getProfessionalTypes();
            this.getSpecialties();
            this.getNextAppointments();
            this.getPendingAppointments();
          });
          this.closePopup();
        },
        error: (error) => {
          console.error("Error scheduling appointment:", error);
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
          this.closePopup();
        }
      });
    }
  }

  /*
  * Método para cancelar um agendamento
  * @param appointment - O agendamento a ser cancelado
  */
  cancelAppointment() {
    if (this.selectedAppointment != null) {
      const appontmentDto = new Appointment(this.selectedAppointment.timestamp, this.selectedAppointment.location, this.selectedAppointment.address, null, null, null,
        this.selectedAppointment.duration, this.selectedAppointment.idPatient, this.selectedAppointment.id, this.selectedAppointment.idProfessional,
        this.selectedAppointment.idService, null, null, null);
      this.appointmentService.cancelAppointment(appontmentDto).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (response: any) => {
          console.log("Appointment canceled successfully:", response);
          this.getServices().then(() => {
            this.getProfessionalTypes();
            this.getSpecialties();
            this.getNextAppointments();
            this.getPendingAppointments();
          });
          this.closePopup();
          this.refundAppointment(response.id);
        },
        error: (error) => {
          console.error("Error scheduling appointment:", error);
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
          this.closePopup();
        }
      });
    }
  }

  /*
  * Método para reembolsar um agendamento cancelado
  * @param appointmentId - O ID do agendamento a ser reembolsado
  */
  refundAppointment(appointmentId: number) {
    this.servicesService.refundPayment(appointmentId).subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (error) => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  // Método para obter os tipos de profissionais
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

  // Método para obter os próximos agendamentos
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

  // Método para obter os agendamentos pendentes
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

  // Método para obter as especialidades
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

  // Método para obter os serviços disponíveis
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

  /*
  * Método para obter o tipo de agendamento com base no número fornecido
  * @param type - O número representando o tipo de agendamento
  * @returns O tipo de agendamento
  */
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

  /*
  * Método para encontrar a especialidade com base no ID do serviço
  * @param serviceId - O ID do serviço
  * @returns A especialidade relacionada ao serviço
  */
  findSpecialtyByServiceId(serviceId: number | null): String | null {
    const service = this.services.find(s => s.serviceId === serviceId);
    if (service) {
      return service.specialty;
    }
    return null;
  }

  /*
 * Método para obter o nome do paciente pelo ID
 * @param idPatient - O ID do paciente
 * @returns O nome completo do paciente
 */
 getPatientNameById(idPatient: string | null): string {
   const patient = this.appointments.find(p => p.idPatient === idPatient);
   if (patient) {
     return patient.patient.user.firstName + " " + patient.patient.user.lastName;
   }
   return '';
  }

  /*
  * Método para obter o nome do paciente pendente pelo ID
  * @param idPatient - O ID do paciente pendente
  * @returns O nome completo do paciente pendente
  */
  getPatientNamePendingById(idPatient: string | null): string {
    const patient = this.appointmentsPending.find(p => p.idPatient === idPatient);
    if (patient) {
      return patient.patient.user.firstName + " " + patient.patient.user.lastName;
    }
    return '';
  }

  /*
  * Método para obter o profissional pelo ID do serviço
  * @param serviceId - O ID do serviço
  * @returns O objeto profissional relacionado ao serviço
  */
  getProfessionalById(serviceId: number | null): Professional | undefined {
    const professional = this.services.find(s => s.professional.services.find(p => p.serviceId === serviceId))?.professional;

    return professional;
  }

  /*
  * Método para converter uma data e hora em uma string de horas formatada
  * @param dateTimeString - A string de data e hora a ser convertida
  * @returns A string de horas formatada
  */
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

  /*
  * Método para converter uma data e hora em uma string de data formatada
  * @param dateTimeString - A string de data e hora a ser convertida
  * @returns A string de data formatada
  */
  convertToDate(dateTimeString: Date | null): string {
    if (!dateTimeString) {
      return ""; // Or any other default value you prefer
    }

    const monthsInPortuguese: string[] = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    /*
    *Create a new Date object from the input string
    */
    let dateTime: Date = new Date(dateTimeString);

    /*
    * Extract day, month, and year
    */  
    let day: number = dateTime.getDate();
    let month: number = dateTime.getMonth();
    let year: number = dateTime.getFullYear();

    /*
    *Format the date in the desired format
    */
    let formattedDate: string = `${day} ${monthsInPortuguese[month]} ${year}`;

    return formattedDate;
  }

  /*
  *Método para carregar mais agendamentos na interface
  */
  loadMoreAppointments() {
    this.initialAppointmentCount += 3;
    this.updateDisplayedAppointments();
  }

  /*
  *Método para carregar mais agendamentos pendentes na interface
  */
  loadMoreAppointmentsPending() {
    this.initialAppointmentPendingCount += 3;
    this.updateDisplayedAppointmentsPending();
  }

  /*
  *Método para atualizar os agendamentos exibidos na interface
  */
  updateDisplayedAppointments() {
    this.displayedAppointments = this.appointments.slice(0, this.initialAppointmentCount);
    //console.log(typeof this.displayedAppointments[0].type);
  }

  /*
  * Método para atualizar os agendamentos pendentes exibidos na interface
  */
  updateDisplayedAppointmentsPending() {
    this.displayedAppointmentsPending = this.appointmentsPending.slice(0, this.initialAppointmentPendingCount);
  }


  openPopup(opcao: string, appointment: Appointment) {
    const overlay = document.getElementById('overlay');
    const remove = document.getElementById('remove-appointment-container');
    const accept = document.getElementById('accept-appointment-container');
    const tool = document.getElementById('tooltips');

    this.selectedAppointment = appointment;

    if (remove) {
      remove.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (opcao == "remove") {
        if (remove) {
          remove.style.display = "block";
        }
      }
      else if (opcao == "accept") {
        if (accept) {
          accept.style.display = "block";
        }
      }
      else if (opcao == "tool") {
        if (tool) {
          tool.style.display = "block";
        }
      }
    }
  }

  closePopup(){
    const overlay = document.getElementById('overlay');
    const accept = document.getElementById('accept-appointment-container');
    const remove = document.getElementById('remove-appointment-container');
    const tool = document.getElementById('tooltips');
    
    this.selectedAppointment = null;

    if (overlay) {
      overlay.style.display = 'none';
      if (remove) {
        remove.style.display = "none";
      }
      if (accept) {
        accept.style.display = "none";
      }
      if (tool) {
        tool.style.display = "none";
      }
    }
    
  }

  openPopupToolTip(opcao: string) {
    const overlay = document.getElementById('overlay');
    const remove = document.getElementById('remove-appointment-container');
    const accept = document.getElementById('accept-appointment-container');
    const tool = document.getElementById('tooltips');


    if (remove) {
      remove.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (opcao == "remove") {
        if (remove) {
          remove.style.display = "block";
        }
      }
      else if (opcao == "accept") {
        if (accept) {
          accept.style.display = "block";
        }
      }
      else if (opcao == "tool") {
        if (tool) {
          tool.style.display = "block";
        }
      }
    }
  }




  nextPhrase() {
    this.currentPhraseIndex++;
    if (this.currentPhraseIndex < this.phrases.length) {
      this.currentPhrase = this.phrases[this.currentPhraseIndex];
    } else {
      this.currentPhraseIndex = 0;
      this.currentPhrase = this.phrases[this.currentPhraseIndex];
      this.closePopup();
    }
  }


  /**
 * Impede a propagação do evento.
 * @param event O evento a ser interrompido.
 */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

}


