import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistoComponent } from './registo/registo.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'register', component: RegistoComponent },
  { path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
