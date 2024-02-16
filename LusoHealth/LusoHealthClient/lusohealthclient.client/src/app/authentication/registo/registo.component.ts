import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../shared/models/authentication/user';
import { take } from 'rxjs';

@Component({
  selector: 'app-registo',
  templateUrl: './registo.component.html',
  styleUrl: './registo.component.css'
})

export class RegistoComponent implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  submitted = false;
  loading = false;
  errorMessages: string[] = [];
  responseText: string | undefined;

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private elem: ElementRef) {
    this.authenticationService.user$.pipe(take(1)).subscribe({
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

  ngAfterViewInit(): void {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxDate = eighteenYearsAgo.toISOString().split('T')[0];
    const dateInput = this.elem.nativeElement.querySelector('#dataNascimento');
    this.renderer.setAttribute(dateInput, 'max', maxDate);
  }

  initializeForm() {

    this.registerForm = this.formBuilder.group({

      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      nif: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      telemovel: ['', [Validators.minLength(9), Validators.maxLength(9)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)], [this.passwordPatternValidator()]],
      confirmarPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)], [this.passwordPatternValidator()]],
      dataNascimento: ['', [Validators.required, this.idadeValidator]],
      genero: ['', [Validators.required]],
      tipoUser: ['', [Validators.required]],
    })
  }



  register() {
    this.submitted = true;
    this.errorMessages = [];
    this.responseText = '';


    if (this.registerForm.valid) {
      this.loading = true;
      this.authenticationService.register(this.registerForm.value).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.responseText = response.value.message;
        },
        error: (error) => {
          this.loading = false;
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

  idadeValidator(control: AbstractControl): { [key: string]: any } | null {
    if (control.value) {
      const dataNascimento = new Date(control.value);

      if (isNaN(dataNascimento.getTime())) {
        return { 'error': 'Introduza uma data válida.' };
      }
      const hoje = new Date();
      let diferencaAnos = hoje.getFullYear() - dataNascimento.getFullYear();

      if (
        hoje.getMonth() < dataNascimento.getMonth() ||
        (hoje.getMonth() === dataNascimento.getMonth() && hoje.getDate() < dataNascimento.getDate())
      ) {
        diferencaAnos--;
      }

      if (diferencaAnos > 110 || diferencaAnos < 0) {
        return { 'error': 'Introduza uma data válida.' };
      }

      if (diferencaAnos < 18) {
        return { 'idade': 'A idade deve ser maior que 18 anos.' };
      }
    }

    return null;
  }
}
