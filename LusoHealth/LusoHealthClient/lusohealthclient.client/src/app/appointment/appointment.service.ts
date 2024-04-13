import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '../shared/models/services/appointment';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { jwtDecode } from 'jwt-decode';
import { AvailableSlot } from '../shared/models/services/availableSlot';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http: HttpClient, private router: Router) {
    
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

  getAppointmentInfo(id: number) {
    const headers = this.getHeaders();
    return this.http.get<Appointment>(`${environment.appUrl}/api/appointment/get-appointment-info/${id}`, { headers });
  }

  cancelAppointment(model: Appointment | undefined) {
    const headers = this.getHeaders();
    return this.http.patch<Appointment>(`${environment.appUrl}/api/appointment/cancel-appointment`, model, { headers });
  }

  finishAppointment(model: Appointment | undefined) {
    const headers = this.getHeaders();
    return this.http.patch<Appointment>(`${environment.appUrl}/api/appointment/finish-appointment`, model, { headers });
  }

  beginAppointment(model: Appointment | undefined) {
    const headers = this.getHeaders();
    return this.http.patch<Appointment>(`${environment.appUrl}/api/appointment/begin-appointment`, model, { headers });
  }

  scheduleAppointment(model: Appointment | undefined) {
    const headers = this.getHeaders();
    return this.http.patch<Appointment>(`${environment.appUrl}/api/appointment/schedule-appointment`, model, { headers });
  }

  changeAppointment(model: AvailableSlot | undefined) {
    const headers = this.getHeaders();
    return this.http.patch(`${environment.appUrl}/api/appointment/change-appointment`, model, { headers });
  }

  

}
