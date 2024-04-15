import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '../shared/models/servic/appointment';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { jwtDecode } from 'jwt-decode';
import { Specialty } from '../shared/models/profile/specialty';
import { Availability } from '../shared/models/servic/availability';
import { AvailableSlot } from '../shared/models/servic/availableSlot';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {

  constructor(private http: HttpClient, private router: Router) { }

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
   * Obtém os agendamentos anteriores do utilizador.
   * @returns Um array de agendamentos anteriores.
   */
  getPreviousAppointments() {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${environment.appUrl}/api/agenda/get-previous-appointments`, { headers });
  }

  /**
  * Obtém os próximos agendamentos do utilizador.
  * @returns Um array de próximos agendamentos.
  */
  getNextAppointments() {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${environment.appUrl}/api/agenda/get-next-appointments`, { headers });
  }

  /**
  * Obtém os agendamentos pendentes do utilizador.
  * @returns Um array de agendamentos pendentes.
  */
  getPendingAppointments() {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${environment.appUrl}/api/agenda/get-pending-appointments`, { headers });
  }

  /**
   * Obtém as especialidades disponíveis.
   * @returns Um array de especialidades.
   */
  getSpecialties() {
    const headers = this.getHeaders();
    return this.http.get<Specialty[]>(`${environment.appUrl}/api/agenda/get-specialties`, { headers });
  }

  /**
   * Adiciona disponibilidade para um profissional.
   * @param availability As informações de disponibilidade a serem adicionadas.
   * @returns Um Observable para a requisição HTTP.
   */
  addAvailability(availability: Availability) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/agenda/add-availability`, availability, { headers });
  }

  /**
  * Obtém os slots disponíveis para uma data e serviço específicos.
  * @param slot As informações da disponibilidade para a qual os slots serão obtidos.
  * @returns Um array de slots disponíveis.
  */
  getSlots(slot: Availability) {
    const headers = this.getHeaders();
    return this.http.post<AvailableSlot[]>(`${environment.appUrl}/api/agenda/get-slots`, slot, { headers });
  }

  /**
   * Exclui uma disponibilidade previamente adicionada.
   * @param availability As informações da disponibilidade a ser excluída.
   * @returns Um Observable para a requisição HTTP.
   */
  deleteAvailability(availability: Availability) {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.appUrl}/api/agenda/delete-availability`, {
      headers: headers,
      body: availability
    });
  }

  /**
    * Obtém todos os slots disponíveis.
    * @returns Um Observable para a requisição HTTP.
    */
  getAllSlots(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/agenda/get-all-slots`, { headers });
  }

}
