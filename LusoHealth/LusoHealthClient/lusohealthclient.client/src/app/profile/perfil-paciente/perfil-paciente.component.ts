import { Component } from '@angular/core';
import { ProfileService } from '../profile-service.service';
import { UserProfile } from '../../shared/models/profile/userProfile';
import { Relative } from '../../shared/models/profile/relative';
import { Subject, takeUntil } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-perfil-paciente',
  templateUrl: './perfil-paciente.component.html',
  styleUrl: './perfil-paciente.component.css'
})
export class PerfilPacienteComponent {
  loading = false;
  errorMessages: string[] = [];
  private unsubscribe$ = new Subject<void>();
  relatives: Relative[] = [];
  addRelativeForm: FormGroup = new FormGroup({});

  constructor(private profileService: ProfileService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.setFields();
    this.getRelatives();
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

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

  initializeForm() {

    this.addRelativeForm = this.formBuilder.group({

      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      nif: ['', [Validators.minLength(9), Validators.maxLength(9)]],
      dataNascimento: ['', [Validators.required, this.idadeValidator]],
      genero: ['', [Validators.required]],
      localizacao: ['', [Validators.required]],
    })
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

  getRelatives() {
    this.profileService.getRelatives().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (relatives: Relative[]) => {
        console.log(relatives);
        this.relatives = relatives;
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  deleteRelative(relativeId: number){
    this.profileService.deleteRelative(relativeId).subscribe({
      next: () => {
        this.relatives = this.relatives.filter(relative => relative.id !== relativeId);
        this.getRelatives();
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  addRelative() {

    var form = this.addRelativeForm.value;

    var relative = {
      id: 0,
      nome: form.nome,
      nif: form.nif,
      dataNascimento: form.dataNascimento,
      genero: form.genero,
      localizacao: form.localizacao,
    }

    console.log(this.addRelativeForm.value);

    this.profileService.addRelative(relative).subscribe({
      next: () => {
        console.log('Relative added successfully');
      },
      error: (error) => {
        console.error('Error adding relative:', error);
      }
    });
    this.closePopup();
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

  idadeValidator(control: AbstractControl): { [key: string]: any } | null {
    if (control.value) {
      const dataNascimento = new Date(control.value);

      if (isNaN(dataNascimento.getTime())) {
        return { 'error': 'Introduza uma data válida.' };
      }
      const hoje = new Date();
      let diferencaAnos = hoje.getFullYear() - dataNascimento.getFullYear();

      if (
        hoje.getMonth() < dataNascimento.getMonth() ||
        (hoje.getMonth() === dataNascimento.getMonth() && hoje.getDate() < dataNascimento.getDate())
      ) {
        diferencaAnos--;
      }

      if (diferencaAnos > 110 || diferencaAnos < 0) {
        return { 'error': 'Introduza uma data válida.' };
      }

      if (diferencaAnos < 18) {
        return { 'idade': 'A idade deve ser maior que 18 anos.' };
      }
    }
    return null;
  }

}
