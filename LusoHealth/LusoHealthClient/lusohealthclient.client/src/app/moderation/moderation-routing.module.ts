import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ModerationComponent } from './moderation/moderation.component';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
  { path: 'moderation', component: ModerationComponent },
  { path: 'reports', component: ReportsComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ModerationRoutingModule { }
