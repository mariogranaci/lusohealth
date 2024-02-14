import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { User } from '../../shared/models/authentication/user';
import { ConfirmEmail } from '../../shared/models/authentication/confirmEmail';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent implements OnInit {
  responseText = '';
  success = true;
  loading = true;
  errorMessages: string[] = [];
  email: string | undefined;

  constructor(private authenticationService: AuthenticationService,
    private router: Router,
    private activateRoute: ActivatedRoute) {

  }

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

              this.authenticationService.confirmEmail(confirmEmail).subscribe({
                next: (response: any) => {
                  this.loading = false;
                  this.responseText = response.value.message;
                  setTimeout(() => {
                    this.router.navigateByUrl('login');
                  }, 3000);
                },
                error: (error) => {
                  this.loading = false;
                  this.success = false;
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

  resendEmailConfirmationLink() {
    this.responseText = 'A reenviar link. Aguarde...';
    if (this.email) {
      this.authenticationService.resendEmailConfirmationLink(this.email).subscribe({
        next: (response: any) => {
          this.responseText = response.value.message;
        },
        error: (error) => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        }
      });
    }

  }
}
