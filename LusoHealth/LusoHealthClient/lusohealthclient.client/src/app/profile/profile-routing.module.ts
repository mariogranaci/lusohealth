import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditPerfilComponent } from './edit-perfil/edit-perfil.component';
import { RouterModule, Routes } from '@angular/router';
import { PrivateProfileProfessionalComponent } from './private-profile-professional/private-profile-professional.component';

const routes: Routes = [
  { path: 'edit-profile', component: EditPerfilComponent },
  { path: 'professional-profile', component: PrivateProfileProfessionalComponent }
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
