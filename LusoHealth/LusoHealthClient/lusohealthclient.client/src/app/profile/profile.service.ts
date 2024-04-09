import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { UserProfile } from '../shared/models/profile/userProfile';
import { UpdatePassword } from '../shared/models/profile/updatePassword';
import { Relative } from '../shared/models/profile/relative';
import { Observable, catchError } from 'rxjs';
import { Professional } from '../shared/models/profile/professional';
import { Service } from '../shared/models/profile/service';
import { Specialty } from '../shared/models/profile/specialty';
import { Description } from '../shared/models/profile/description';
import { Review } from '../shared/models/profile/review';
import { jwtDecode } from 'jwt-decode';
import { Certificate } from '../shared/models/profile/certificate';
import { AddReview } from '../shared/models/profile/addReview';
import { UpdatePicture } from '../shared/models/profile/updatePicture';
import { Location } from '../shared/models/profile/location';

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

  getDecodedToken() {
    const jwt = this.getJWT();
    if (jwt != null) {
      const decodedToken: any = jwtDecode(jwt);
      return decodedToken;
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

  getUserById(id : string): Observable<UserProfile> {
    const headers = this.getHeaders();
    return this.http.get<UserProfile>(`${environment.appUrl}/api/profile/get-user/${id}`, { headers });
  }

  updateUserData(model: UserProfile) {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/profile/update-user-info`, model, { headers });
  }

  getProfessionalInfo(): Observable<Professional> {
    const headers = this.getHeaders();
    return this.http.get<Professional>(`${environment.appUrl}/api/profile/get-professional-info`, { headers });
  }

  getProfessionalInfoById(id: string): Observable<Professional> {
    const headers = this.getHeaders();
    return this.http.get<Professional>(`${environment.appUrl}/api/profile/get-professional-info/${id}`, { headers });
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

  updatePicture(pictureFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('imageFile', pictureFile);
    
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.getJWT() // replace this.getToken() with your token retrieval logic
    });

    return this.http.put(`${environment.appUrl}/api/profile/update-picture`, formData, { headers });
  }

  getProfilePicture(): Observable<Blob> {
  const headers = new HttpHeaders({
    'Authorization': 'Bearer ' + this.getJWT(),
    'Content-Type': 'application/json',
  });

    return this.http.get(`${environment.appUrl}/api/profile/get-profile-picture`, {
    headers: headers,
    responseType: 'blob'
  }).pipe(
    catchError(error => {
      throw ('Error downloading image: ' + error);
    })
  );
}

  updateAddress(location: Location) {
    const headers = this.getHeaders();
    return this.http.patch(`${environment.appUrl}/api/profile/update-address`, location, { headers });
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


  addReport(relative: Relative): Observable<Relative> {
    const headers = this.getHeaders();
    return this.http.post<Relative>(`${environment.appUrl}/api/profile/add-relative`, relative, { headers });
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
    return this.http.get<Review[]>(`${environment.appUrl}/api/profile/filter-reviews-by-service/${idService}`, { headers });
  }

  filterReviewsByServiceById(idSpecialty: number, idProfessional: string): Observable<Review[]> {
    const headers = this.getHeaders();
    return this.http.get<Review[]>(`${environment.appUrl}/api/profile/filter-reviews-by-service/${idSpecialty}/${idProfessional}`, { headers });
  }

  addReview(review: AddReview): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/profile/add-review`, review, { headers });
  }

  uploadPdf(pdfFile: File): Observable<any> {

    const formData = new FormData();
    formData.append('pdfFile', pdfFile);

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.getJWT() // replace this.getToken() with your token retrieval logic
    });

    return this.http.post(`${environment.appUrl}/api/profile/upload-pdf`, formData, { headers }).pipe(
      catchError(error => {
        throw 'Error uploading PDF: ' + error;
      })
    );
  }

  getPdfs(): Observable<Certificate[]> {
    const headers = this.getHeaders();

    return this.http.get<Certificate[]>(`${environment.appUrl}/api/profile/get-pdfs`, { headers }).pipe(
      catchError(error => {
        throw 'Error getting PDFs: ' + error;
      })
    );
  }

  getPdfsById(id : string): Observable<Certificate[]> {
    const headers = this.getHeaders();

    return this.http.get<Certificate[]>(`${environment.appUrl}/api/profile/get-pdfs/${id}`, { headers }).pipe(
      catchError(error => {
        throw 'Error getting PDFs: ' + error;
      })
    );
  }

  deletePdf(certificateId: number): Observable<any> {
    const headers = this.getHeaders();

    return this.http.delete(`${environment.appUrl}/api/profile/delete-pdf/${certificateId}`, { headers }).pipe(
      catchError(error => {
        throw 'Error deleting PDF: ' + error;
      })
    );
  }


  downloadPdf(filePath: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.getJWT(),
      'Content-Type': 'application/json',
    });

    return this.http.get(`${environment.appUrl}/api/profile/download-pdf?filePath=${filePath}`, {
      headers: headers,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        throw ('Error downloading PDF: ' + error);
      })
    );
  }
}
