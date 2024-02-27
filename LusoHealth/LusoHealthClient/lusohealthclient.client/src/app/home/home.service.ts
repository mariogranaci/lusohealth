import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { Professional } from '../shared/models/profile/professional';
import { Specialty } from '../shared/models/profile/Specialty';



@Injectable({
  providedIn: 'root'
})

export class HomeService {

  constructor(private http: HttpClient, private router: Router) { }

  getHeaders() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return headers;
  }

  getProfessionalTypes() {
    const headers = this.getHeaders();
    return this.http.get<ProfessionalType[]>(`${environment.appUrl}/api/home/get-professional-types`, { headers });
  }

  getProfessionals() {
    const headers = this.getHeaders();
    return this.http.get<Professional[]>(`${environment.appUrl}/api/home/get-professionals`, { headers });
  }

  getSpecialties() {
    const headers = this.getHeaders();
    return this.http.get<Specialty[]>(`${environment.appUrl}/api/home/get-specialties`, { headers });
  }
}

export interface ProfessionalType {
  id: number;
  name: string;
}
