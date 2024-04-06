import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { ModerationRoutingModule } from './moderation-routing.module';
import { ModerationComponent } from './moderation/moderation.component';
import { ReportsComponent } from './reports/reports.component';


@NgModule({
  declarations: [
    ModerationComponent,
    ReportsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    ModerationRoutingModule
  ],
  exports: [
    HttpClientModule
  ]
})
export class ModerationModule { }
