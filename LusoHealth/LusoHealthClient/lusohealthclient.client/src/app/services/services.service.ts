import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { Professional } from '../shared/models/profile/professional';
import { Specialty } from '../shared/models/profile/Specialty';
import { Service } from '../shared/models/profile/service';
import { ProfessionalType } from '../shared/models/authentication/professionalType';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  constructor(private http: HttpClient, private router: Router) { }

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
}

