import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../profile.service';
import { UserProfile } from '../../shared/models/profile/userProfile';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-perfil',
  templateUrl: './edit-perfil.component.html',
  styleUrl: './edit-perfil.component.css'
})
export class EditPerfilComponent implements OnInit {
  perfilForm: FormGroup = new FormGroup({});
  passwordForm: FormGroup = new FormGroup({});
  errorMessages: string[] = [];
  responseText: string | undefined;
  submittedProfile = false;
  submittedPassword = false;
  loading = false;
  private unsubscribe$ = new Subject<void>();

  caminhoDaImagem: string | null = null;
  arquivoSelecionado: File | null = null;

  constructor(private fb: FormBuilder,
    private profileService: ProfileService) { }

  selecionarArquivo(event: any) {
    const arquivoInput = event.target;
    if (arquivoInput.files && arquivoInput.files.length > 0) {
      this.arquivoSelecionado = arquivoInput.files[0];

      // Para exibir a imagem imediatamente após a seleção
      const leitor = new FileReader();
      leitor.onload = (e: any) => {
        this.caminhoDaImagem = e.target.result;
      };
      if (this.arquivoSelecionado) {
        leitor.readAsDataURL(this.arquivoSelecionado);
      }
    }
  }

  enviarFormulario() {
    // Aqui você pode enviar o arquivo para o servidor ou realizar outras ações
    // Certifique-se de manipular o arquivo conforme necessário.
    console.log('Arquivo selecionado:', this.arquivoSelecionado);
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


  ngOnInit() {
    this.initializeForm();
    this.setFields();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setFields() {
    this.profileService.getUserData().pipe(takeUntil(this.unsubscribe$)).subscribe(
      (userData: UserProfile) => {

          this.perfilForm.setValue({
            firstName: userData.firstName,
            lastName: userData['lastName'],
            email: userData.email,
            telemovel: userData['telemovel'],
            nif: userData['nif'],
            genero: userData['genero']
          });
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
  
  initializeForm() {
      this.perfilForm = this.fb.group({
        firstName: ['', [Validators.minLength(3), Validators.maxLength(50)]],
        lastName: ['', [Validators.minLength(3), Validators.maxLength(50)]],
        email: ['', [Validators.email]],
        telemovel: ['', [Validators.minLength(9), Validators.maxLength(9)]],
        nif: ['', [Validators.minLength(9), Validators.maxLength(9)]],
        genero: ['', [Validators.required]]
      });

    this.passwordForm = this.fb.group({
      password: [''],
      novaPassword: [''],
      repetirNovaPassword: ['']
    });
  }

  
  atualizarPerfil() {
    this.submittedProfile = true;
    this.submittedPassword = false;
    this.errorMessages = [];
    this.responseText = '';
    
    const firstName = this.perfilForm.get('firstName')?.value;
    const lastName = this.perfilForm.get('lastName')?.value;
    const email = this.perfilForm.get('email')?.value;
    const nif = this.perfilForm.get('nif')?.value;
    const telemovel = this.perfilForm.get('telemovel')?.value;
    const genero = this.perfilForm.get('genero')?.value;

    const model = new UserProfile(firstName, lastName, email, nif, telemovel, null, genero, null);

    if (this.perfilForm.valid) {
      this.profileService.updateUserData(model).subscribe({
        next: (response: any) => {
          console.log(response);
          this.setFields();
          this.responseText = response.value.message;
        },
        error: (error) => {
          console.log(error);
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        }
      },
      );
    }
    
  }

  alterarPassword() {
    this.submittedProfile = false;
    this.submittedPassword = true;
    this.errorMessages = [];
    

    if (this.passwordForm.value.novaPassword !== this.passwordForm.value.repetirNovaPassword) {
      this.errorMessages.push("As novas passwords não condizem.");
      return; 
    }

    this.profileService.updatePassword({
      email: this.perfilForm.value.email,
      currentPassword: this.passwordForm.value.password,
      newPassword: this.passwordForm.value.novaPassword,
      confirmNewPassword: this.passwordForm.value.repetirNovaPassword
    }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.passwordForm.reset(); // Clear the password form
        // Display success message or perform any additional actions
        this.errorMessages.push("Password alterada com sucesso.");
      },
      error: (error) => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

 
}

