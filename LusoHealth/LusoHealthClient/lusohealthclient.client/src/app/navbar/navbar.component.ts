import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  routerProfile: string = '/home';

  constructor(public authenticationService: AuthenticationService) {
    authenticationService.getJWT();
  }

  ngOnInit(): void {
    this.routerProfile = '';
    const decodedToken = this.getDecodedToken();
    if (decodedToken) {
      if (decodedToken.role === "Professional") {
        this.routerProfile = '/edit-professional-profile';
      } else if (decodedToken.role === "Patient") {
        this.routerProfile = '/patient-profile';
      }
    }
  }

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

  logout() {
    this.authenticationService.logout();
  }
}
