import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../shared/models/authentication/user';
import { AuthenticationService } from '../../authentication/authentication.service';
import { take } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile.service';
import { Subject, takeUntil } from 'rxjs';
import { Professional } from '../../shared/models/profile/professional';
import { Service } from '../../shared/models/profile/service';
import { Specialty } from '../../shared/models/profile/specialty';
import { Review } from '../../shared/models/profile/review';
import { Certificate } from '../../shared/models/profile/certificate';

@Component({
  selector: 'app-private-profile-professional',
  templateUrl: './private-profile-professional.component.html',
  styleUrl: './private-profile-professional.component.css'
})
export class PrivateProfileProfessionalComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();;
  addSpecialityForm: FormGroup = new FormGroup({});
  editSpecialityForm: FormGroup = new FormGroup({});
  updateDescriptionForm: FormGroup = new FormGroup({});
  submittedAdd = false;
  submittedEdit = false;
  submittedDescription = false;
  selectEditService: Service | undefined;
  errorMessages: string[] = [];
  /*responseText: string | undefined;*/
  public userData: Professional | undefined;
  public specialties: Specialty[] | undefined;
  public profileImagePath = "/assets/images/Perfil/profileImage.jpg";
  public selectedSpecialtyReview = 0;
  public reviews = null;
  pdfList: Certificate[] = [];

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private router: Router) {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (!user) {
          this.router.navigateByUrl('/');
        }
      }
    });
  }
  ngOnInit(): void {
    this.initializeForm();
    this.getProfessionalInfo().then(() => {
      this.setUserFields();
      this.getDescription();
      //this.filterReviews();
    });
    this.getSpecialties();
    this.getPdfs();

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  reloadTableData(): void {
    this.getProfessionalInfo();
  }

  initializeForm() {

    this.addSpecialityForm = this.formBuilder.group({
      selectSpeciality: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      presencial: ['', [Validators.required]],
      online: ['', [Validators.required]],
      domicilio: ['', [Validators.required]]
    });

    this.editSpecialityForm = this.formBuilder.group({
      price: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      presencial: ['', [Validators.required]],
      online: ['', [Validators.required]],
      domicilio: ['', [Validators.required]]
    });

    this.updateDescriptionForm = this.formBuilder.group({
      description: ['', [Validators.maxLength(5000)]],
    });
  }

  getProfessionalInfo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.profileService.getProfessionalInfo().pipe(takeUntil(this.unsubscribe$)).subscribe(
        (userData: Professional) => {
          console.log(userData);
          this.userData = userData;
          /*var review1 = {
            idPatient: "3",
            patientName: "Macho Man",
            patientPicture: "https://lh3.googleusercontent.com/a/ACg8ocIPXKhLd6de-EUAJqJMHueiODlt9uqkjPQMs9OdKH5F=s96-c",
            idService: 21,
            serviceName: "Cirurgia Plástica, Reconstrutiva e Estética",
            stars: 5,
            description: "Este chavalo é muito bom.",
          }
          var review2 = {
            idPatient: "2",
            patientName: "Macho Woman",
            patientPicture: "https://lh3.googleusercontent.com/a/ACg8ocIPXKhLd6de-EUAJqJMHueiODlt9uqkjPQMs9OdKH5F=s96-c",
            idService: 22,
            serviceName: "Anestesiologia",
            stars: 4,
            description: "És top.",
          }
          this.userData.reviews.push(review1, review2);*/
          resolve();
        },
        error => {
          console.log(error);
          reject(error); // You might want to handle error cases here
        }
      );
    });
  }

  getSpecialties() {
    this.profileService.getServices().pipe(takeUntil(this.unsubscribe$)).subscribe(
      (specialties: Specialty[]) => {
        console.log(specialties);
        this.specialties = specialties;
      },
      error => {
        console.log(error);
      }
    );
  }

  setUserFields() {

    const nomeElement = document.getElementById('nome');
    const apelidoElement = document.getElementById('apelido');
    const emailElement = document.getElementById('email');
    const telemovelElement = document.getElementById('telemovel');
    const nifElement = document.getElementById('nif');
    const genderElement = document.getElementById('gender');

    if (nomeElement && apelidoElement && emailElement && telemovelElement && nifElement && genderElement && this.userData) {
      nomeElement.textContent = this.userData.professionalInfo.firstName;
      apelidoElement.textContent = this.userData.professionalInfo.lastName;
      emailElement.textContent = this.userData.professionalInfo.email;
      telemovelElement.textContent = this.userData.professionalInfo.telemovel;
      nifElement.textContent = this.userData.professionalInfo.nif;
      genderElement.textContent = (this.userData.professionalInfo.genero === "M") ? "Masculino" : "Feminino";

      if (this.userData.professionalInfo.picture) {
        this.profileImagePath = this.userData.professionalInfo.picture;
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    // Check if the file is a PDF
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      this.profileService.uploadPdf(file).subscribe(
        response => {
          console.log('PDF uploaded successfully.');
          this.getPdfs(); 

          if (response && response.pdfUrl) {
            this.openPdf(response.pdfUrl);
          }
        },
        error => {
          this.errorMessages.push('Erro ao dar upload do ficheiro.');
        }
      );
    } else {
      this.errorMessages.push('Ficheiro não é um pdf.');
    }
  }
  getPdfs() {
    this.profileService.getPdfs().subscribe(
      pdfs => {
        this.pdfList = pdfs;
      },
      error => {
        console.error('Error getting PDFs:', error);
        // Handle error appropriately (e.g., show error message)
      }
    );
  }

  deletePdf(certificateId: number) {
    this.profileService.deletePdf(certificateId).subscribe(
      response => {
        console.log('PDF deleted successfully.');
        this.getPdfs(); // Refresh the PDF list after deletion
      },
      error => {
        this.errorMessages.push('Erro ao apagar o ficheiro.');
        // Handle error appropriately (e.g., show error message)
      }
    );
  }

  openPdf(pdfFilename: string): void {
    this.profileService.downloadPdf(pdfFilename).subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        window.open(url);

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      },
      error => {
        console.error('Error downloading PDF:', error);
      }
    );
  }

  getDescription() {
    const descriptionElement = document.getElementById('description');

    if (descriptionElement && this.userData && this.userData.description) {
      this.updateDescriptionForm.setValue({
        description: this.userData.description
      });
    }
  }

  updateDescription() {
    this.submittedDescription = true;
    this.errorMessages = [];
    /*this.responseText = '';*/

    if (this.updateDescriptionForm.valid) {

      const form = this.updateDescriptionForm.value;

      if (this.userData?.description != form.description) {

        var description = { description: form.description }

        this.profileService.updateDescription(description).subscribe({
          next: (response: any) => {
            this.reloadTableData();
            //this.responseText = response.value.message;
            this.submittedDescription = false;
            console.log("Alterado");
          },
          error: (error) => {
            console.log(error.error);
            if (error.error.errors) {
              this.errorMessages = error.error.errors;
            } else {
              this.errorMessages.push(error.error);
            }
          }
        })
      }
      else {
        console.log("Antes: " + this.errorMessages.length);
        this.errorMessages.push("A nova descrição é igual à anterior.");
        console.log("Depois: " + this.errorMessages.length);
      }
    }
  }

  addSpeciality() {
    this.submittedAdd = true;
    this.errorMessages = [];
    /*this.responseText = '';*/

    if (this.addSpecialityForm.valid) {

      const form = this.addSpecialityForm.value;

      var specialtyform = {
        serviceId: null,
        specialtyId: form.selectSpeciality,
        specialty: null,
        pricePerHour: form.price,
        online: (form.online === "S") ? true : false,
        presential: (form.presencial === "S") ? true : false,
        home: (form.domicilio === "S") ? true : false,
      }

      this.profileService.addSpecialty(specialtyform).subscribe({
        next: (response: any) => {
          this.reloadTableData();
          /*this.responseText = response.value.message;*/
          this.submittedAdd = false;
          this.addSpecialityForm.reset();
          this.closePopup();
        },
        error: (error) => {
          console.log(error.error);
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        }
      })
    }
  }

  editSpeciality() {
    this.submittedEdit = true;
    this.errorMessages = [];
    /*this.responseText = '';*/

    if (this.editSpecialityForm.valid) {

      const form = this.editSpecialityForm.value;

      if (this.selectEditService) {
        var specialtyform = {
          serviceId: this.selectEditService.serviceId,
          specialtyId: this.selectEditService.specialtyId,
          specialty: this.selectEditService.specialty,
          pricePerHour: form.price,
          online: (form.online === "S") ? true : false,
          presential: (form.presencial === "S") ? true : false,
          home: (form.domicilio === "S") ? true : false,
        }

        this.profileService.updateSpecialty(specialtyform).subscribe({
          next: (response: any) => {
            this.reloadTableData();
            /*this.responseText = response.value.message;*/
            this.submittedEdit = false;
            this.editSpecialityForm.reset();
            this.closePopup();
          },
          error: (error) => {
            console.log(error.error);
            if (error.error.errors) {
              this.errorMessages = error.error.errors;
            } else {
              this.errorMessages.push(error.error);
            }
          }
        })
      }
    }
  }

  deleteSpeciality(specialtyId: number | null) {
    if (specialtyId != null) {
      this.profileService.deleteSpecialty(specialtyId).subscribe({
        next: () => {
          this.reloadTableData();
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

  showSpecialtyEdit(service: Service) {

    this.selectEditService = service;

    this.openPopup('edit');

    this.setEditFormFields();
  }

  setEditFormFields() {

    const nome = document.getElementById('speciality-name');

    if (nome && this.selectEditService) {
      nome.textContent = this.selectEditService.specialty;
    }

    if (this.selectEditService) {
      this.editSpecialityForm.setValue({
        price: this.selectEditService?.pricePerHour,
        presencial: (this.selectEditService?.presential == true) ? "S" : "N",
        online: (this.selectEditService?.online == true) ? "S" : "N",
        domicilio: (this.selectEditService?.home == true) ? "S" : "N"
      });
    }
  }

  changeSpecialtyReview(value: string) {

    const selectedValue = parseInt(value);

    if (!isNaN(selectedValue)) {
      if (selectedValue == 0) {
        this.selectedSpecialtyReview = 0;

      }
      else {
        var reviews = this.filterReviews(this.selectedSpecialtyReview);

        if (Array.isArray(reviews)) {
          if (reviews.length > 0) {

          }
          else {

          }
        }
      }
    } else {

    }
    //document.getElementById('personlist').value = Person_ID;
  }

  filterReviews(serviceId: number) {
    this.profileService.filterReviewsByService(21).subscribe({
      next: (reviews: Review[]) => {
        /*this.responseText = response.value.message;*/
        console.log(reviews);
        return reviews;
      },
      error: (error) => {
        console.log(error.error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
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

  private getAverage(reviews: Review[]) {

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
