import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../../profile/profile.service';
import { ServicesService } from '../../services/services.service';
import { Professional } from '../../shared/models/profile/professional';
import { UserProfile } from '../../shared/models/profile/userProfile';
import { Appointment } from '../../shared/models/services/appointment';
import { Service } from '../../shared/models/services/service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../appointment.service';
import { AgendaService } from '../../agenda/agenda.service';
import { Availability } from '../../shared/models/services/availability';
import { AvailableSlot } from '../../shared/models/services/availableSlot';

@Component({
  selector: 'app-consulta-profissional',
  templateUrl: './consulta-profissional.component.html',
  styleUrl: './consulta-profissional.component.css'
})
export class ConsultaProfissionalComponent {

  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  responseText: string = "";

  service: Service | undefined;

  appointmentId: number = this.route.snapshot.queryParams['appointment'];
  appointment: Appointment | undefined;
  professional: Professional | undefined;
  patient: UserProfile | undefined;

  availableSlots: AvailableSlot[] | undefined;
  updatedSlot: AvailableSlot | undefined;

  editAppointment: FormGroup = new FormGroup({});
  submitted = false;
  chosenDate: Date = new Date;

  minDate: string;

  constructor(public servicesService: ServicesService, public appointmentService: AppointmentService,
    public agendaService: AgendaService, private route: ActivatedRoute, public profileService: ProfileService, private formBuilder: FormBuilder)
  {
    this.minDate = new Date(Date.now()).toISOString().split('T')[0];
  }

  ngOnInit() {
    this.initializeForm();
    this.getAppointmentInfo().then(() => {
      this.getServiceInfo();
      this.getProfessional();
      this.getUser();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getAppointmentInfo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.appointmentService.getAppointmentInfo(this.appointmentId).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (appointment: any) => {
          this.appointment = appointment;
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

  changeAppointmentScheduled() {
    this.appointmentService.scheduleAppointment(this.appointment).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (appointment: any) => {
        console.log("Appointment scheduled successfully:", appointment);
        this.appointment = appointment;
      },
      error: (error) => {
        console.error("Error scheduling appointment:", error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  changeAppointment() {
    this.errorMessages = [];
    this.responseText = "";


    if (this.editAppointment.valid) {
      const slotId = this.editAppointment.get('slots')?.value;
      let slot = new AvailableSlot(undefined, slotId, undefined, undefined, undefined, undefined, this.appointmentId);
      this.appointmentService.changeAppointment(slot).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (slot: any) => {
          this.updatedSlot = slot;
          this.closePopup();
          this.getAppointmentInfo().then(() => {
            this.getServiceInfo();
            this.getProfessional();
            this.getUser();
          });
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
    if (this.appointment?.idPatient)
    {
      this.profileService.getUserById(this.appointment?.idPatient).pipe(
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
  }

  getAvaiableSlots() {
    if (this.appointment?.idService)
    {
      this.agendaService.getSlots(new Availability(this.chosenDate, null, null, null, this.appointment?.idService, null, "", null)).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (availableSlots: any) => {
          this.availableSlots = availableSlots;
          console.log(availableSlots);
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
    const edit = document.getElementById('edit-appointment-container');

    if (edit) {
      edit.style.display = "none";
    }
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
      else if (opcao == "edit") {
        if (edit) {
          edit.style.display = "block";
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

  cancelAppointment()
  {
    this.changeAppointmentCancel();
    this.closePopup();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  initializeForm() {
    this.editAppointment = this.formBuilder.group({
      dataConsulta: [this.minDate, [Validators.required]],
      slots: [0, [Validators.required]]
    });
  }

  changeDate() {
    this.chosenDate = new Date((document.getElementById('edit-data-consulta') as HTMLInputElement).value);
    this.getAvaiableSlots();
  }
}
