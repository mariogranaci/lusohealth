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

  // Método para obter o JWT do usuário
  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return 'No JWT';
    }
  }

  // Método para decodificar o token JWT
  getDecodedToken() {
    const jwt = this.getJWT();
    if (jwt != null) {
      const decodedToken: any = jwtDecode(jwt);
      return decodedToken;
    }
  }

  // Método para obter os cabeçalhos HTTP com o token JWT
  getHeaders() {
    const jwt = this.getJWT();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

  // Método para obter os agendamentos anteriores
  getPreviousAppointments() {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${environment.appUrl}/api/agenda/get-previous-appointments`, { headers });
  }

  // Método para obter os próximos agendamentos
  getNextAppointments() {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${environment.appUrl}/api/agenda/get-next-appointments`, { headers });
  }

  // Método para obter os agendamentos pendentes
  getPendingAppointments() {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${environment.appUrl}/api/agenda/get-pending-appointments`, { headers });
  }

  // Método para obter as especialidades
  getSpecialties() {
    const headers = this.getHeaders();
    return this.http.get<Specialty[]>(`${environment.appUrl}/api/agenda/get-specialties`, { headers });
  }

  // Método para adicionar disponibilidade
  addAvailability(availability: Availability) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/agenda/add-availability`, availability, { headers });
  }

  // Método para obter os slots disponíveis
  getSlots(slot: Availability) {
    const headers = this.getHeaders();
    return this.http.post<AvailableSlot[]>(`${environment.appUrl}/api/agenda/get-slots`, slot, { headers });
  }

  // Método para excluir disponibilidade
  deleteAvailability(availability: Availability) {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.appUrl}/api/agenda/delete-availability`, {
      headers: headers,
      body: availability
    });
  }

  // Método para obter todos os slots
  getAllSlots(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.appUrl}/api/agenda/get-all-slots`, { headers });
  }

}
