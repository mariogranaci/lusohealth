import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EditarPerfil } from '../shared/models/profile/editarPerfil';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { UserProfile } from '../shared/models/profile/userProfile';
import { UpdatePassword } from '../shared/models/profile/updatePassword';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
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

  getUserData() {

    const headers = this.getHeaders();

    // Make the HTTP request with the headers                            get-user
    return this.http.get<UserProfile>(`${environment.appUrl}/api/profile/get-patient`, { headers });
  }

  updateUserData(model : UserProfile) {
    return this.http.put(`${environment.appUrl}/api/profile/update-user-info`, model);
  }


  updatePassword(model:UpdatePassword) {
    return this.http.put(`${environment.appUrl}/api/profile/update-password`, model);
  }


}
