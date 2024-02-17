import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-edit-perfil',
  templateUrl: './edit-perfil.component.html',
  styleUrl: './edit-perfil.component.css'
})
export class EditPerfilComponent implements OnInit {
 
  perfilForm: FormGroup = new FormGroup({});
  passwordForm: FormGroup = new FormGroup({});
  errorMessages: string[] = [];


  constructor(private fb: FormBuilder) { }

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
  }

  alterarPassword() {
    
    console.log(this.passwordForm.value);
  }
}

