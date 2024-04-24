import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '../shared/models/servic/appointment';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { jwtDecode } from 'jwt-decode';
import { AvailableSlot } from '../shared/models/servic/availableSlot';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http: HttpClient, private router: Router) {
    
  }

  /**
   * Obtém o JWT do utilizador armazenado no localStorage.
   * @returns O JWT do utilizador, ou 'No JWT' caso não exista.
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
   * @returns O token JWT decodificado.
   */
  getDecodedToken() {
    const jwt = this.getJWT();
    if (jwt != null) {
      const decodedToken: any = jwtDecode(jwt);
      return decodedToken;
    }
  }

  /**
  * Obtém os cabeçalhos HTTP com o token JWT.
  * @returns Os cabeçalhos HTTP com o token JWT.
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
  * Obtém informações sobre um agendamento específico.
  * @param id O ID do agendamento a ser obtido.
  * @returns Um objeto representando o agendamento.
  */
  getAppointmentInfo(id: number) {
    const headers = this.getHeaders();
    return this.http.get<Appointment>(`${environment.appUrl}/api/appointment/get-appointment-info/${id}`, { headers });
  }

  /**
   * Cancela um agendamento.
   * @param model O objeto de agendamento a ser cancelado.
   * @returns Um objeto representando o agendamento cancelado.
   */
  cancelAppointment(model: Appointment | undefined) {
    const headers = this.getHeaders();
    return this.http.patch<Appointment>(`${environment.appUrl}/api/appointment/cancel-appointment`, model, { headers });
  }

  /**
   * Finaliza um agendamento.
   * @param model O objeto de agendamento a ser finalizado.
   * @returns Um objeto representando o agendamento finalizado.
   */
  finishAppointment(model: Appointment | undefined) {
    const headers = this.getHeaders();
    return this.http.patch<Appointment>(`${environment.appUrl}/api/appointment/finish-appointment`, model, { headers });
  }

  /**
   * Inicia um agendamento.
   * @param model O objeto de agendamento a ser iniciado.
   * @returns Um objeto representando o agendamento iniciado.
   */
  beginAppointment(model: Appointment | undefined) {
    const headers = this.getHeaders();
    return this.http.patch<Appointment>(`${environment.appUrl}/api/appointment/begin-appointment`, model, { headers });
  }

  /**
   * Agenda um agendamento.
   * @param model O objeto de agendamento a ser agendado.
   * @returns Um objeto representando o agendamento agendado.
   */
  scheduleAppointment(model: Appointment | undefined) {
    const headers = this.getHeaders();
    return this.http.patch<Appointment>(`${environment.appUrl}/api/appointment/schedule-appointment`, model, { headers });
  }

  /**
  * Altera um agendamento.
  * @param model O objeto de slot disponível para o qual o agendamento será alterado.
  * @returns Um Observable para a requisição HTTP.
  */
  changeAppointment(model: AvailableSlot | undefined) {
    const headers = this.getHeaders();
    return this.http.patch(`${environment.appUrl}/api/appointment/change-appointment`, model, { headers });
  }

  

}
