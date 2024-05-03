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

  public hubConnection: HubConnection;

  constructor(private http: HttpClient, private router: Router) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.appUrl + "/chathub")
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

}
