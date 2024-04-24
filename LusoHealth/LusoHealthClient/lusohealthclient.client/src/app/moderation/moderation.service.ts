import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { reportModel } from '../shared/models/administration/reportModel';
import { jwtDecode } from 'jwt-decode';
import { User } from '../shared/models/authentication/user';
import { Review } from '../shared/models/administration/review';

@Injectable({
  providedIn: 'root'
})
export class ModerationService {

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Obtém o JWT do armazenamento local.
   */
  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return 'No JWT';
    }
  }

  /**
   * Decodifica o token JWT.
   */
  getDecodedToken() {
    const jwt = this.getJWT();
    if (jwt != null) {
      const decodedToken: any = jwtDecode(jwt);
      return decodedToken;
    }
  }

  /**
  * Obtém os cabeçalhos HTTP com o token de autorização.
  */
  getHeaders() {
    const jwt = this.getJWT();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

  /**
  * Obtém relatórios gerais.
  */
  getReports(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<reportModel[]>(`${environment.appUrl}/api/manage/get-reports/${offset}/${limit}`, {headers});
  }

  /**
  * Obtém relatórios concluídos.
  */
  getReportsConcluded(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<reportModel[]>(`${environment.appUrl}/api/manage/get-reports-concluded/${offset}/${limit}`, { headers });
  }

  /**
  * Obtém relatórios cancelados.
  */
  getReportsCanceled(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<reportModel[]>(`${environment.appUrl}/api/manage/get-reports-canceled/${offset}/${limit}`, { headers });
  }

  /**
  * Obtém relatórios pendentes.
  */
  getReportsPending(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<reportModel[]>(`${environment.appUrl}/api/manage/get-reports-pending/${offset}/${limit}`, { headers });
  }

  /**
   * Cancela um relatório.
   */
  cancelReport(report: reportModel) {
    const headers = this.getHeaders();
    return this.http.patch<reportModel>(`${environment.appUrl}/api/manage/cancel-report`, report, { headers });
  }

  /**
   * Suspende uma conta profissional.
   */
  suspendAccountProfessional(report: reportModel) {
    const headers = this.getHeaders();
    return this.http.patch<reportModel>(`${environment.appUrl}/api/manage/suspend-account-professional`, report, { headers });
  }

  /**
  * Bloqueia uma conta profissional.
  */
  blockAccountProfessional(report: reportModel) {
    const headers = this.getHeaders();
    return this.http.patch<reportModel>(`${environment.appUrl}/api/manage/block-account-professional`, report, { headers });
  }

  /**
   * Suspende uma conta de paciente.
   */
  suspendAccountPatient(review: Review) {
    const headers = this.getHeaders();
    return this.http.patch<Review>(`${environment.appUrl}/api/manage/suspend-account-patient`, review, { headers });
  }

  /**
  * Bloqueia uma conta de paciente.
  */
  blockAccountPatient(review: Review) {
    const headers = this.getHeaders();
    return this.http.patch<Review>(`${environment.appUrl}/api/manage/block-account-patient`, review, { headers });
  }

  /**
  * Obtém avaliações.
  */
  getReviews(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<Review[]>(`${environment.appUrl}/api/manage/get-reviews/${offset}/${limit}`, { headers });
  }

  /**
   * Obtém avaliações reportadas.
   */
  getReviewsReported(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<Review[]>(`${environment.appUrl}/api/manage/get-reviews-reported/${offset}/${limit}`, { headers });
  }

  /**
  * Obtém avaliações deletadas.
  */
  getReviewsDeleted(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<Review[]>(`${environment.appUrl}/api/manage/get-reviews-deleted/${offset}/${limit}`, { headers });
  }

  /**
  * Obtém avaliações normais.
  */
  getReviewsNormal(offset: number, limit: number) {
    const headers = this.getHeaders();
    return this.http.get<Review[]>(`${environment.appUrl}/api/manage/get-reviews-normal/${offset}/${limit}`, { headers });
  }

  /**
  * Deleta uma avaliação.
  */
  deleteReview(review: Review) {
    const headers = this.getHeaders();
    return this.http.patch<Review>(`${environment.appUrl}/api/manage/delete-review`, review, { headers });
  }
}
