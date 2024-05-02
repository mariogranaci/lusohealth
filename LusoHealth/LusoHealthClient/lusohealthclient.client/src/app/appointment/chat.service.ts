import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { jwtDecode } from 'jwt-decode';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../shared/models/chat/message';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  /*private hubConnection: HubConnection;

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:4200/chathub', { skipNegotiation: true, transport: HttpTransportType.WebSockets, accessTokenFactory: () => this.getJWT() })
      .withAutomaticReconnect()
      .build();
  }

  private createConnection() {
    
  }

  private getJWT(): string {
    // Implement method to retrieve JWT
    return localStorage.getItem('your_jwt_token') || '';
  }

  startConnection(): Promise<void> {
    return this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.error('Error while starting connection: ', err));
  }

  joinChat(chatId: number): Promise<void> {
    return this.hubConnection.invoke('JoinChat', chatId);
  }

  leaveChat(chatId: number): Promise<void> {
    return this.hubConnection.invoke('LeaveChat', chatId);
  }

  sendMessage(chatId: number, userId: string, message: string, isImage: boolean, imageUrl: string): Promise<void> {
    return this.hubConnection.invoke('SendMessage', chatId, userId, message, isImage, imageUrl);
  }

  receiveMessage(callback: (message: any) => void) {
    this.hubConnection.on('ReceiveMessage', message => {
      callback(message);
    });
  }*/

  public hubConnection: HubConnection;

  constructor(private http: HttpClient, private router: Router) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5184/chathub")
      .withAutomaticReconnect()
      .build();
  }

  startConnection(): Promise<void> {
    return this.hubConnection.start();
  }

  joinChat(groupName: string): Promise<void> {
    return this.hubConnection.invoke('JoinChat', groupName);
  }

  leaveChat(groupName: string): Promise<void> {
    return this.hubConnection.invoke('LeaveChat', groupName);
  }

  sendMessage(groupId: string, chatId: number, userId: string, message: string, isImage: boolean, imageUrl: string): Promise<void> {
    return this.hubConnection.invoke('SendMessage', groupId, chatId, userId, message, isImage, imageUrl);
  }

  receiveMessage(): Observable<any> {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveMessage', (data) => {
        observer.next(data);
      });
    });
  }

  sendChatUpdate(groupId: string, chatId: number): Promise<void> {
    return this.hubConnection.invoke('SendChatUpdate', groupId, chatId);
  }

  receiveChatUpdate(): Observable<any> {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveChatUpdate', (data) => {
        observer.next(data);
      });
    });
  }

  getMessages(chatId: number): Observable<Message[]> {
    const headers = this.getHeaders();
    return this.http.get<Message[]>(`${environment.appUrl}/api/chat/get-messages/${chatId}`, { headers });
  }

  getChatByAppointmentId(appointmentId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/chat/get-chat-by-appointment-id/${appointmentId}`, { headers });
  }

  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return 'No JWT';
    }
  }

  getDecodedToken() {
    const jwt = this.getJWT();
    if (jwt != null) {
      const decodedToken: any = jwtDecode(jwt);
      return decodedToken;
    }
  }

  getHeaders() {
    const jwt = this.getJWT();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

  /*private hubConnection: HubConnection | undefined;

  constructor() { }

  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return 'No JWT';
    }
  }

  getDecodedToken() {
    const jwt = this.getJWT();
    if (jwt != null) {
      const decodedToken: any = jwtDecode(jwt);
      return decodedToken;
    }
  }

  getHeaders() {
    const jwt = this.getJWT();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

  getTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  startConnection(userId: string): void {

    let isDisconnected = this.hubConnection?.state === 'Disconnected';

    if (this.hubConnection && !isDisconnected) {
      
      return;
    }

    const isDevelopment = window.location.hostname === 'localhost';
    const signalrUrl = isDevelopment ? 'https://localhost:4200/chathub' : 'https://lusohealth.azurewebsites.net/chathub';

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${signalrUrl}?username=${userId}&timeZone=${encodeURIComponent(this.getTimeZone())}`,
        {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets
        })
      .withAutomaticReconnect()
      .build();
    
    this.hubConnection.start()
      .then(() => {
        console.log("oi");
        //this.hubConnection!.on('ReceiveMessage', this.)
        console.log("Conexão");
      })
      .catch(err => console.error('Error while starting connection: ', err));

  };*/

  /*public startConnection = (): Promise<void> => {


    return this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  };

  public sendMessage = (chatId: number, message: string): void => {
    this.hubConnection.invoke('SendMessage', chatId, message)
      .then(() => console.log('Enviei a mensagem'))
      .catch(err => console.error('Error while sending message: ', err));
  };

  public receiveMessage = (callback: (message: string) => void): void => {
    this.hubConnection.on('ReceiveMessage', (message: string) => {
      callback(message);
    });
  };*/
}
