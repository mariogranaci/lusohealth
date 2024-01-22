import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '../shared/models/login';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/user';
import { ReplaySubject, map } from 'rxjs';
import { Register } from '../shared/models/register';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) { }

  login(model: Login) {
    return this.http.post(`${environment.appUrl}/api/login`, model);
  }

  register(model: Register) {
    return this.http.post(`${environment.appUrl}/api/register`, model);
  }

}
