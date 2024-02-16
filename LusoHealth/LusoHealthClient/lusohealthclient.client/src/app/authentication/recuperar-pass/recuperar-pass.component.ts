import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-recuperar-pass',
  templateUrl: './recuperar-pass.component.html',
  styleUrl: './recuperar-pass.component.css'
})
export class RecuperarPassComponent {
  forgotPasswordForm: FormGroup = new FormGroup({});
  submitted = false;
/*  loading = false;*/
  errorMessages: string[] = [];
  responseText: string | undefined;

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }



  forgotPassword() {
    this.submitted = true;
    this.errorMessages = [];
    this.responseText = '';


    if (this.forgotPasswordForm.valid) {
      //this.loading = true;
      this.authenticationService.forgotPassword(this.forgotPasswordForm.value).subscribe({
        next: (response: any) => {
          //this.loading = false;
          this.responseText = response.value.message;
        },
        error: (error) => {
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
}
