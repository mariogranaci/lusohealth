import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { MakeAppointment } from '../shared/models/Services/makeAppointment';
import { Observable } from 'rxjs';
import { Appointment } from '../shared/models/Services/appointment';
import { Router } from '@angular/router';
import { Professional } from '../shared/models/profile/professional';
import { Specialty } from '../shared/models/profile/specialty';
import { Service } from '../shared/models/profile/service';
import { ProfessionalType } from '../shared/models/authentication/professionalType';
import { Observable } from 'rxjs';
import { Bounds } from '../shared/models/services/bounds';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
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
  getProfessionalTypes() {
    return this.http.get<ProfessionalType[]>(`${environment.appUrl}/api/home/get-professional-types`);
  }

  getProfessionals() {
    return this.http.get<Professional[]>(`${environment.appUrl}/api/home/get-professionals`);
  }

  getSpecialties() {
    return this.http.get<Specialty[]>(`${environment.appUrl}/api/home/get-specialties`);
  }

  getServices() {
    return this.http.get<Service[]>(`${environment.appUrl}/api/home/get-services`);
  }

  getProfessionalsOnLocation(model: Bounds): Observable<Professional[]> {
    return this.http.post<Professional[]>(`${environment.appUrl}/api/home/get-professionals-on-location`, model);
  }
}

