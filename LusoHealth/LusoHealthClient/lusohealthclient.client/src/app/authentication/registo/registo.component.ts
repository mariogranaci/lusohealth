import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../shared/models/authentication/user';
import { Subject, take, takeUntil } from 'rxjs';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';

@Component({
  selector: 'app-registo',
  templateUrl: './registo.component.html',
  styleUrl: './registo.component.css'
})

export class RegistoComponent implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  private unsubscribe$ = new Subject<void>();
  submitted = false;
  loading = false;
  errorMessages: string[] = [];
  responseText: string | undefined;
  professionalTypes: ProfessionalType[] = [];
  isProfessionalSelected: boolean = false;

  girlSelected = false;
  manSelected = false;
  patientSelected = false;
  professionalSelected = false;

  /**
  * Construtor da classe.
  * @param authenticationService Serviço de autenticação para gerir as operações relacionadas à autenticação do usuário.
  * @param formBuilder Construtor de formulários para criar instâncias de FormGroup.
  * @param router Serviço de roteamento para manipular navegação entre componentes.
  * @param renderer Renderizador para manipular elementos do DOM.
  * @param elem Referência para o elemento do DOM.
  */
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

  /**
   * Método executado após a inicialização do componente.
   */
  ngOnInit(): void {
    this.initializeForm();
    this.getProfessionalTypes();
  }

  /**
   * Método executado ao destruir o componente.
   */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Método executado após a renderização do componente.
   */
  ngAfterViewInit(): void {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxDate = eighteenYearsAgo.toISOString().split('T')[0];
    const dateInput = this.elem.nativeElement.querySelector('#dataNascimento');
    this.renderer.setAttribute(dateInput, 'max', maxDate);
  }

  /**
   * Inicializa o formulário de registo.
   */
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
      professionalTypeId: [null],
    })
  }

  /**
   * Método para registar o utilizador.
   */
  register() {
    this.submitted = true;
    this.errorMessages = [];
    this.responseText = '';
    

    console.log(this.registerForm.value);
    if (this.registerForm.valid) {
      this.loading = true;
      this.authenticationService.register(this.registerForm.value).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.responseText = response.value.message;
        },
        error: (error) => {
          console.log(error.error);
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

  /**
   * Obtém os tipos de profissionais disponíveis.
   */
  getProfessionalTypes() {
    this.authenticationService.getProfessionalTypes().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response: ProfessionalType[]) => {
        console.log(response);
        this.professionalTypes = response;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  /**
  * Método executado ao alterar o tipo de utilizador.
  * @param userType Tipo de utilizador selecionado.
  */
  onUserTypeChange(userType: string) {
    this.isProfessionalSelected = userType === 'P';
    const professionalTypeControl = this.registerForm.get('professionalTypeId');
    if (this.isProfessionalSelected) {
      professionalTypeControl?.setValidators([Validators.required]);
    } else {
      professionalTypeControl?.clearValidators();
    }

    professionalTypeControl?.updateValueAndValidity();
  }

  /**
   * Valida o padrão da password.
   * @returns Função de validação para a password.
   */
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

  /**
   * Valida a idade para o campo de data de nascimento.
   * @param control Controle do formulário.
   * @returns Objeto com erro se a validação falhar, caso contrário, null.
   */
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

  clickGirl() {
    this.manSelected = false;
    this.girlSelected = true;
    const femaleRadio = this.elem.nativeElement.querySelector('#female');
    femaleRadio.checked = true;
    this.registerForm.get('genero')?.setValue('F');
  }

  clickMan() {
    this.manSelected = true;
    this.girlSelected = false;
    const maleRadio = this.elem.nativeElement.querySelector('#male');
    maleRadio.checked = true;
    this.registerForm.get('genero')?.setValue('M');
  }

  clickProfessional() {
    this.professionalSelected = true;
    this.patientSelected = false;
  }

  clickPatient() {
    this.patientSelected = true;
    this.professionalSelected = false;
  }
}
