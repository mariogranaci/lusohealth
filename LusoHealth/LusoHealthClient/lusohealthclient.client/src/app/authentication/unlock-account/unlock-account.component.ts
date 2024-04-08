import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { AuthenticationService } from '../authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../shared/models/authentication/user';
import { ConfirmEmail } from '../../shared/models/authentication/confirmEmail';

@Component({
  selector: 'app-unlock-account',
  templateUrl: './unlock-account.component.html',
  styleUrl: './unlock-account.component.css'
})
export class UnlockAccountComponent implements OnInit{
  responseText = '';
  loading = true;
  errorMessages: string[] = [];
  email: string | undefined;

  constructor(private authenticationService: AuthenticationService,
    private router: Router,
    private activateRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        } else {
          this.activateRoute.queryParamMap.subscribe({
            next: (params: any) => {
              const confirmEmail: ConfirmEmail = {
                token: params.get('token'),
                email: params.get('email')
              };

              this.email = confirmEmail.email;

              this.authenticationService.unlockAccount(confirmEmail).subscribe({
                next: (response: any) => {
                  this.loading = false;
                  this.responseText = response.value.message;
                  setTimeout(() => {
                    this.router.navigateByUrl('login');
                  }, 3000);
                },
                error: (error) => {
                  this.loading = false;
                  if (error.error.errors) {
                    this.responseText = 'Houve um erro inesperado. Por favor tente novamente mais tarde.';
                  } else {
                    this.responseText = error.error;
                  }
                }
              });
            }
          });
        }
      }
    });
  }
}
