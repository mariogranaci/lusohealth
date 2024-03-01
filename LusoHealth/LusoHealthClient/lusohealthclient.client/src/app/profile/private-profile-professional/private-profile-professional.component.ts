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
  public reviews: Review[] = [];
  public averageStars = 0;

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private router: Router) {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        console.log(user);
        if (!user) {
          this.router.navigateByUrl('/');
        }
        else {
          const decodedToken = this.profileService.getDecodedToken();

          if (decodedToken) {
            if (decodedToken.role !== "Professional") {
              this.router.navigateByUrl('/');
            }
          }
        }
      }
    });
  }
  ngOnInit(): void {
    this.initializeForm();
    this.getProfessionalInfo().then(() => {
      this.setUserFields();
      this.getDescription();
      this.changeSpecialtyReview("0");
    });
    this.getSpecialties();

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
          this.userData = userData;
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

    this.showCheckAnimation();

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
            const check = document.getElementById('check');

            if (check) {
              check.click();
            }

            setTimeout(() => {
              this.hideCheckAnimation();
            }, 1800);

          },
          error: (error) => {
            if (error.error.errors) {
              this.errorMessages = error.error.errors;
              this.errorHideCheckAnimation();
            } else {
              this.errorMessages.push(error.error);
              this.errorHideCheckAnimation();
            }
          }
        })
      }
      else {
        this.errorHideCheckAnimation();
        this.errorMessages.push("A nova descrição é igual à anterior.");
      }
    }
    else {
      this.errorHideCheckAnimation();
    }
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
          this.reloadTableData();
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
            this.reloadTableData();
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

  deleteSpeciality(specialtyId: number | null) {
    if (specialtyId != null) {
      this.profileService.deleteSpecialty(specialtyId).subscribe({
        next: () => {
          this.reloadTableData();
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
    this.profileService.filterReviewsByService(serviceId).subscribe({
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

  private getAverageStars()
  {
    var sum = 0;
    for (let i = 0; i < this.reviews.length; i++)
    {
      sum += this.reviews[i].stars;
    }
    this.averageStars = sum / this.reviews.length;
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
