import { Component } from '@angular/core';
import { ProfileService } from '../profile.service';
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
  submitted = false;
  loading = false;
  errorMessages: string[] = [];
  private unsubscribe$ = new Subject<void>();
  relatives: Relative[] = [];
  addRelativeForm: FormGroup = new FormGroup({});
  editRelativeForm: FormGroup = new FormGroup({});
  public selectedRelative: Relative | null = null;

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

  /**
   * Obtém informações do perfil do utilizador.
   */
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

  /**
   * Inicializa os formulários de adição e edição de parentes.
   */
  initializeForm() {

    this.addRelativeForm = this.formBuilder.group({

      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      nif: ['', [Validators.minLength(9), Validators.maxLength(9)]],
      dataNascimento: ['', [Validators.required, this.idadeValidator]],
      genero: ['', [Validators.required]],
      localizacao: [''],
    })

    this.editRelativeForm = this.formBuilder.group({

      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      nif: ['', [Validators.minLength(9), Validators.maxLength(9)]],
      dataNascimento: ['', [Validators.required, this.idadeValidator]],
      genero: ['', [Validators.required]],
      localizacao: [''],
    })
  }

  /**
   * Define os campos do perfil do utilizador.
   */
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

  /**
   * Define os valores do formulário de edição com base no parente selecionado.
   */
  setEditForm(relative: Relative)
  {
    this.editRelativeForm.setValue({
      nome: relative.nome,
      nif: relative.nif,
      dataNascimento: relative.dataNascimento,
      genero: relative.genero,
      localizacao: relative.localizacao
    }) 
  }

  /**
  * Obtém a lista de parentes do utilizador.
  */
  getRelatives() {
    this.profileService.getRelatives().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (relatives: Relative[]) => {
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

  /**
   * Exclui um parente com o ID fornecido.
   */
  deleteRelative(relativeId: number | null){
    if (relativeId != null)
    {
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
  }


  /**
   * Adiciona um novo parente.
   */
  addRelative() {
    this.submitted = true;
    if (this.addRelativeForm.valid)
    {
      var form = this.addRelativeForm.value;
      var relative = new Relative(
        null,
        form.nome,
        form.nif ? form.nif.toString() : null,
        form.dataNascimento,
        form.genero,
        null,
      )
      this.profileService.addRelative(relative).subscribe({
        next: () => {
          console.log('Relative added successfully');
          this.getRelatives();
          this.closePopup();
        },
        error: (error) => {
          console.log('Error adding relative:', error);
        }
      });
    }
  }

  /**
   * Atualiza os dados de um parente.
   */
  updateRelative(relative: Relative | null) {
    this.submitted = true;
    if (relative != null && this.editRelativeForm.valid)
    {
      var form = this.editRelativeForm.value;
      relative.nome = form.nome;
      relative.nif = form.nif ? form.nif.toString() : null;
      relative.dataNascimento = form.dataNascimento;
      relative.genero = form.genero;
      relative.localizacao = form.localizacao;

      this.profileService.updateRelative(relative).subscribe({
        next: () => {
          console.log('Relative updated successfully');
          this.getRelatives();
          this.closePopup();
        },
        error: (error) => {
          console.log('Error updating relative:', error);
        }
      });
    }
  }

  /**
   * Abre o pop-up para adicionar ou editar parentes.
   */
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

  /**
   * Fecha o pop-up de adição ou edição de parentes.
   */
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

  /**
  * Chama várias funções para abrir o pop-up de edição e configura o formulário com os dados do parente selecionado.
  */
  callMultipleFunctions(formType: string, relative: Relative): void {
    this.openPopup(formType);
    this.setEditForm(relative);
    this.selectedRelative = relative;
  }

  /**
   * Impede a propagação de eventos.
   */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  /**
   * Validador de idade para garantir que a data de nascimento seja válida.
   */
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
    }
    return null;
  }

}
