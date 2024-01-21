import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RecuperarPassComponent } from './recuperar-pass/recuperar-pass.component';
import { AlterarPassComponent } from './alterar-pass/alterar-pass.component';
import { RecuperarContaComponent } from './recuperar-conta/recuperar-conta.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RecuperarPassComponent,
    AlterarPassComponent,
    RecuperarContaComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
