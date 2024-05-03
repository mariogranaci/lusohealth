import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';

@Injectable({
  providedIn: 'root'
})
export class BackOfficeService {

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

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

  getValidUsers() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/backoffice/get-valid-users`, { headers });
  }

  getAppointmentsPerProfessional(selectedFilter: number) {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/backoffice/get-apointments-per-professional/${selectedFilter}`, { headers });
  }

  getServicesByRanking() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/backoffice/get-services-by-ranking`, { headers });
  }

  getProfessionalTypes() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/backoffice/get-professional-types`, { headers });
  }

  getAnuallyRegisteredUsers(startDate: string, endDate: string, timeUnit: string) {
    const headers = this.getHeaders();
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('timeUnit', timeUnit);

    return this.http.get<any>(`${environment.appUrl}/api/backoffice/get-anually-registered-users`, { headers, params });
  }

  getProfessionals() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/backoffice/get-professionals`, { headers });
  }

  getSpecialties() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/backoffice/get-specialties`, { headers });
  }

  compareRegistration() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/backoffice/compare-registration`, { headers });
  }
}
