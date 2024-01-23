import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '../shared/models/login';
import { environment } from '../../environments/environment.development';
import { ReplaySubject, map } from 'rxjs';
import { Register } from '../shared/models/register';
import { User } from '../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private userSource = new ReplaySubject<User | null>(1);
  user$ = this.userSource.asObservable();


  constructor(private http: HttpClient) { }

  login(model: Login) {
    return this.http.post<User>(`${environment.appUrl}/api/authentication/login`, model).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
          return user;
        }
        return null;
      })
    );
  }

  register(model: Register) {
    return this.http.post(`${environment.appUrl}/api/authentication/register`, model);
  }

  private setUser(user: User) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);

    this.user$.subscribe({
      next: (user) => {
        console.log(user);
      }
    });
  }
}
