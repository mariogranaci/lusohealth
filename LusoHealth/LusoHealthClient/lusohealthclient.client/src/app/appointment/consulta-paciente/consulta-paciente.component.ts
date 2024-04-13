import { Component } from '@angular/core';
import { ServicesService } from '../../services/services.service';
import { AppointmentService } from '../appointment.service';
import { Subject, takeUntil } from 'rxjs';
import { Professional } from '../../shared/models/profile/professional';
import { Service } from '../../shared/models/servic/service';
import { ActivatedRoute } from '@angular/router';
import { Appointment } from '../../shared/models/servic/appointment';
import { ProfileService } from '../../profile/profile.service';
import { User } from '../../shared/models/authentication/user';
import { UserProfile } from '../../shared/models/profile/userProfile';
import { environment } from '../../../environments/environment.development';
import { Marker } from '@googlemaps/adv-markers-utils';


@Component({
  selector: 'app-consulta-paciente',
  templateUrl: './consulta-paciente.component.html',
  styleUrl: './consulta-paciente.component.css'
})
export class ConsultaPacienteComponent {

  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];

  service: Service | undefined;

  appointmentId: number = this.route.snapshot.queryParams['appointment'];
  appointment: Appointment | undefined;
  professional: Professional | undefined;
  patient: UserProfile | undefined;

  zoom = 14;
  center: google.maps.LatLngLiteral = { lat: 38.736946, lng: -9.142685 };
  map: google.maps.Map | undefined;
  mapMoved: boolean = false;
  markers: Marker[] = [];

  constructor(public servicesService: ServicesService, public appointmentService: AppointmentService, private route: ActivatedRoute,
    public profileService: ProfileService) { }

  /**
  * Método Angular que é executado quando o componente é inicializado.
   */
  ngOnInit() {
    this.getAppointmentInfo().then(() => {
      this.getServiceInfo();
      this.getProfessional();
      this.getUser();
    });
  }

  /**
   * Método executado ao destruir o componente
   */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Obtém informações da consulta
   * @returns Uma promessa vazia
   */
  getAppointmentInfo(): Promise<void>{
    return new Promise<void>((resolve, reject) => {
      this.appointmentService.getAppointmentInfo(this.appointmentId).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (appointement: any) => {
          this.appointment = appointement;
          resolve();
        },
        error: (error) => {
          console.log(error);
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
          reject();
        }
      });
    });
  }

  /**
   * Obtém informações do serviço
   */
  getServiceInfo() {
    if (this.appointment && this.appointment.idService != null)
    {
      this.servicesService.getServiceInfo(this.appointment.idService).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (service: any) => {
          this.service = service;
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
  }

  /**
   * Obtém informações do profissional
   */
  getProfessional() {
    if (this.appointment && this.appointment.idProfessional != null) {
      this.profileService.getProfessionalInfoById(this.appointment?.idProfessional).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (professional: any) => {
          this.professional = professional;
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
  }

  /**
   * Obtém informações do paciente
   */
  getUser() {
    this.profileService.getUserData().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (patient: any) => {
        this.patient = patient;
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

  /**
   * Cancela a consulta
   */
  changeAppointmentCancel() {
    this.appointmentService.cancelAppointment(this.appointment).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (appointment: any) => {
        console.log("Appointment canceled successfully:", appointment);
        this.appointment = appointment;
      },
      error: (error) => {
        console.log("Error canceling appointment:", error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  /**
   * Obtém o nome do profissional pelo ID do serviço
   * @returns O nome do profissional
   */
  getProfessionalNameById(): string {
    if (this.service?.professional) {
      return this.service?.professional.professionalInfo.firstName + " " + this.service?.professional.professionalInfo.lastName;
    }
    return "";
  }

  /**
   * Obtém informações do profissional pelo ID do serviço
   * @returns Informações do profissional
   */
  getProfessionalById(): Professional | undefined {
    return this.service?.professional;
  }

  /**
   * Converte a hora da consulta para o formato HH:MM
   * @returns A hora formatada
   */
  convertToHours(): string {

    const dateTimeString = this.appointment?.timestamp;

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

  /**
   * Converte a data da consulta para o formato 'Dia Mês Ano'
   * @returns A data formatada
   */
  convertToDate(): string {

    const dateTimeString = this.appointment?.timestamp;

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

  /**
   * Abre o popup correspondente
   * @param opcao Opção para determinar qual popup abrir
   */
  openPopup(opcao: string) {
    const overlay = document.getElementById('overlay');
    const remove = document.getElementById('remove-appointment-container');

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
    }
  }

  /**
   * Fecha o popup
   */
  closePopup() {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-appointment-container');
    const edit = document.getElementById('edit-appointment-container');

    if (overlay) {
      overlay.style.display = 'none';
      if (edit) {
        edit.style.display = "none";
      }
      if (add) {
        add.style.display = "none";
      }
    }
  }

  /**
   * Cancela a consulta
   */
  cancelAppointment() {
    this.changeAppointmentCancel();
    this.closePopup();
  }

  /**
   * Impede a propagação de eventos
   * @param event O evento a ser manipulado
   */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

}
