import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../shared/models/authentication/user';
import { environment } from '../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
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


  constructor(private fb: FormBuilder,
    private profileService: ProfileService) { }

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
      console.log(decodedToken);
    }
    
  }

  ngOnInit() {
    // Inicialize os formulários com dados da base de dados
    this.perfilForm = this.fb.group({
      firstName: ['', [ Validators.minLength(3), Validators.maxLength(50)]],
      lastName: ['', [Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [ Validators.email]],
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

