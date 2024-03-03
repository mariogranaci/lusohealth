import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditPerfilComponent } from './edit-perfil/edit-perfil.component';
import { RouterModule, Routes } from '@angular/router';
import { PrivateProfileProfessionalComponent } from './private-profile-professional/private-profile-professional.component';
import { PerfilPacienteComponent } from './perfil-paciente/perfil-paciente.component';
import { PublicProfileProfessionalComponent } from './public-profile-professional/public-profile-professional.component';

const routes: Routes = [
  { path: 'edit-profile', component: EditPerfilComponent },
  { path: 'edit-professional-profile', component: PrivateProfileProfessionalComponent },
  { path: 'professional-profile', component: PublicProfileProfessionalComponent },
  { path: 'patient-profile', component: PerfilPacienteComponent }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
