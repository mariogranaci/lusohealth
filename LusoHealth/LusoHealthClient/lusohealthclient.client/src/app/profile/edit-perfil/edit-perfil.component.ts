import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../shared/models/authentication/user';
import { environment } from '../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
import { EditarPerfil } from '../../shared/models/profile/editarPerfil';
import { ProfileService } from '../profile-service.service';


@Component({
  selector: 'app-edit-perfil',
  templateUrl: './edit-perfil.component.html',
  styleUrl: './edit-perfil.component.css'
})
export class EditPerfilComponent implements OnInit {
  perfilForm: FormGroup = new FormGroup({});
  passwordForm: FormGroup = new FormGroup({});
  errorMessages: string[] = [];

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

  private getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return null;
    }
  }

  getEmailFromToken() {
    const jwt = this.getJWT();
    if (jwt != null) {
      const decodedToken: any = jwtDecode(jwt);
     return decodedToken.email;
    }
    
  }

  getFirstNameFromToken() {
    const jwt = this.getJWT();
    if (jwt != null) {
      const decodedToken: any = jwtDecode(jwt);
      const fullName = decodedToken.unique_name; 
      const firstName = fullName?.split(' ')[0];
      return firstName;
    }

  }

  getLastNameFromToken() {
    const jwt = this.getJWT();
    if (jwt != null) {
      const decodedToken: any = jwtDecode(jwt);
      const fullName = decodedToken.unique_name;
      const lastName = fullName?.split(' ')[1];
      return lastName;
    }

  }

  

  ngOnInit() {
    
    this.perfilForm = this.fb.group({
      firstName: [this.getFirstNameFromToken(), [ Validators.minLength(3), Validators.maxLength(50)]],
      lastName: [this.getLastNameFromToken(), [Validators.minLength(3), Validators.maxLength(50)]],
      email: [this.getEmailFromToken(), [ Validators.email]],
      telemovel: ['', [Validators.minLength(9), Validators.maxLength(9)]],
      nif: ['', [ Validators.minLength(9), Validators.maxLength(9)]],
      genero: ['']
    });

    this.passwordForm = this.fb.group({
      passwordAtual: [''],
      novaPassword: [''],
      repetirNovaPassword: ['']
    });
  }

  
  atualizarPerfil() {
    console.log(this.perfilForm.value);
    this.profileService.getUserData().subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (error) => {
        console.log(error);
        //if (error.error.errors) {
        //  this.errorMessages = error.error.errors;
        //} else {
        //  this.errorMessages.push(error.error);
        //}
      }
    },
    );
  }

  alterarPassword() {
    
    console.log(this.passwordForm.value);
  }
}

