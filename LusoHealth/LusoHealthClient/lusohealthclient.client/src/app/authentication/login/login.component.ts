import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { User } from '../../shared/models/authentication/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  loading = false;
  errorMessages: string[] = [];

  constructor(private service: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router) {
    this.service.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        }
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    this.submitted = true;
    this.errorMessages = [];

    if (this.loginForm.valid) {
      this.loading = true;
      this.service.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.router.navigateByUrl('/');
        },
        error: (error) => {
          this.loading = false;
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        }
      },
      );
    }
  }

  openPopup(opcao: string) {
    const overlay = document.getElementById('overlay');
    const recuperarPass = document.getElementById('recuperar-pass');
    const recuperarConta = document.getElementById('recuperar-conta');

    if (recuperarConta) {
      recuperarConta.style.display = "none";
    }
    if (recuperarPass) {
      recuperarPass.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (opcao == "pass") {
        if (recuperarPass) {
          recuperarPass.style.display = "block";
        }
      }
      else if (opcao == "conta") {
        if (recuperarConta) {
          recuperarConta.style.display = "block";
        }
      }
    }
  }

  closePopup() {
    const overlay = document.getElementById('overlay');
    const recuperarPass = document.getElementById('recuperar-pass');
    const recuperarConta = document.getElementById('recuperar-conta');

    if (overlay) {
      overlay.style.display = 'none';
      if (recuperarConta) {
        recuperarConta.style.display = "none";
      }
      if (recuperarPass) {
        recuperarPass.style.display = "none";
      }
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
