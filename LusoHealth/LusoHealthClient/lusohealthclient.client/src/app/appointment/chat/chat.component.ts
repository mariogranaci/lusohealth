import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { ProfileService } from '../../profile/profile.service';
import { ServicesService } from '../../services/services.service';
import { Professional } from '../../shared/models/profile/professional';
import { UserProfile } from '../../shared/models/profile/userProfile';
import { Appointment } from '../../shared/models/servic/appointment';
import { Service } from '../../shared/models/servic/service';
import { AppointmentService } from '../appointment.service';
import { Location } from '@angular/common';
import { ChatService } from '../chat.service';
import { Message } from '../../shared/models/chat/message';
import { User } from '../../shared/models/authentication/user';
import { AuthenticationService } from '../../authentication/authentication.service';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment.development';
import { Chat } from '../../shared/models/chat/chat';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  //isSender = true;

  senderRole: string | undefined;

  messages: Message[] = [];
  messageContent!: string;
  chat!: Chat;

  sendMessageForm: FormGroup = new FormGroup({});

  /*private chathubUrl = environment.production ? "https://lusohealth.azurewebsites.net/chathub" : "http://localhost:5184/chathub";
  connection = new signalR.HubConnectionBuilder().withUrl(this.chathubUrl).withAutomaticReconnect().build();*/

  constructor(private servicesService: ServicesService, private appointmentService: AppointmentService,
    private authenticationService: AuthenticationService, private route: ActivatedRoute, private profileService: ProfileService,
    private location: Location, private chatService: ChatService, private router: Router, private formBuilder: FormBuilder) {
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
    this.initializeForm();
    this.getAppointmentInfo().then(() => {
      this.getServiceInfo();
      this.getProfessional();
      this.getPatient();
      this.getChatByAppointmentId().then((chat) => {

        this.chat = chat;
        console.log("Chat fetched successfully:", chat);
        if (this.chat && this.chat.id)
          this.loadMessages(this.chat.id);

      }).catch((error) => {
        console.error('Error fetching slots: ', error);
      });
      //this.chatEnabled = (this.appointment?.state != 'Done' && this.appointment?.state != 'Canceled');

      //this.chatService.startConnection("34");
      //this.startConnection();
      /*this.messages= [{
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
      ];*/
      /*this.chatService.startConnection().then(() => {
        console.log("oi start");
        this.chatService.receiveMessage((message) => {
          this.messages.push(message);
          console.log("oi envio");
        });
        // Assuming you have a method to get the current chat ID
        this.chatService.joinChat(34);
      });*/
      //this.startConnection();
      this.chatService.startConnection().then(() => {
        this.chatService.joinChat(this.generateGroupName()).then(() => {
          this.chatService.receiveMessage().subscribe(message => {
            this.messages.push(message);
          });
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    //this.connection.stop();
    this.chatService.leaveChat(this.generateGroupName()).then(() => {
      this.chatService.hubConnection.stop();
    });
  }

  initializeForm() {
    this.sendMessageForm = this.formBuilder.group({
      message: ['', [Validators.required]]
    });
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

  changeAppointmentDone() {
    this.appointmentService.finishAppointment(this.appointment).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (appointment: any) => {
        console.log("Appointment finished successfully:", appointment);
        this.appointment = appointment;

        this.getChatByAppointmentId().then((chat) => {

          this.chat = chat;
          console.log("Chat fetched successfully:", chat);

        }).catch((error) => {
          console.error('Error fetching slots: ', error);
        });
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

        this.getChatByAppointmentId().then((chat) => {

          this.chat = chat;
          console.log("Chat fetched successfully:", chat);

        }).catch((error) => {
          console.error('Error fetching slots: ', error);
        });

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

  getChatByAppointmentId(): Promise<any> {
    /*this.chatService.getChatByAppointmentId(this.appointmentId).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (chat) => {
        this.chat = chat;
        console.log("Chat fetched successfully:", chat);
        if (this.chat && this.chat.id)
          this.loadMessages(this.chat.id);
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });*/

    return new Promise<any>((resolve, reject) => {
      this.chatService.getChatByAppointmentId(this.appointmentId).pipe(takeUntil(this.unsubscribe$)).subscribe({
        next: (chat) => {
          resolve(chat);
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
    this.changeAppointmentDone();
    this.closePopup();
  }

  startChat() {
    this.changeAppointmentBegin();

    //this.startConnection();
  }

  /*startConnection(): void {
    *//*this.connection.start().then(() => {
console.log("oi");
//this.hubConnection!.on('ReceiveMessage', this.)
console.log("Conexão");
}).catch(err => console.error('Error while starting connection: ', err));*//*
  
    this.connection.on("newMessage", (userId: string, message: string) => {
      console.log("newMessage", userId, message);
      this.messages.push({
        id: 5,
        userId: userId,
        text: message,
        isImage: false,
        imageUrl: null,
        timestamp: new Date('04/11/2024 19:50'),
        chatId: 1
      });
    });
  
    this.connection.start();
  }
  
  sendMessage(): void {
    this.connection.send("newMessage", this.userId, "Oi gato " + this.userId)
      .then(() => { console.log("Mensagem enviada") })
  }*/

  loadMessages(chatId: number) {
    this.chatService.getMessages(chatId).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (messages) => {
        this.messages = messages;
        console.log("Messages fetched successfully:", messages);
      },
      error: (err) => {
        console.log("Error fetching messages:", err); // Log any errors to the console")
        console.error('Error fetching messages:', err);
      }
    });
  }

  sendMessage() {
    if (this.userId && this.chat && this.chat.id && this.sendMessageForm?.valid && this.sendMessageForm.get('message')) {
      this.chatService.sendMessage(this.generateGroupName(), this.chat.id, this.userId, this.sendMessageForm.get('message')?.value, false, '').then(() => {
        this.sendMessageForm.get('message')?.reset();
      });
    }
  }

  generateGroupName(): string {
    // Assuming you have appointmentId or a combination of patientId and professionalId to form a unique group name
    return `chat-${this.appointmentId}`;
  }

  /*convertToPortugalTime(date: Date): string {
    // Convert the date object to a moment object and then to the Lisbon timezone
    const lisbonTime = moment(date).tz('Europe/Lisbon'); // 'Europe/Lisbon' is the timezone identifier for 'Lisbon

    // Format the time as a string. You can change the format to whatever you need.
    return lisbonTime.format('YYYY-MM-DD HH:mm:ss');
  }*/

  /*private handleIncomingMessage = (message: string): void => {
    this.messages.push(message);
    console.log(message);
    // ... (any additional logic to handle incoming messages)
  };*/

  /*sendMessage() {
    if (this.messageContent) {
      this.chatService.sendMessage(1, "34", "oi", false, '')
        .then(() => { this.messageContent = ''; console.log("oi gato"); })  // Clear the input after sending
        .catch(error => console.error("Error sending message:", error));
    }
  }*/

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
