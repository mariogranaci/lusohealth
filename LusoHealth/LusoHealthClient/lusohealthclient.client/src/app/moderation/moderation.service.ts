import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ModerationService {

  constructor(private http: HttpClient, private router: Router) { }

  getReports() {
    return this.http.get<Report[]>(`${environment.appUrl}/api/manage/get-reports`);
  }

  cancelReport(report: Report) {
    return this.http.patch<Report[]>(`${environment.appUrl}/api/manage/cancel-report`, report);
  }

  suspendAccountProfessional(report: Report) {
    return this.http.patch<Report[]>(`${environment.appUrl}/api/manage/suspend-account-professional`, report);
  }

  blockAccountProfessional(report: Report) {
    return this.http.patch<Report[]>(`${environment.appUrl}/api/manage/block-account-professional`, report);
  }

  suspendAccountPatient(report: Report) {
    return this.http.patch<Report[]>(`${environment.appUrl}/api/manage/suspend-account-patient`, report);
  }

  blockAccountPatient(report: Report) {
    return this.http.patch<Report[]>(`${environment.appUrl}/api/manage/block-account-patient`, report);
  }
}
