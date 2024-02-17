import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditPerfilComponent } from './edit-perfil/edit-perfil.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'edit-profile', component: EditPerfilComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
