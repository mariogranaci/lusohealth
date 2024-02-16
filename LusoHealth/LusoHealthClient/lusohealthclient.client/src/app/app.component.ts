import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(public authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.refreshUser()
  }

  private refreshUser() {
    const jwt = this.authenticationService.getJWT();
    if (jwt) {
      this.authenticationService.refreshUser(jwt).subscribe({
        next: () => { },
        error: () => {
          this.authenticationService.logout();
        }
      });
    } else {
      this.authenticationService.refreshUser(null).subscribe();
    }
  }

  title = 'lusohealthclient.client';
}
