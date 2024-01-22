import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//import { RegistoComponent } from './registo/registo.component';
//import { LoginComponent } from './login/login.component';
import { RecuperarPassComponent } from './recuperar-pass/recuperar-pass.component';
import { AlterarPassComponent } from './alterar-pass/alterar-pass.component';

const routes: Routes = [
  { path: 'account', loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule) },
  //{ path: 'register', component: RegistoComponent },
  //{ path: 'login', component: LoginComponent },
  { path: 'recuperar-pass', component: RecuperarPassComponent },
  { path: 'alterar-pass', component: RecuperarPassComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
