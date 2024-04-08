import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistoComponent } from './registo/registo.component';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { AlterarPassComponent } from './alterar-pass/alterar-pass.component';
import { RegisterWithGoogleComponent } from './register-with-google/register-with-google.component';
import { UnlockAccountComponent } from './unlock-account/unlock-account.component';

const routes: Routes = [
  { path: 'register', component: RegistoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'unlock-account', component: UnlockAccountComponent },
  { path: 'reset-password', component: AlterarPassComponent },
  { path: 'external-register/:provider', component: RegisterWithGoogleComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
