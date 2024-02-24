import { Component } from '@angular/core';
import { ProfileService } from '../profile.service';
import { UserProfile } from '../../shared/models/profile/userProfile';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-perfil-paciente',
  templateUrl: './perfil-paciente.component.html',
  styleUrl: './perfil-paciente.component.css'
})
export class PerfilPacienteComponent {
  loading = false;
  errorMessages: string[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(private profileService: ProfileService) { }

  getUserProfileInfo() {
    this.profileService.getUserData().subscribe({
      next: (response: UserProfile) => {
        console.log(response);
        return response;
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
        return error;
      }
    },
    );
  }

  setFields() {
    const nomeElement = document.getElementById('nome');
    const apelidoElement = document.getElementById('apelido');
    const emailElement = document.getElementById('email');
    const telemovelElement = document.getElementById('telemovel');
    const nifElement = document.getElementById('nif');
    const genderElement = document.getElementById('gender');

    if (nomeElement && apelidoElement && emailElement && telemovelElement && nifElement && genderElement) {
      this.profileService.getUserData().pipe(takeUntil(this.unsubscribe$)).subscribe(
        (userData: UserProfile) => {
          nomeElement.textContent = userData.firstName;
          apelidoElement.textContent = userData.lastName;
          emailElement.textContent = userData.email;
          telemovelElement.textContent = userData.telemovel;
          nifElement.textContent = userData.nif;
          genderElement.textContent = userData.genero;
        },
        error => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        }
      );
    }
  }



  ngOnInit() {
    this.setFields();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
