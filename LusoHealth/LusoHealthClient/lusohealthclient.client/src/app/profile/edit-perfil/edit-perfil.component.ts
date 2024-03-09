import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ProfileService } from '../profile.service';
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
  pictureForm: FormGroup  = new FormGroup({});
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
  imagemNome: string = '';

  caminhoDaImagem: string | null = "https://static.vecteezy.com/ti/vetor-gratis/p3/3715527-imagem-perfil-icone-masculino-icone-humano-ou-pessoa-sinal-e-simbolo-vetor.jpg";
  arquivoSelecionado: File | null = null;
    

  constructor(private fb: FormBuilder,
    private profileService: ProfileService) { }



  openFiles() {
    const imgupload = document.getElementById('imgupload') as HTMLInputElement;

    if (imgupload != null) {
      imgupload.click();
    }
  }

  getImage(): void {
    this.profileService.getProfilePicture().subscribe(
      (blob: Blob) => {
        this.convertBlobToDataURL(blob).then(dataURL => {
          // Use the dataURL to set the source of the <img> tag
          this.caminhoDaImagem = dataURL;
        });
      },
      error => {
        console.error('Error downloading image:', error);
      }
    );
  }

  convertBlobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const dataURL = reader.result as string;
        resolve(dataURL);
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(blob);
    });
  }


 /* convertFileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const dataURL = reader.result as string;
        resolve(dataURL);
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  }*/

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.responseText = undefined;

    if (file.type.startsWith('image/')) {
      this.profileService.updatePicture(file).subscribe(
        response => {
          this.responseText = response.value.message;
          this.getImage();

          if (response && response.imageUrl) {
            
          }
        },
        error => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
          return error;
        }
      );
    } else {
      this.errorMessages.push('Ficheiro não é uma imagem (JPG ou PNG).');
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
    this.getImage();
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
       /* if (userData.picture)
          this.caminhoDaImagem = userData.picture;*/

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


      const model = new UserProfile(null, firstName, lastName, email, nif, telemovel, null, genero, null, null);

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

