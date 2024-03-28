import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Professional } from '../shared/models/profile/professional';
import { Specialty } from '../shared/models/profile/specialty';
import { Service } from '../shared/models/profile/service';
import { ProfessionalType } from '../shared/models/authentication/professionalType';
import { Bounds } from '../shared/models/services/bounds';
import { MakeAppointment } from '../shared/models/services/makeAppointment';
import { Appointment } from '../shared/models/services/appointment';
import { Session } from '../shared/models/services/session';

declare const Stripe: any;

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  private stripe = Stripe('pk_test_51OqJA2GgRte7XVeapxEYUWKylVK9W4f7x6xkxMJ93vvHDfaoUXpQAy3DXYebSTqbSJ49rJv6UwetTIC8swpQ51c400qvW4FRxn');

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


  addAppointment(appointment: Appointment): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/home/add-appointment`, appointment, { headers });
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
  requestStripeSession(amount: number, appointmentId: number, serviceName: string): any {
    const headers = this.getHeaders();
    this.http.post<Session>(`${environment.appUrl}/api/payment/create-checkout-session`, { amount: amount, appointmentId: appointmentId, serviceName: serviceName }, { headers }).subscribe((session) => {
      this.redirectToCheckout(session.sessionId);
    });
  }

  redirectToCheckout(sessionId: string): void {
    this.stripe.redirectToCheckout({
      sessionId: sessionId
    });
  }

  getSessionDetails(sessionId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/payment/get-session-details/${sessionId}`, { headers });
  }

  updateAppointmentState(appointmentId: number, paymentIntentId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/payment/update-appointment-to-pending`, { appointmentId: appointmentId, paymentIntentId: paymentIntentId }, { headers });
  }

  cancelAppointment(appointmentId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.appUrl}/api/payment/cancel-appointment/${appointmentId}`, { headers });
  }

  getAvailableSlots(serviceId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/appointment/get-available-slots/${serviceId}`, { headers });
  }
  
}
