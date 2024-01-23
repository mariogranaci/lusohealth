import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registo',
  templateUrl: './registo.component.html',
  styleUrl: './registo.component.css'
})
export class RegistoComponent implements OnInit{

  registerForm: FormGroup = new FormGroup({});
  submitted = false;
  errorsMessages: string[] = [];

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit(): void
  {
    this.initializeForm();
  }

  initializeForm()
  {
    this.registerForm = this.formBuilder.group({

      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      nif: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      telemovel: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      email: ['', [Validators.required, Validators.pattern('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$')]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
      confirmarPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
      dataNascimento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      tipoUser: ['', [Validators.required]],
    })
  }

  register() {

    this.submitted = true;
    this.errorsMessages = [];

    this.authenticationService.register(this.registerForm.value).subscribe({

      next: (response) => {
        this.router.navigateByUrl('/login');
      },
      error: (error) => {
        console.log(error);
      }

    })
  }
}
