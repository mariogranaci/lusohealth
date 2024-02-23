import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { User } from '../../shared/models/authentication/user';
import { environment } from '../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
import { EditarPerfil } from '../../shared/models/profile/editarPerfil';
import { ProfileService } from '../profile-service.service';
import { UserProfile } from '../../shared/models/profile/userProfile';
import { Observable, Subject, never, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';


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

  firstName: string | null = null;
  lastName: string | null = null;
  email: string | null = null;
  telemovel: string | null = null;
  nif: string | null = null;
  genero: string | null = null;
  provider = false;

  caminhoDaImagem: string | null = "https://static.vecteezy.com/ti/vetor-gratis/p3/3715527-imagem-perfil-icone-masculino-icone-humano-ou-pessoa-sinal-e-simbolo-vetor.jpg";
  arquivoSelecionado: File | null = null;

  constructor(private fb: FormBuilder,
    private profileService: ProfileService) { }

  selecionarArquivo(event: any) {
    const inputElement = event.target;

    if (inputElement.files && inputElement.files.length > 0) {
      this.arquivoSelecionado = inputElement.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.caminhoDaImagem = e.target.result;
      };
      if (this.arquivoSelecionado)
        reader.readAsDataURL(this.arquivoSelecionado);
    }
  }

  enviarFormulario() {
    this.responseText = '';

    if (this.arquivoSelecionado) {
      // Convert the selected file to base64 string
      this.convertFileToBase64(this.arquivoSelecionado).then((base64String) => {
        // Create a UserProfile model with the base64String (assuming "Picture" corresponds to the URL property)
        const model = new UserProfile(null, null, null, null, null, null, null, base64String, null);

        // Call the updatePicture method from the profile service
        this.profileService.updatePicture(model).subscribe(
          (response: any) => {
            // Update the caminhoDaImagem with the new image path from the response
            this.caminhoDaImagem = response.value.newImagePath;
            this.responseText = response.value.message;
          },
          (error) => {
            // Handle errors (logging or displaying error messages)
            console.error('Error updating profile picture', error);
            if (error.error.errors) {
              this.errorMessages = error.error.errors;
            } else {
              this.errorMessages.push(error.error);
            }
          }
        );
      });
    } else {
      // If no file is selected, update the profile with the current caminhoDaImagem
      const model = new UserProfile(null, null, null, null, null, null, null, this.caminhoDaImagem, null);

      // Call the updatePicture method from the profile service
      this.profileService.updatePicture(model).subscribe(
        (response: any) => {
          // Update the responseText with the success message
          this.responseText = response.value.message;
        },
        (error) => {
          // Handle errors (logging or displaying error messages)
          console.error('Error updating profile picture', error);
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        }
      );
    }
  }



  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]); 
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }


  openFiles() {
    const OpenImgUpload = document.getElementById('OpenImgUpload');
    const imgupload = document.getElementById('imgupload');

    if (OpenImgUpload != null && imgupload != null) {
      OpenImgUpload.addEventListener('click', function () {
        imgupload.click();
      });
    }

  }

  getUserProfileInfo() {
    this.profileService.getUserData().subscribe({
      next: (response: UserProfile) => {
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
    this.openFiles();
    
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setFields() {
    this.profileService.getUserData().pipe(takeUntil(this.unsubscribe$)).subscribe(
      (userData: UserProfile) => {
        console.log(userData.provider);
        if (userData.provider) {
          this.provider = true;
        }
        this.firstName = userData.firstName;
        this.lastName = userData.lastName;
        this.email = userData.email;
        this.telemovel = userData.telemovel;
        this.nif = userData.nif;
        this.genero = userData.genero;
        if (userData.picture)
          this.caminhoDaImagem = userData.picture;

          this.perfilForm.setValue({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            telemovel: userData.telemovel,
            nif: userData.nif,
            genero: userData.genero
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
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)], [this.passwordPatternValidator()]],
      novaPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)], [this.passwordPatternValidator()]],
      repetirNovaPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)], [this.passwordPatternValidator()]]
    });
  }

  atualizarPerfil() {
    this.submittedProfile = true;
    this.errorMessages = [];
    this.responseText = '';
    
    const firstName = this.perfilForm.get('firstName')?.value;
    const lastName = this.perfilForm.get('lastName')?.value;
    const email = this.perfilForm.get('email')?.value;
    const nif = this.perfilForm.get('nif')?.value;
    const telemovel = this.perfilForm.get('telemovel')?.value;
    const genero = this.perfilForm.get('genero')?.value;

    if (!(this.firstName === firstName && this.lastName === lastName && this.email === email
      && this.nif === nif && this.telemovel === telemovel && this.genero === genero)) {


      const model = new UserProfile(firstName, lastName, email, nif, telemovel, null, genero, null, null);

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
    else {
      this.errorMessages.push("Para atualizar os dados é necessário modificá-los.");
      console.log(this.errorMessages.length);
    }
  }

  alterarPassword() {
    this.submittedPassword = true;
    this.errorMessages = [];
    this.responseText = '';
   
    

    if (this.passwordForm.valid) {
      this.profileService.updatePassword({
        currentPassword: this.passwordForm.value.password,
        newPassword: this.passwordForm.value.novaPassword,
        confirmNewPassword: this.passwordForm.value.repetirNovaPassword
      }).subscribe({
        next: (response: any) => {
          this.responseText = response.value.message;
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

  passwordPatternValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value: string = control.value || '';

      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(pattern.test(value) ? null : { passwordPattern: true });
        }, 0);
      });
    };
  }

 
}

