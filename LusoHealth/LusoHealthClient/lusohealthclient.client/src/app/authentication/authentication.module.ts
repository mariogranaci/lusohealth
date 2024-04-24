import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { LoginComponent } from './login/login.component';
import { RegistoComponent } from './registo/registo.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { RecuperarContaComponent } from './recuperar-conta/recuperar-conta.component';
import { RecuperarPassComponent } from './recuperar-pass/recuperar-pass.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { AlterarPassComponent } from './alterar-pass/alterar-pass.component';
import { RegisterWithGoogleComponent } from './register-with-google/register-with-google.component';
import { FooterAuthenticationComponent } from './footer-authentication/footer-authentication.component';
import { UnlockAccountComponent } from './unlock-account/unlock-account.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegistoComponent,
    RecuperarContaComponent,
    RecuperarPassComponent,
    ConfirmEmailComponent,
    AlterarPassComponent,
    RegisterWithGoogleComponent,
    FooterAuthenticationComponent,
    UnlockAccountComponent
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    HttpClientModule
  ]
})
export class AuthenticationModule { }
