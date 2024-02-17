import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EditarPerfil } from '../shared/models/profile/editarPerfil';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProfileServiceService {

  constructor(private http: HttpClient, private router: Router) { }


  editarPerfil(model: EditarPerfil) {
    return this.http.put(`${environment.appUrl}/api/authentication/confirm-email`, model);
  }
}
