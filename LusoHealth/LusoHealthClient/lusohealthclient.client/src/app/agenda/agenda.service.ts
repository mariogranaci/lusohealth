import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '../shared/models/services/appointment';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { jwtDecode } from 'jwt-decode';

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
}
