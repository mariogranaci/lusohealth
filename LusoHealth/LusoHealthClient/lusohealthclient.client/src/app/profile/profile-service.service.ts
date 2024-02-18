import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EditarPerfil } from '../shared/models/profile/editarPerfil';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';

@Injectable({
  providedIn: 'root'
})
export class ProfileServiceService {

  constructor(private http: HttpClient, private router: Router) { }

  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return null;
    }
  }

  getUserData() {

    const jwt = this.getJWT();

    if (jwt == null) {
      return null;
    }

    // Set up the headers with the authentication token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    // Make the HTTP request with the headers
    return this.http.get<any>(`${environment.appUrl}/api/profile/get-patient`, { headers });
  }

  editarPerfil(model: EditarPerfil) {
    return this.http.put(`${environment.appUrl}/api/authentication/confirm-email`, model);
  }
}
