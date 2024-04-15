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
import { Bounds } from '../shared/models/servic/bounds';
import { MakeAppointment } from '../shared/models/servic/makeAppointment';
import { Appointment } from '../shared/models/servic/appointment';
import { Session } from '../shared/models/servic/session';

declare const Stripe: any;

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  private stripe = Stripe('pk_test_51OqJA2GgRte7XVeapxEYUWKylVK9W4f7x6xkxMJ93vvHDfaoUXpQAy3DXYebSTqbSJ49rJv6UwetTIC8swpQ51c400qvW4FRxn');

  constructor(private http: HttpClient, private router: Router) { }

  /**
  * Obtém o token de autenticação do usuário.
  * @returns O token JWT se estiver disponível, caso contrário, retorna "No JWT".
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
   * Obtém os cabeçalhos HTTP com o token de autenticação.
   * @returns Os cabeçalhos HTTP com o token de autenticação.
   */
  getHeaders() {
    const jwt = this.getJWT();

    // Set up the headers with the authentication token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

  /**
   * Obtém informações sobre um serviço específico.
   * @param id O ID do serviço
   * @returns Um Observable contendo as informações do serviço
   */
  getServiceInfo(id: number): Observable<MakeAppointment> {

    const headers = this.getHeaders();

    return this.http.get<MakeAppointment>(`${environment.appUrl}/api/home/get-service-info/${id}`, { headers });
  }

  /**
   * Adiciona uma nova consulta.
   * @param appointment Os detalhes da consulta a ser adicionada
   * @returns Um Observable contendo a resposta da operação
   */
  addAppointment(appointment: Appointment): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/home/add-appointment`, appointment, { headers });
  }

  /**
   * Obtém os tipos de profissionais disponíveis.
   * @returns Um Observable contendo os tipos de profissionais
   */
  getProfessionalTypes() {
    return this.http.get<ProfessionalType[]>(`${environment.appUrl}/api/home/get-professional-types`);
  }

  /**
  * Obtém a lista de profissionais disponíveis.
  * @returns Um Observable contendo a lista de profissionais
  */
  getProfessionals() {
    return this.http.get<Professional[]>(`${environment.appUrl}/api/home/get-professionals`);
  }

  /**
  * Obtém a lista de especialidades disponíveis.
  * @returns Um Observable contendo a lista de especialidades
  */
  getSpecialties() {
    return this.http.get<Specialty[]>(`${environment.appUrl}/api/home/get-specialties`);
  }

  /**
   * Obtém a lista de serviços disponíveis.
   * @returns Um Observable contendo a lista de serviços
   */
  getServices() {
    return this.http.get<Service[]>(`${environment.appUrl}/api/home/get-services`);
  }

  getServicesFiltered(professionalType?: string, specialty?: string, searchTerm?: string, serviceType?: string, page: number = 1, pageSize: number = 10): Observable<Service[]> {
    // Construct the URL with optional query parameters
    let queryParams = new URLSearchParams();
    if (professionalType) queryParams.append('professionalType', professionalType);
    if (specialty) queryParams.append('specialty', specialty);
    if (searchTerm) queryParams.append('searchTerm', searchTerm);
    if (serviceType) queryParams.append('serviceType', serviceType);
    queryParams.append('page', page.toString());
    queryParams.append('pageSize', pageSize.toString());

    return this.http.get<Service[]>(`${environment.appUrl}/api/home/get-services-filtered?${queryParams.toString()}`);
  }

  /**
   * Obtém os profissionais disponíveis em uma determinada localização.
   * @param model As coordenadas da localização
   * @returns Um Observable contendo a lista de profissionais na localização especificada
   */
  getProfessionalsOnLocation(model: Bounds): Observable<Professional[]> {
    return this.http.post<Professional[]>(`${environment.appUrl}/api/home/get-professionals-on-location`, model);
  }

  /**
   * Solicita uma sessão Stripe para pagamento.
   * @param amount O valor total da sessão
   * @param appointmentId O ID da consulta relacionada
   * @param serviceName O nome do serviço relacionado
   */
  requestStripeSession(amount: number, appointmentId: number, serviceName: string): any {
    const headers = this.getHeaders();
    this.http.post<Session>(`${environment.appUrl}/api/payment/create-checkout-session`, { amount: amount, appointmentId: appointmentId, serviceName: serviceName }, { headers }).subscribe((session) => {
      this.redirectToCheckout(session.sessionId);
    });
  }

  /**
   * Redireciona para o checkout do Stripe.
   * @param sessionId O ID da sessão Stripe
   */
  redirectToCheckout(sessionId: string): void {
    this.stripe.redirectToCheckout({
      sessionId: sessionId
    });
  }

  /**
  * Obtém os detalhes da sessão.
  * @param sessionId ID da sessão
  * @returns Um Observable contendo os detalhes da sessão
  */
  getSessionDetails(sessionId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/payment/get-session-details/${sessionId}`, { headers });
  }

  /**
 * Atualiza o estado de uma consulta para pendente.
 * @param appointmentId O ID da consulta a ser atualizada
 * @param paymentIntentId O ID da intenção de pagamento associada
 * @returns Um Observable contendo a resposta da operação
 */
  updateAppointmentState(appointmentId: number, paymentIntentId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/payment/update-appointment-to-pending`, { appointmentId: appointmentId, paymentIntentId: paymentIntentId }, { headers });
  }

  /**
 * Cancela uma consulta.
 * @param appointmentId O ID da consulta a ser cancelada
 * @returns Um Observable contendo a resposta da operação
 */
  cancelAppointment(appointmentId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.appUrl}/api/payment/cancel-appointment/${appointmentId}`, { headers });
  }

 /**
 * Obtém os horários disponíveis para uma determinada consulta.
 * @param serviceId O ID do serviço para o qual os horários serão obtidos
 * @returns Um Observable contendo os horários disponíveis
 */
  getAvailableSlots(serviceId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/appointment/get-available-slots/${serviceId}`, { headers });
  }

 /**
 * Solicita o reembolso de uma consulta cancelada.
 * @param appointmentId O ID da consulta a ser reembolsada
 * @returns Um Observable contendo a resposta da operação
 */
  refundPayment(appointmentId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/payment/refund-appointment`, { appointmentId: appointmentId }, { headers });
  }
  
}
