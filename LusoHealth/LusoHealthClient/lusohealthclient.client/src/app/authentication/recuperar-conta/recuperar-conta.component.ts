import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-recuperar-conta',
  templateUrl: './recuperar-conta.component.html',
  styleUrl: './recuperar-conta.component.css'
})
export class RecuperarContaComponent {
  recoverAccountForm: FormGroup = new FormGroup({});
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
    this.recoverAccountForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }



  recoverAccount() {
    this.submitted = true;
    this.errorMessages = [];
    this.responseText = '';


    if (this.recoverAccountForm.valid) {
      //this.loading = true;
      this.authenticationService.recoverAccount(this.recoverAccountForm.value).subscribe({
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
