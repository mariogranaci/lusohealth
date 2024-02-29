import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { MakeAppointment } from '../shared/models/Services/makeAppointment';
import { Observable } from 'rxjs';
import { Appointment } from '../shared/models/Services/appointment';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  constructor(private http: HttpClient) { }



  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return 'No JWT';
    }
  }

  getHeaders() {
    const jwt = this.getJWT();

    // Set up the headers with the authentication token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }


  getServiceInfo(id: number): Observable<MakeAppointment> {

    const headers = this.getHeaders();

    return this.http.get<MakeAppointment>(`${environment.appUrl}/api/home/get-service-info/${id}`, { headers });
  }


  addAppointment(appointment: Appointment): Observable<Appointment> {
    const headers = this.getHeaders();
    return this.http.post<Appointment>(`${environment.appUrl}/api/home/add-appointment`, appointment, { headers });
  }
}
