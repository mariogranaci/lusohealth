import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { RecuperarContaComponent } from '../recuperar-conta/recuperar-conta.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  errorMessages: string[] = [];

  constructor(private service: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router) { }

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
      this.service.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          console.log(err);
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
      else if (opcao == "conta")
      {
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
