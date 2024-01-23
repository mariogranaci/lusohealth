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

@NgModule({
  declarations: [
    LoginComponent,
    RegistoComponent,
    RecuperarContaComponent,
    RecuperarPassComponent,
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
