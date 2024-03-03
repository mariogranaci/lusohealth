import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { Service } from '../../shared/models/profile/service';
import { Professional } from '../../shared/models/profile/professional';
import { Specialty } from '../../shared/models/profile/specialty';
import { Review } from '../../shared/models/profile/review';
import { Certificate } from '../../shared/models/profile/certificate';
import { AuthenticationService } from '../../authentication/authentication.service';
import { ProfileService } from '../profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../shared/models/authentication/user';

@Component({
  selector: 'app-public-profile-professional',
  templateUrl: './public-profile-professional.component.html',
  styleUrl: './public-profile-professional.component.css'
})

export class PublicProfileProfessionalComponent implements OnInit {
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
  public reviews: Review[] = [];
  public averageStars = 0;
  pdfList: Certificate[] = [];
  public isPatient = false;
  public professionalId: string | undefined;

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private activateRoute: ActivatedRoute) {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (!user) {
          this.router.navigateByUrl('/');
        }
        else {
          const decodedToken = this.profileService.getDecodedToken();

          if (decodedToken) {
            if (decodedToken.role === "Patient") {
              this.isPatient = true;
            }
          }
        }
      }
    });
  }
  ngOnInit(): void {
    this.activateRoute.queryParamMap.subscribe({
      next: (params: any) => {
        const id = params.get('id');

        if (id) {
          this.professionalId = id;

          this.initializeForm();
          this.getProfessionalInfo(id).then(() => {
            this.setUserFields();
            this.changeSpecialtyReview("0");
            this.getSpecialties();
            this.getPdfs();
          });

        }
        else {
          this.router.navigateByUrl('/error');
        }
      }
    });
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  getProfessionalInfo(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.profileService.getProfessionalInfoById(id).pipe(takeUntil(this.unsubscribe$)).subscribe(
        (userData: Professional) => {
          this.userData = userData;
          console.log(userData);
          resolve();
        },
        error => {
          reject(error);
        }
      );
    });
  }

  getSpecialties() {
    this.profileService.getServices().pipe(takeUntil(this.unsubscribe$)).subscribe(
      (specialties: Specialty[]) => {
        this.specialties = specialties;
      },
      error => {
      }
    );
  }

  setUserFields() {
    const nomeElement = document.getElementById('nome');
    const emailElement = document.getElementById('email');

    if (nomeElement && emailElement && this.userData && this.userData.professionalInfo) {
      const { firstName, lastName, email, picture } = this.userData.professionalInfo;

      if (firstName && lastName) {
        nomeElement.textContent = firstName + ' ' + lastName;
      }

      if (email) {
        emailElement.textContent = email;
      }

      if (picture) {
        this.profileImagePath = picture;
      }
    }
  }

  appointmentTypesToString(service: Service): string {
    const types: string[] = [];

    if (service.presential) {
      types.push("Presencial");
    }
    if (service.online) {
      types.push("Online");
    }
    if (service.home) {
      types.push("Domicílio");
    }

    if (types.length == 0)
      return "Nenhum";

    return types.join(", ");
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

  showCheckAnimation() {
    const checkmark = document.querySelector('.container-animation');

    if (checkmark instanceof HTMLElement) {
      checkmark.style.display = 'flex';
    }
  }

  hideCheckAnimation() {

    const checkmark = document.querySelector('.container-animation');

    if (checkmark instanceof HTMLElement) {
      checkmark.style.display = 'none';
    }

    const check = document.getElementById('check');

    if (check) {
      check.click();
    }

  }

  errorHideCheckAnimation() {
    const checkmark = document.querySelector('.container-animation');

    if (checkmark instanceof HTMLElement) {
      checkmark.style.display = 'none';
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
          /*this.responseText = response.value.message;*/
          this.submittedAdd = false;
          this.addSpecialityForm.reset();
          this.closePopup();
        },
        error: (error) => {
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
            /*this.responseText = response.value.message;*/
            this.submittedEdit = false;
            this.editSpecialityForm.reset();
            this.closePopup();
          },
          error: (error) => {
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

  selectReviewEventReceiver(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const value = target.value;

      this.changeSpecialtyReview(value);
    }
  }

  changeSpecialtyReview(value: string) {

    const selectedValue = parseInt(value);

    if (!isNaN(selectedValue)) {

      this.selectedSpecialtyReview = selectedValue;

      this.filterReviews(this.selectedSpecialtyReview);

      /*const reviewSelect = document.getElementById('select-review') as HTMLSelectElement | null;

      if (reviewSelect) {
        reviewSelect.value = String(this.selectedSpecialtyReview);
      }*/

    } else {
      this.errorMessages.push("Erro ao carregar reviews.");
    }
  }

  filterReviews(serviceId: number) {

    if (this.professionalId) {
      this.profileService.filterReviewsByServiceById(serviceId, this.professionalId).subscribe({
        next: (reviews: Review[]) => {
          this.reviews = reviews;
          this.getAverageStars();
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
    else {
      this.errorMessages.push("Erro ao carregar reviews.");
    }
  }

  private getAverageStars() {
    var sum = 0;
    for (let i = 0; i < this.reviews.length; i++) {
      sum += this.reviews[i].stars;
    }
    this.averageStars = sum / this.reviews.length;
  }


  addReview() {

    var newReview = {
      idService: 1,
      stars: 4,
      description: "Este gajo é o maior.",
    }
    console.log(newReview);
    this.profileService.addReview(newReview).subscribe({
      next: (response: any) => {
        /*this.responseText = response.value.message;*/
        console.log(newReview);
      },
      error: (error) => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    })
  }



  /* ------------------------  Popups  -------------------------*/




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
}
