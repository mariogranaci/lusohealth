import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '../shared/models/authentication/login';
import { environment } from '../../environments/environment.development';
import { ReplaySubject, map, of } from 'rxjs';
import { Register } from '../shared/models/authentication/register';
import { User } from '../shared/models/authentication/user';
import { Router } from '@angular/router';
import { ConfirmEmail } from '../shared/models/authentication/confirmEmail';
import { EmailModel } from '../shared/models/authentication/emailModel';
import { ResetPassword } from '../shared/models/authentication/resetPassword';
import { RegisterWithGoogle } from '../shared/models/authentication/registerWithGoogle';
import { LoginWithGoogle } from '../shared/models/authentication/loginWithGoogle';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private userSource = new ReplaySubject<User | null>(1);
  user$ = this.userSource.asObservable();
  private inactivityTimer: any;


  constructor(private http: HttpClient, private router: Router) { }

  login(model: Login) {
    return this.http.post<User>(`${environment.appUrl}/api/authentication/login`, model).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    );
  }

  register(model: Register) {
    return this.http.post(`${environment.appUrl}/api/authentication/register`, model);
  }

  registerWithGoogle(model: RegisterWithGoogle) {
    return this.http.post<User>(`${environment.appUrl}/api/authentication/register-with-google`, model).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    );
  }

  loginWithGoogle(model: LoginWithGoogle) {
    return this.http.post<User>(`${environment.appUrl}/api/authentication/login-with-google`, model).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(environment.userKey);
    this.userSource.next(null);
    clearTimeout(this.inactivityTimer);
    this.router.navigateByUrl('/');
  }

  refreshUser(jwt: string | null) {
    if (jwt === null) {
      this.userSource.next(null);
      return of(undefined);
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${jwt}`);

    return this.http.get<User>(`${environment.appUrl}/api/authentication/refresh-user-token`, { headers }).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
          this.resetInactivityTimer();
        }
      })
    );
  }

  resetInactivityTimer() {
    // Limpar o temporizador anterior
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Configurar um novo temporizador para fazer logout após 5 minutos de inatividade
    this.inactivityTimer = setTimeout(() => {
      this.logout();
    }, 20 * 60 * 1000); // 20 minutos em milissegundos
  }

  confirmEmail(model: ConfirmEmail) {
    return this.http.put(`${environment.appUrl}/api/authentication/confirm-email`, model);
  }

  resendEmailConfirmationLink(email: string) {
    return this.http.post(`${environment.appUrl}/api/authentication/resend-email-confirmation-link/${email}`, {});
  }

  forgotPassword(model: EmailModel) {
    return this.http.post(`${environment.appUrl}/api/authentication/forgot-password`, model);
  }

  recoverAccount(model: EmailModel) {
    return this.http.post(`${environment.appUrl}/api/authentication/recover-account`, model);
  }

  resetPassword(model: ResetPassword) {
    return this.http.put(`${environment.appUrl}/api/authentication/reset-password`, model);
  }

  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return null;
    }
  }

  private setUser(user: User) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);
  }


}
