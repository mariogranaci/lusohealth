import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '../shared/models/services/appointment';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { jwtDecode } from 'jwt-decode';
import { Specialty } from '../shared/models/profile/specialty';
import { Availability } from '../shared/models/services/availability';
import { AvailableSlot } from '../shared/models/services/availableSlot';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {

  constructor(private http: HttpClient, private router: Router) { }

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

  getPreviousAppointments() {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${environment.appUrl}/api/agenda/get-previous-appointments`, { headers });
  }

  getNextAppointments() {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${environment.appUrl}/api/agenda/get-next-appointments`, { headers });
  }

  getPendingAppointments() {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${environment.appUrl}/api/agenda/get-pending-appointments`, { headers });
  }

  getSpecialties() {
    const headers = this.getHeaders();
    return this.http.get<Specialty[]>(`${environment.appUrl}/api/agenda/get-specialties`, { headers });
  }

  addAvailability(availability: Availability) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/agenda/add-availability`, availability, { headers });
  }
  
  getSlots(slot: Availability) {
    const headers = this.getHeaders();
    return this.http.post<AvailableSlot[]>(`${environment.appUrl}/api/agenda/get-slots`, slot, { headers });
  }

  deleteAvailability(availability: Availability) {
    const headers = this.getHeaders();
    console.log("Oi");
    return this.http.delete<any>(`${environment.appUrl}/api/agenda/delete-availability`, {
      headers: headers,
      body: availability
    });
  }
}
