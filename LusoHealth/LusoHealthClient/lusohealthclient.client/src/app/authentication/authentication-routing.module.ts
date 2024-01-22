import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistoComponent } from './registo/registo.component';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'register', component: RegistoComponent },
  { path: 'login', component: LoginComponent },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
