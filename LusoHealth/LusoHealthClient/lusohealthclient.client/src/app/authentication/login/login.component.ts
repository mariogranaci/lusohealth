import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { User } from '../../shared/models/authentication/user';
import { CredentialResponse } from 'google-one-tap';
import { jwtDecode } from "jwt-decode";
import { DOCUMENT } from '@angular/common';
import { LoginWithGoogle } from '../../shared/models/authentication/loginWithGoogle';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  @ViewChild('googleButton', { static: true }) googleButton: ElementRef = new ElementRef({});
  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  loading = false;
  errorMessages: string[] = [];

  /**
   * Construtor da classe.
   * @param service Serviço de autenticação para gerenciar as operações relacionadas à autenticação do usuário.
   * @param formBuilder Construtor de formulários para criar instâncias de FormGroup.
   * @param router Serviço de roteamento para navegar entre componentes.
   * @param _renderer2 Serviço de renderização para manipulação de elementos do DOM.
   * @param _document Referência ao objeto Document.
   */
  constructor(private service: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document) {
    this.service.user$.pipe(take(1)).subscribe({
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
    this.initializeGoogleButton();
    this.initializeForm();
  }

  /**
  * Método executado após a visualização dos elementos filhos.
  */
  ngAfterViewInit() {
    const script1 = this._renderer2.createElement('script');
    script1.src = 'https://accounts.google.com/gsi/client';
    script1.async = 'true';
    script1.defer = 'true';
    this._renderer2.appendChild(this._document.body, script1);
  }

  /**
   * Inicializa o formulário de login.
   */
  initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * Método para realizar o login.
   */
  login() {
    this.submitted = true;
    this.errorMessages = [];

    const googleBox = this._document.getElementById('google-button-box');

    if (this.loginForm.valid) {
      if (googleBox) {
        googleBox.style.display = "none";
      }
      this.loading = true;
      this.service.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          if (googleBox) {
            googleBox.style.display = "block";
          }
          this.loading = false;
          this.router.navigateByUrl('/');
        },
        error: (error) => {
          if (googleBox) {
            googleBox.style.display = "block";
          }
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

  /**
   * Inicializa o botão de login do Google.
   */
  initializeGoogleButton() {
    (window as any).onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: '6944112800-aj8vakk0icj3k4usarkigonogigveqre.apps.googleusercontent.com',
        callback: this.googleCallback.bind(this),
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: true
      });
      // @ts-ignore
      google.accounts.id.renderButton(
        this.googleButton.nativeElement, {
          theme: 'filled_blue',
          shape: 'rectangular',
          locale: 'pt-PT',
          size: 'large',
          width: 400,
          text: 'continue_with',
          logo_alignment: 'left',
      });
    }
  }

  /**
   * Função de callback para lidar com a resposta do Google One Tap.
   * @param response Resposta da credencial do Google.
   */
  private async googleCallback(response: CredentialResponse) {
    this.submitted = true;
    this.errorMessages = [];
    const decodedToken: any = jwtDecode(response.credential);
    this.service.loginWithGoogle(new LoginWithGoogle(response.credential, 'google', decodedToken.sub, decodedToken.email))
      .subscribe({
        next: (response: any) => {
          this.router.navigateByUrl('/');
        },
        error: (error) => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            if (error.error === 'O email não está registado') {
              this.router.navigateByUrl(`/external-register/google?access_token=${response.credential}&user_id=${decodedToken.sub}&email=${decodedToken.email}&given_name=${decodedToken.given_name}&family_name=${decodedToken.family_name}&picture=${decodedToken.picture}`);
            } else {
              this.errorMessages.push(error.error);

            }
          }
        }
      });
  }

  /**
   * Abre a janela popup para recuperar a senha ou a conta.
   * @param opcao Opção selecionada ('pass' para recuperar a senha, 'conta' para recuperar a conta).
   */
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

  /**
   * Fecha a janela popup.
   */
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

  /**
   * Impede a propagação do evento.
   * @param event Evento de clique.
   */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
