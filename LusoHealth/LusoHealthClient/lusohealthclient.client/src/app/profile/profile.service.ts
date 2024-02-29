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
import { Service } from '../shared/models/profile/service';
import { Specialty } from '../shared/models/profile/Specialty';
import { Description } from '../shared/models/profile/description';
import { Review } from '../shared/models/profile/review';

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

  getUserData(): Observable<UserProfile> {

    const headers = this.getHeaders();

    return this.http.get<UserProfile>(`${environment.appUrl}/api/profile/get-user`, { headers });
  }

  updateUserData(model: UserProfile) {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/profile/update-user-info`, model, { headers });
  }

  getProfessionalInfo(): Observable<Professional> {
    const headers = this.getHeaders();
    return this.http.get<Professional>(`${environment.appUrl}/api/profile/get-professional-info`, { headers });
  }

  getServices(): Observable<Specialty[]> {
    const headers = this.getHeaders();
    return this.http.get<Specialty[]>(`${environment.appUrl}/api/profile/get-specialties`, { headers });
  }

  getRelatives(): Observable<Relative[]> {
    const headers = this.getHeaders();
    return this.http.get<Relative[]>(`${environment.appUrl}/api/profile/get-relatives`, { headers });
  }

  updatePassword(model: UpdatePassword) {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/profile/update-password`, model, { headers });
  }

  updatePicture(model: UserProfile) {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/profile/update-picture`, model, { headers });
  }

  deleteRelative(relativeId: number): Observable<Relative> {
    const headers = this.getHeaders();
    return this.http.delete<Relative>(`${environment.appUrl}/api/profile/delete-relative/${relativeId}`, { headers });
  }

  addRelative(relative: Relative): Observable<Relative> {
    const headers = this.getHeaders();
    return this.http.post<Relative>(`${environment.appUrl}/api/profile/add-relative`, relative, { headers });
  }

  addSpecialty(service: Service): Observable<Service> {
    const headers = this.getHeaders();
    return this.http.post<Service>(`${environment.appUrl}/api/profile/add-service`, service, { headers });
  }

  updateRelative(relative: Relative): Observable<Relative> {
    const headers = this.getHeaders();
    return this.http.put<Relative>(`${environment.appUrl}/api/profile/update-relative/${relative.id}`, relative, { headers });
  }

  updateSpecialty(service: Service): Observable<Service> {
    const headers = this.getHeaders();
    return this.http.put<Service>(`${environment.appUrl}/api/profile/update-service`, service, { headers });
  }

  deleteSpecialty(serviceId: number): Observable<Service> {
    const headers = this.getHeaders();
    return this.http.delete<Service>(`${environment.appUrl}/api/profile/delete-service/${serviceId}`, { headers });
  }

  updateDescription(description: Description): Observable<Description> {
    const headers = this.getHeaders();
    return this.http.patch<Description>(`${environment.appUrl}/api/profile/update-description`, description, { headers });
  }

  filterReviewsByService(idService: number): Observable<Review[]> {
    const headers = this.getHeaders();
    return this.http.post<Review[]>(`${environment.appUrl}/api/profile/filter-reviews-by-service`, idService, { headers });
  }

}
