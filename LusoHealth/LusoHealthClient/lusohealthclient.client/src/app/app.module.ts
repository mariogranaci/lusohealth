import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HomePageComponent } from './home-page/home-page.component';




@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomePageComponent
  
  ],
  imports: [
    BrowserModule, HttpClientModule,
    AppRoutingModule, FormsModule
   
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
