import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { User } from '../../shared/models/authentication/user';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPassword } from '../../shared/models/authentication/resetPassword';

@Component({
  selector: 'app-alterar-pass',
  templateUrl: './alterar-pass.component.html',
  styleUrl: './alterar-pass.component.css'
})
export class AlterarPassComponent implements OnInit {
  resetPasswordForm: FormGroup = new FormGroup({});
  submitted = false;
  //loading = false;
  errorMessages: string[] = [];
  responseText: string | undefined;
  model: ResetPassword | undefined;

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activateRoute: ActivatedRoute) {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        }
      }
    });
  }

  ngOnInit(): void {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        } else {
          this.activateRoute.queryParamMap.subscribe({
            next: (params: any) => {
              this.model = {
                token: params.get('token'),
                email: params.get('email'),
                newPassword: '',
                confirmarPassword: ''
              };
            }
          });
        }
      }
    });
    this.initializeForm();
  }

  initializeForm() {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)], [this.passwordPatternValidator()]],
      confirmarPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)], [this.passwordPatternValidator()]],
    })
  }



  resetPassword() {
    this.submitted = true;
    this.errorMessages = [];
    this.responseText = '';

    if (this.model && this.resetPasswordForm.valid) {
      this.model.newPassword = this.resetPasswordForm.get('password')?.value;
      this.model.confirmarPassword = this.resetPasswordForm.get('confirmarPassword')?.value;

      //this.loading = true;
      this.authenticationService.resetPassword(this.model).subscribe({
        next: (response: any) => {
          //this.loading = false;
          this.responseText = response.value.message;
        },
        error: (error) => {
          console.log(error.error);
          //this.loading = false;
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        }
      })

    }
  }

  passwordPatternValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value: string = control.value || '';

      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(pattern.test(value) ? null : { passwordPattern: true });
        }, 0);
      });
    };
  }
}
