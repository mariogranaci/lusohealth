import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { Professional } from '../shared/models/profile/professional';
import { Specialty } from '../shared/models/profile/specialty';
import { Service } from '../shared/models/servic/service';
import { ProfessionalType } from '../shared/models/authentication/professionalType';



@Injectable({
  providedIn: 'root'
})

export class HomeService {

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Obtém os tipos de profissional disponíveis.
   * @returns Um Observable contendo os tipos de profissional.
   */
  getProfessionalTypes() {
    return this.http.get<ProfessionalType[]>(`${environment.appUrl}/api/home/get-professional-types`);
  }

  /**
   * Obtém os profissionais disponíveis.
   * @returns Um Observable contendo os profissionais.
   */
  getProfessionals() {
    return this.http.get<Professional[]>(`${environment.appUrl}/api/home/get-professionals`);
  }

  /**
  * Obtém as especialidades disponíveis.
  * @returns Um Observable contendo as especialidades.
  */
  getSpecialties() {
    return this.http.get<Specialty[]>(`${environment.appUrl}/api/home/get-specialties`);
  }

  /**
   * Obtém os serviços disponíveis.
   * @returns Um Observable contendo os serviços.
   */
  getServices() {
    return this.http.get<Service[]>(`${environment.appUrl}/api/home/get-services`);
  }
}
