import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { UserProfile } from '../shared/models/profile/userProfile';
import { UpdatePassword } from '../shared/models/profile/updatePassword';
import { Relative } from '../shared/models/profile/relative';
import { Observable } from 'rxjs';
import { Professional } from '../shared/models/profile/professional';

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

  getUserData(): Observable<UserProfile>
  {

    const headers = this.getHeaders();

    // Make the HTTP request with the headers                            
    return this.http.get<UserProfile>(`${environment.appUrl}/api/profile/get-user`, { headers });
  }

  updateUserData(model: UserProfile)
  {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/profile/update-user-info`, model, { headers });
  }


  updatePassword(model: UpdatePassword)
  {
    return this.http.put(`${environment.appUrl}/api/profile/update-password`, model);
  }

  getProfessionalInfo(): Observable<Professional> {
    const headers = this.getHeaders();
    return this.http.get<Professional>(`${environment.appUrl}/api/profile/get-professional-info`, { headers });
  }
  
  getRelatives(): Observable<Relative[]> 
  {
    const headers = this.getHeaders();
    return this.http.get<Relative[]>(`${environment.appUrl}/api/profile/get-relatives`, { headers });
  }

  deleteRelative(relativeId: number): Observable<Relative>
  {
    const headers = this.getHeaders();
    return this.http.delete<Relative>(`${environment.appUrl}/api/profile/delete-relative/${relativeId}`, { headers });
  }

  addRelative(relative: Relative): Observable<Relative> {
    const headers = this.getHeaders();
    return this.http.post<Relative>(`${environment.appUrl}/api/profile/add-relative`, relative, { headers });
  } 
}
