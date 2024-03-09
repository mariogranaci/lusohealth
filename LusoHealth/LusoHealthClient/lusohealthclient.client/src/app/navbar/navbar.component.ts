import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { Subscription } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  userRole: string | undefined;
  // Inicialização explícita para satisfazer o TypeScript
  userSub: Subscription = new Subscription();

  constructor(public authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    // Subscrição ao Observable de usuário para reagir às mudanças de autenticação
    this.userSub = this.authenticationService.user$.subscribe(user => {
      if (user) {
        // Se houver um usuário, decodifique o token JWT e atualize a role
        const decodedToken = jwtDecode(user.jwt) as any;
        this.userRole = decodedToken.role;
      } else {
        // Se o usuário for `null` (logout), limpe a role
        this.userRole = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    // Não esqueça de cancelar a subscrição para evitar vazamentos de memória
    this.userSub.unsubscribe();
  }

  logout(): void {
    // Chamada de logout do serviço de autenticação
    this.authenticationService.logout();
  }
}


//import { Component, OnInit } from '@angular/core';
//import { AuthenticationService } from '../authentication/authentication.service';
//import { environment } from '../../environments/environment.development';
//import { User } from '../shared/models/authentication/user';
//import { jwtDecode } from 'jwt-decode';
//import { Observable, take } from 'rxjs';

//@Component({
//  selector: 'app-navbar',
//  templateUrl: './navbar.component.html',
//  styleUrls: ['./navbar.component.css']
//})
//export class NavbarComponent implements OnInit {

//  constructor(public authenticationService: AuthenticationService) {

//  }

//  ngOnInit(): void {

//  }

//  getRole() {
//    console.log(this.authenticationService.role);
//    return this.authenticationService.role;
//  }

//  getJWT() {
//    const key = localStorage.getItem(environment.userKey);
//    if (key) {
//      const user = JSON.parse(key) as User;
//      return user.jwt;
//    } else {
//      return 'No JWT';
//    }
//  }

//  getDecodedToken() {
//    const jwt = this.getJWT();
//    if (jwt != null) {
//      const decodedToken: any = jwtDecode(jwt);
//      console.log(decodedToken.role)
//      return decodedToken;
//    }
//  }

//  logout() {
//    this.authenticationService.logout();
//  }
//}
