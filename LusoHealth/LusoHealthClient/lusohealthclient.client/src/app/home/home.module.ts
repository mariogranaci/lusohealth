import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page/home-page.component';
import { HomeRoutingModule } from './home-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { AboutUsComponent } from './about-us/about-us.component';



@NgModule({
  declarations: [HomePageComponent, AboutUsComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    HttpClientModule
  ]
})
export class HomeModule { }
