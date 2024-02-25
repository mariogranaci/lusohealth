import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../shared/models/authentication/user';
import { AuthenticationService } from '../../authentication/authentication.service';
import { take } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile.service';
import { Subject, takeUntil } from 'rxjs';
import { Professional } from '../../shared/models/profile/professional';

@Component({
  selector: 'app-private-profile-professional',
  templateUrl: './private-profile-professional.component.html',
  styleUrl: './private-profile-professional.component.css'
})
export class PrivateProfileProfessionalComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();;
  addSpecialityForm: FormGroup = new FormGroup({});
  editSpecialityForm: FormGroup = new FormGroup({});
  submitted = false;
  errorMessages: string[] = [];
  responseText: string | undefined;
  public userData: Professional | undefined;

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private router: Router) {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (!user) {
          this.router.navigateByUrl('/');
        }
      }
    });
  }
  ngOnInit(): void {
    this.initializeForm();
    this.getProfessionalInfo().then(() => {
      this.setUserFields();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initializeForm() {

    this.addSpecialityForm = this.formBuilder.group({

      selectSpeciality: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      presencial: ['', [Validators.required]],
      online: ['', [Validators.required]],
      domicilio: ['', [Validators.required]]
    })

    this.editSpecialityForm = this.formBuilder.group({
      id: [''],
      price: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      presencial: ['', [Validators.required]],
      online: ['', [Validators.required]],
      domicilio: ['', [Validators.required]]
    })
  }

  getProfessionalInfo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.profileService.getProfessionalInfo().pipe(takeUntil(this.unsubscribe$)).subscribe(
        (userData: Professional) => {
          console.log(userData);
          this.userData = userData;
          resolve();
        },
        error => {
          console.log(error);
          reject(error); // You might want to handle error cases here
        }
      );
    });
  }

  setUserFields() {

    const nomeElement = document.getElementById('nome');
    const apelidoElement = document.getElementById('apelido');
    const emailElement = document.getElementById('email');
    const telemovelElement = document.getElementById('telemovel');
    const nifElement = document.getElementById('nif');
    const genderElement = document.getElementById('gender');

    if (nomeElement && apelidoElement && emailElement && telemovelElement && nifElement && genderElement && this.userData) {
      nomeElement.textContent = this.userData.professionalInfo.firstName;
      apelidoElement.textContent = this.userData.professionalInfo.lastName;
      emailElement.textContent = this.userData.professionalInfo.email;
      telemovelElement.textContent = this.userData.professionalInfo.telemovel;
      nifElement.textContent = this.userData.professionalInfo.nif;
      genderElement.textContent = (this.userData.professionalInfo.genero === "M") ? "Masculino" : "Feminino" ;
    }
  }

  addSpeciality() {
    this.submitted = true;
    this.errorMessages = [];
    this.responseText = '';
  }


  openPopup(opcao: string) {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-speciality-container');
    const edit = document.getElementById('edit-speciality-container');

    if (edit) {
      edit.style.display = "none";
    }
    if (add) {
      add.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (opcao == "add") {
        if (add) {
          add.style.display = "block";
        }
      }
      else if (opcao == "edit") {
        if (edit) {
          edit.style.display = "block";
        }
      }
    }
  }

  closePopup() {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-speciality-container');
    const edit = document.getElementById('edit-speciality-container');

    if (overlay) {
      overlay.style.display = 'none';
      if (edit) {
        edit.style.display = "none";
      }
      if (add) {
        add.style.display = "none";
      }
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
