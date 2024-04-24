import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotFoundComponent } from './components/errors/not-found/not-found.component';
import { ValidationMessagesComponent } from './components/errors/validation-messages/validation-messages.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { PopUpSuccessComponent } from './components/pop-up-success/pop-up-success.component';
import { FirstWordPipe } from './pipes/first-word.pipe';



@NgModule({
  declarations: [
    NotFoundComponent,
    ValidationMessagesComponent,
    LoadingSpinnerComponent,
    PopUpSuccessComponent,
    FirstWordPipe
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule,
    ValidationMessagesComponent,
    LoadingSpinnerComponent,
    PopUpSuccessComponent,
    FirstWordPipe
  ]
})
export class SharedModule { }
