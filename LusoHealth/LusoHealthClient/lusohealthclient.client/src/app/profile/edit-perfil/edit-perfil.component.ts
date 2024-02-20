import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../shared/models/authentication/user';
import { environment } from '../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
import { EditarPerfil } from '../../shared/models/profile/editarPerfil';
import { ProfileService } from '../profile-service.service';
import { UserProfile } from '../../shared/models/profile/userProfile';


@Component({
  selector: 'app-edit-perfil',
  templateUrl: './edit-perfil.component.html',
  styleUrl: './edit-perfil.component.css'
})
export class EditPerfilComponent implements OnInit {
  perfilForm: FormGroup = new FormGroup({});
  passwordForm: FormGroup = new FormGroup({});
  errorMessages: string[] = [];
  submittedProfile = false;
  submittedPassword = false;

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
      next: (response: any) => {
        return response;
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
        return null;
      }
    },
    );
    return null;
  }


  ngOnInit() {

    this.perfilForm = this.fb.group({
      firstName: ['Francisco', [ Validators.minLength(3), Validators.maxLength(50)]],
      lastName: ['Vaz', [Validators.minLength(3), Validators.maxLength(50)]],
      email: ['franciscocaeirovaz@gmail.com', [ Validators.email]],
      telemovel: ['123456789', [Validators.minLength(9), Validators.maxLength(9)]],
      nif: ['123456789', [ Validators.minLength(9), Validators.maxLength(9)]],
      genero: ['M']
    });

    this.passwordForm = this.fb.group({
      password: ['Pass1234'],
      novaPassword: [''],
      repetirNovaPassword: ['']
    });

  }
  
  
  atualizarPerfil() {
    this.submittedProfile = true;
    this.submittedPassword = false;
    this.errorMessages = [];
    this.profileService.getUserData().subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (error) => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    },
    );
  }

  alterarPassword() {
    this.submittedProfile = false;
    this.submittedPassword = true;
    this.errorMessages = [];
    console.log(this.passwordForm.value);
  }
}

