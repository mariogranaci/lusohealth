import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { jwtDecode } from 'jwt-decode';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: HubConnection;

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
