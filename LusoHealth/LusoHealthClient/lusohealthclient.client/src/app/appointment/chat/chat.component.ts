import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { ProfileService } from '../../profile/profile.service';
import { ServicesService } from '../../services/services.service';
import { Professional } from '../../shared/models/profile/professional';
import { UserProfile } from '../../shared/models/profile/userProfile';
import { Appointment } from '../../shared/models/services/appointment';
import { Service } from '../../shared/models/services/service';
import { AppointmentService } from '../appointment.service';
import { AgendaService } from '../../agenda/agenda.service';
import { Location } from '@angular/common';
import { HubConnectionState } from '@microsoft/signalr';
import { ChatService } from '../chat.service';
import { Message } from '../../shared/models/chat/message';
import { User } from '../../shared/models/authentication/user';
import { AuthenticationService } from '../../authentication/authentication.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  responseText: string = "";

  service: Service | undefined;

  public userId: string | undefined;

  appointmentId: number = this.route.snapshot.queryParams['appointment'];
  appointment: Appointment | undefined;
  professional: Professional | undefined;
  patient: UserProfile | undefined;

  chatEnabled = false;

  //isSender = true;

  senderRole: string | undefined;

  messages: Message[] = [];
  messageContent!: string;
  chatId!: number;

  constructor(private servicesService: ServicesService, private appointmentService: AppointmentService,
    private authenticationService: AuthenticationService, private route: ActivatedRoute, private profileService: ProfileService,
    private location: Location, private chatService: ChatService, private router: Router) {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (!user) {
          this.router.navigateByUrl('/error');
        }
        else {
          const decodedToken = this.profileService.getDecodedToken();

          if (decodedToken) {
            if (decodedToken.role !== "Professional" && decodedToken.role !== "Patient") {
              this.router.navigateByUrl('/error');
            }
            else {
              this.userId = decodedToken.nameid;
              console.log("User", this.userId);
              if (decodedToken.role === "Professional") {
                this.senderRole = "Professional";
              }
              else {
                this.senderRole = "Patient";
              }
            }
          }
        }
      }
    });
  }

  ngOnInit() {
    this.getAppointmentInfo().then(() => {
      this.getServiceInfo();
      this.getProfessional();
      this.getPatient();
      this.getUser();
      this.chatEnabled = (this.appointment?.state != 'Done' && this.appointment?.state != 'Canceled')
      //this.chatService.startConnection("34");
      //this.startConnection();
      this.messages= [{
        id: 1,
        userId: "34",
        text: "Olá sou o profissional",
        isImage: false,
        imageUrl: null,
        timestamp: new Date('04/11/2024 18:50'),
        chatId: 1
      },
      {
        id: 2,
        userId: "5",
        text: "Olá sou o paciente",
        isImage: false,
        imageUrl: null,
        timestamp: new Date('04/11/2024 18:51'),
        chatId: 1
      },
      {
        id: 3,
        userId: "34",
        text: "Olá sou o profissional",
        isImage: false,
        imageUrl: null,
        timestamp: new Date('04/11/2024 18:52'),
        chatId: 1
      },
      {
        id: 4,
        userId: "5",
        text: "Olá sou o paciente",
        isImage: false,
        imageUrl: null,
        timestamp: new Date('04/11/2024 18:53'),
        chatId: 1
      },
      ];
      this.chatService.startConnection().then(() => {
        console.log("oi start");
        this.chatService.receiveMessage((message) => {
          this.messages.push(message);
          console.log("oi envio");
        });
        // Assuming you have a method to get the current chat ID
        this.chatService.joinChat(34);
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    /*if (this.appointmentService.hubConnection.state === HubConnectionState.Connected) {
      this.appointmentService.hubConnection.stop();
    }*/
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
          reject();
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

  getPatient() {
    if (this.appointment?.idPatient) {
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

  getUser() {
    // PARA O JAIME IR VER SE O USER E PATIENT OU NAO E DAR SET A VARIAVEL isSenderPatient
    // PARA IR BUSCAR O NOME NO HTML
  }

  changeAppointmentDone() {
    this.appointmentService.finishAppointment(this.appointment).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (appointment: any) => {
        console.log("Appointment finished successfully:", appointment);
        this.appointment = appointment;
      },
      error: (error) => {
        console.log("Error finishing appointment:", error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  changeAppointmentBegin() {
    this.appointmentService.beginAppointment(this.appointment).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (appointment: any) => {
        console.log("Appointment started successfully:", appointment);
        this.appointment = appointment;
      },
      error: (error) => {
        console.log("Error starting appointment:", error);
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

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  goBack() {
    this.location.back();
  }

  endChat() {
    this.chatEnabled = false;
    this.changeAppointmentDone();
    this.closePopup();
  }

  startChat() {
    this.chatEnabled = true;
    this.changeAppointmentBegin();

    //this.startConnection();
  }

  /*private handleIncomingMessage = (message: string): void => {
    this.messages.push(message);
    console.log(message);
    // ... (any additional logic to handle incoming messages)
  };*/

  sendMessage() {
    if (this.messageContent) {
      this.chatService.sendMessage(1, "34", "oi", false, '')
        .then(() => { this.messageContent = ''; console.log("oi gato"); })  // Clear the input after sending
        .catch(error => console.error("Error sending message:", error));
    }
  }

  /*private startConnection(): void {
    this.appointmentService.startConnection().then(() => {
      console.log('SignalR connection established');
      // Now that the connection is established, set up the listener
      this.appointmentService.receiveMessage(this.handleIncomingMessage);
    }).catch((error) => {
      console.error('SignalR connection failed to start:', error);
    });
  }*/

  /*startConnection(): void {

    let isDisconnected = this.hubConnection?.state === 'Disconnected';

    if (this.hubConnection && !isDisconnected) {
      return;
    }

    const isDevelopment = window.loca


    *//*return this.hubConnection
  .start()
  .then(() => console.log('Connection started'))
  .catch(err => console.log('Error while starting connection: ' + err));*//*
};*/

  /*sendMessage(): void {
    if (this.appointmentService.hubConnection.state === HubConnectionState.Connected) {
      //this.chatService.sendMessage(this.chatId, this.messageContent);
      this.messageContent = ''; // Clear the message input after sending
    } else {
      console.warn('Cannot send a message when the connection is not in the "Connected" state.');
    }
  }*/

}
