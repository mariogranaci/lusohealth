import { Component } from '@angular/core';
import { ServicesService } from '../../services/services.service';
import { AppointmentService } from '../appointment.service';
import { Subject, takeUntil } from 'rxjs';
import { Professional } from '../../shared/models/profile/professional';
import { Service } from '../../shared/models/servic/service';
import { ActivatedRoute } from '@angular/router';
import { Appointment } from '../../shared/models/servic/appointment';
import { ProfileService } from '../../profile/profile.service';
import { UserProfile } from '../../shared/models/profile/userProfile';

import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment.development';
import { Marker } from '@googlemaps/adv-markers-utils';

declare var google: any;

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

  zoom = 20;
  map: google.maps.Map | undefined;
  address: string = '';

  constructor(public servicesService: ServicesService,
    public appointmentService: AppointmentService,
    private route: ActivatedRoute,
    public profileService: ProfileService) { }

  ngOnInit() {
    const loader = new Loader({
      apiKey: environment.googleMapsApiKey,
      version: "weekly",
      libraries: [
        "places",
        "geocoding"
      ]
    });

    this.getAppointmentInfo().then(() => {
      loader.load().then(async () => {
        this.initMap();
      });
      this.getServiceInfo();
      this.getProfessional();
      this.getUser();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getAppointmentInfo(): Promise<void>{
    return new Promise<void>((resolve, reject) => {
      this.appointmentService.getAppointmentInfo(this.appointmentId).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (appointement: any) => {
          this.appointment = appointement;
          this.address = appointement.address;
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

  getProfessionalNameById(): string {
    if (this.service?.professional) {
      return this.service?.professional.professionalInfo.firstName + " " + this.service?.professional.professionalInfo.lastName;
    }
    return "";
  }

  getProfessionalById(): Professional | undefined {
    return this.service?.professional;
  }

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

  cancelAppointment() {
    this.changeAppointmentCancel();
    this.closePopup();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  async initMap() {
    await google.maps.importLibrary('marker');
    const domElement = document.querySelector('#map');

    if (this.appointment && this.appointment.location) {
      const [lat, lng] = this.appointment.location.replace(/,/g, '.').split(';').map(coord => parseFloat(coord));

      // create the map
      this.map = new google.maps.Map(domElement, {
        center: { lat: 38.7074, lng: -9.1368 },
        zoom: this.zoom,
        mapId: 'luso-health-consulta'
      });

      const position = new google.maps.LatLng(lat, lng);
      if (this.map) this.map.setCenter(position);

      const marker = new Marker({
        position,
        map: this.map,
        title: 'marker',
      });
    }
  }
}
