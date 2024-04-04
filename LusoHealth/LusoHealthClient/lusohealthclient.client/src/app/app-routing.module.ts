import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/errors/not-found/not-found.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
  { path: '', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
  { path: '', loadChildren: () => import('./services/services.module').then(m => m.ServicesModule) },
  { path: '', loadChildren: () => import('./agenda/agenda.module').then(m => m.AgendaModule) },
  { path: '', loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule) },
  { path: '', loadChildren: () => import('./appointment/appointment.module').then(m => m.AppointmentModule) },
  { path: '', loadChildren: () => import('./moderation/moderation.module').then(m => m.ModerationModule) },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
