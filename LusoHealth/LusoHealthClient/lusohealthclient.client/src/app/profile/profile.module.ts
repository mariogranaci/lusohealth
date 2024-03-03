import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditPerfilComponent } from './edit-perfil/edit-perfil.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ProfileRoutingModule } from './profile-routing.module';
import { PrivateProfileProfessionalComponent } from './private-profile-professional/private-profile-professional.component';
import { PerfilPacienteComponent } from './perfil-paciente/perfil-paciente.component';
import { PublicProfileProfessionalComponent } from './public-profile-professional/public-profile-professional.component';




@NgModule({
  declarations: [
    EditPerfilComponent,
    PrivateProfileProfessionalComponent,
    PerfilPacienteComponent,
    PublicProfileProfessionalComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    HttpClientModule
  ]
})
export class ProfileModule { }
