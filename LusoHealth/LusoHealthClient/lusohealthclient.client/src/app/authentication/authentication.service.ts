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
import { ProfessionalType } from '../shared/models/authentication/professionalType';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private userSource = new ReplaySubject<User | null>(1);
  public user$ = this.userSource.asObservable();
  private inactivityTimer: any;
  public role: string | undefined;


  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Realiza o login do utilizador.
   * @param model O modelo de login contendo as credenciais do utilizador.
   * @returns Um Observable contendo informações sobre o utilizador autenticado.
   */
  login(model: Login) {
    return this.http.post<User>(`${environment.appUrl}/api/authentication/login`, model).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
          const decodedToken: any = jwtDecode(user.jwt);
          console.log(decodedToken.role);
          this.role = decodedToken.role;
        }
      })
    );
  }

  /**
 * Regista um novo utilizador.
 * @param model O modelo de registro contendo as informações do novo utilizador.
 * @returns Um Observable da solicitação de registo.
 */
  register(model: Register) {
    return this.http.post(`${environment.appUrl}/api/authentication/register`, model);
  }

  /**
 * Registra um novo utilizador usando o login do Google.
 * @param model O modelo de registro contendo as informações do novo utilizador.
 * @returns Um Observable contendo informações sobre o utilizador registrado.
 */
  registerWithGoogle(model: RegisterWithGoogle) {
    return this.http.post<User>(`${environment.appUrl}/api/authentication/register-with-google`, model).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    );
  }

  /**
 * Realiza o login do utilizador usando o login do Google.
 * @param model O modelo de login contendo as informações do utilizador.
 * @returns Um Observable contendo informações sobre o utilizador autenticado.
 */
  loginWithGoogle(model: LoginWithGoogle) {
    return this.http.post<User>(`${environment.appUrl}/api/authentication/login-with-google`, model).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    );
  }

  /**
 * Realiza o logout do utilizador, removendo suas informações do localStorage e limpando temporizadores.
 */
  logout() {
    localStorage.removeItem(environment.userKey);
    this.userSource.next(null);
    clearTimeout(this.inactivityTimer);
    this.router.navigateByUrl('/');
    this.role = undefined;
  }

  /**
 * Atualiza as informações do utilizador após renovar o token JWT.
 * @param jwt O token JWT renovado.
 * @returns Um Observable contendo informações atualizadas sobre o utilizador.
 */
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

  /**
 * Reinicia o temporizador de inatividade do utilizador.
 */
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

  /**
 * Confirma o email do utilizador.
 * @param model O modelo de confirmação de email contendo o token de confirmação.
 * @returns Um Observable da solicitação de confirmação de email.
 */
  confirmEmail(model: ConfirmEmail) {
    return this.http.put(`${environment.appUrl}/api/authentication/confirm-email`, model);
  }

  /**
 * Desbloqueia a conta do utilizador.
 * @param model O modelo de desbloqueio de conta contendo o token de desbloqueio.
 * @returns Um Observable da solicitação de desbloqueio de conta.
 */
  unlockAccount(model: ConfirmEmail) {
    return this.http.put(`${environment.appUrl}/api/authentication/unlock-account`, model);
  }

  /**
 * Reenvia o link de confirmação de email para o utilizador.
 * @param email O email do utilizador para o qual enviar o link de confirmação.
 * @returns Um Observable da solicitação de reenvio do link de confirmação de email.
 */
  resendEmailConfirmationLink(email: string) {
    return this.http.post(`${environment.appUrl}/api/authentication/resend-email-confirmation-link/${email}`, {});
  }

  /**
 * Envia um email para redefinir a senha do utilizador.
 * @param model O modelo de email contendo as informações necessárias para redefinir a senha.
 * @returns Um Observable da solicitação de redefinição de senha.
 */
  forgotPassword(model: EmailModel) {
    return this.http.post(`${environment.appUrl}/api/authentication/forgot-password`, model);
  }

  /**
 * Envia um email para recuperar a conta do utilizador.
 * @param model O modelo de email contendo as informações necessárias para recuperar a conta.
 * @returns Um Observable da solicitação de recuperação de conta.
 */
  recoverAccount(model: EmailModel) {
    return this.http.post(`${environment.appUrl}/api/authentication/recover-account`, model);
  }

  /**
 * Redefine a senha do utilizador.
 * @param model O modelo de redefinição de senha contendo o novo token de password.
 * @returns Um Observable da solicitação de redefinição de password.
 */
  resetPassword(model: ResetPassword) {
    return this.http.put(`${environment.appUrl}/api/authentication/reset-password`, model);
  }


  /**
   * Obtém os tipos de profissional disponíveis para registo.
   * @returns Um Observable contendo uma lista de tipos de profissional.
   */
  getProfessionalTypes() {
    return this.http.get<ProfessionalType[]>(`${environment.appUrl}/api/authentication/get-professional-types`);
  }

  /**
   * Obtém o token JWT do utilizador armazenado no localStorage.
   * @returns O token JWT do utilizador, ou `null` caso não exista.
   */
  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return null;
    }
  }

  /**
   * Define o utilizador autenticado e armazena suas informações no localStorage.
   * @param user O utilizador autenticado.
   */
  private setUser(user: User) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);
  }
}
