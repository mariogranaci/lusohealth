import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { reportModel } from '../shared/models/administration/reportModel';
import { jwtDecode } from 'jwt-decode';
import { User } from '../shared/models/authentication/user';

@Injectable({
  providedIn: 'root'
})
export class ModerationService {

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

  getReports(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<reportModel[]>(`${environment.appUrl}/api/manage/get-reports/${offset}/${limit}`, {headers});
  }

  getReportsConcluded(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<reportModel[]>(`${environment.appUrl}/api/manage/get-reports-concluded/${offset}/${limit}`, { headers });
  }

  getReportsCanceled(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<reportModel[]>(`${environment.appUrl}/api/manage/get-reports-canceled/${offset}/${limit}`, { headers });
  }

  cancelReport(report: reportModel) {
    const headers = this.getHeaders();
    return this.http.patch<reportModel>(`${environment.appUrl}/api/manage/cancel-report`, report, { headers });
  }

  suspendAccountProfessional(report: reportModel) {
    const headers = this.getHeaders();
    return this.http.patch<reportModel>(`${environment.appUrl}/api/manage/suspend-account-professional`, report, { headers });
  }

  blockAccountProfessional(report: reportModel) {
    const headers = this.getHeaders();
    return this.http.patch<reportModel>(`${environment.appUrl}/api/manage/block-account-professional`, report, { headers });
  }

  suspendAccountPatient(report: reportModel) {
    const headers = this.getHeaders();
    return this.http.patch<reportModel>(`${environment.appUrl}/api/manage/suspend-account-patient`, report, { headers });
  }

  blockAccountPatient(report: reportModel) {
    const headers = this.getHeaders();
    return this.http.patch<reportModel>(`${environment.appUrl}/api/manage/block-account-patient`, report, { headers });
  }
}
