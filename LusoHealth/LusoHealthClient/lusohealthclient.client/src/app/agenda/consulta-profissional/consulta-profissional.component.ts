import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Service } from '../../shared/models/services/service';
import { Appointment } from '../../shared/models/services/appointment';
import { UserProfile } from '../../shared/models/profile/userProfile';
import { Professional } from '../../shared/models/profile/professional';
import { ServicesService } from '../../services/services.service';
import { AgendaService } from '../agenda.service';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../profile/profile.service';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment.development';
import { Marker } from '@googlemaps/adv-markers-utils';

@Component({
  selector: 'app-consulta-profissional',
  templateUrl: './consulta-profissional.component.html',
  styleUrl: './consulta-profissional.component.css'
})
export class ConsultaProfissionalComponent {

  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];

  service: Service | undefined;

  appointmentId: number = this.route.snapshot.queryParams['appointmentId'];
  appointment: Appointment | undefined;
  professional: Professional | undefined;
  patient: UserProfile | undefined;

  zoom = 14;
  center: google.maps.LatLngLiteral = { lat: 38.736946, lng: -9.142685 };
  map: google.maps.Map | undefined;
  mapMoved: boolean = false;
  markers: Marker[] = [];

  constructor(public servicesService: ServicesService, public agendaService: AgendaService, private route: ActivatedRoute,
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
    loader.load().then(async () => {
      this.initMap();

    });
    this.getAppointmentInfo().then(() => {
      this.getServiceInfo();
      this.getProfessional();
      this.getUser();
      console.log(this.appointment);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async initMap() {
    await google.maps.importLibrary('marker');

    const domElement = document.querySelector('#map');
    if (domElement instanceof HTMLElement) {
      // Continue with map initialization
      this.map = new google.maps.Map(domElement, {
        center: { lat: 38.7074, lng: -9.1368 },
        zoom: this.zoom,
        mapId: 'lusohealth'
      });
      // Other map initialization logic
    } else {
      console.error('Map container element not found');
    }
    if (this.map) {
      this.map.addListener('dragend', () => {
        this.mapMoved = true;
      });
      this.map.addListener('zoom_changed', () => {
        this.mapMoved = true;
      });
    }
  }

  getAppointmentInfo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.agendaService.getAppointmentInfo(this.appointmentId).pipe(
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
        }
      });
    });
  }

  getServiceInfo() {
    if (this.appointment && this.appointment.idService != null) {
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

  getProfessionalNameById(): string {
    if (this.service?.professional) {
      return this.service?.professional.professionalInfo.firstName + " " + this.service?.professional.professionalInfo.lastName;
    }
    return "";
  }

  getProfessionalById(): Professional | undefined {
    return this.service?.professional;
  }

  convertToTime(): string {

    const dateTimeString = this.appointment?.timestamp;

    if (!dateTimeString) {
      return ""; // Or any other default value you prefer
    }

    let dateTime: Date = new Date(dateTimeString);

    let hours: number = dateTime.getHours();

    let min: number = dateTime.getMinutes();

    return hours + ":" + min;
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

}
