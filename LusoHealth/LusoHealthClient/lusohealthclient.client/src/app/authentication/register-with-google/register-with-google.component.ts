import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../shared/models/authentication/user';
import { take } from 'rxjs';
import { RegisterWithGoogle } from '../../shared/models/authentication/registerWithGoogle';

@Component({
  selector: 'app-register-with-google',
  templateUrl: './register-with-google.component.html',
  styleUrl: './register-with-google.component.css'
})
export class RegisterWithGoogleComponent implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  submitted = false;
  loading = false;
  errorMessages: string[] = [];
  responseText: string | undefined;
  provider: string | null = null;
  accessToken: string | null = null;
  email: string | null = null;
  userId: string | null = null;
  familyName: string | null = null;
  givenName: string | null = null;
  picture: string = '';

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private elem: ElementRef,
    private activatedRoute: ActivatedRoute) {
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
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              this.provider = this.activatedRoute.snapshot.paramMap.get('provider');
              this.accessToken = params.get('access_token');
              this.userId = params.get('user_id');
              this.email = params.get('email');
              this.givenName = params.get('given_name');
              this.familyName = params.get('family_name');
              this.picture = params.get('picture');

              if (this.provider && this.accessToken && this.email && this.provider === 'google') {
                this.initializeForm();
              } else {
                this.router.navigateByUrl('/');
              }
            }
          });
        }
      }
    });
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
      firstName: [this.givenName, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      lastName: [this.familyName, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: [this.email],
      nif: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      telemovel: ['', [Validators.minLength(9), Validators.maxLength(9)]],
      dataNascimento: ['', [Validators.required, this.idadeValidator]],
      genero: ['', [Validators.required]],
      tipoUser: ['', [Validators.required]],
    })
  }



  register() {
    this.submitted = true;
    this.errorMessages = [];
    this.responseText = '';


    if (this.registerForm.valid && this.userId && this.email && this.accessToken && this.provider) {
      this.loading = true;
      const firstName = this.registerForm.get('firstName')?.value;
      const lastName = this.registerForm.get('lastName')?.value;
      const nif = this.registerForm.get('nif')?.value;
      const telemovel = this.registerForm.get('telemovel')?.value;
      const dataNascimento = this.registerForm.get('dataNascimento')?.value;
      const genero = this.registerForm.get('genero')?.value;
      const tipoUser = this.registerForm.get('tipoUser')?.value;

      const model = new RegisterWithGoogle(firstName, lastName, nif, telemovel, dataNascimento, genero, tipoUser, this.email, this.accessToken, this.provider, this.picture, this.userId);
      this.authenticationService.registerWithGoogle(model).subscribe({
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
      })
    }
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
