import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../shared/models/authentication/user';
import { AuthenticationService } from '../../authentication/authentication.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-private-profile-professional',
  templateUrl: './private-profile-professional.component.html',
  styleUrl: './private-profile-professional.component.css'
})
export class PrivateProfileProfessionalComponent {
  addSpecialityForm: FormGroup = new FormGroup({});
  submitted = false;
  errorMessages: string[] = [];
  responseText: string | undefined;

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router) {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        }
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {

    this.addSpecialityForm = this.formBuilder.group({

      selectSpeciality: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      presencial: ['', [Validators.required]],
      online: ['', [Validators.required]],
      domicilio: ['', [Validators.required]]
    })
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
