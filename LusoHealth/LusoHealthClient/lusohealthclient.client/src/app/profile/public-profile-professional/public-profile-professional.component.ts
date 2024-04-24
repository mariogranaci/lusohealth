import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  private unsubscribe$ = new Subject<void>();
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
  radioStar1 = false;
  radioStar2 = false;
  radioStar3 = false;
  radioStar4 = false;
  radioStar5 = false;

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

  /**
 * Atualiza as variáveis de controle das estrelas de classificação com base no valor recebido.
 * @param value O valor da classificação (de 1 a 5).
 */
  checkInput(value: number): void {


    switch (value) {
      case 1:
        this.radioStar1 = true;
        this.radioStar2 = false;
        this.radioStar3 = false;
        this.radioStar4 = false;
        this.radioStar5 = false;
        break;
      case 2:
        this.radioStar1 = true;
        this.radioStar2 = true;
        this.radioStar3 = false;
        this.radioStar4 = false;
        this.radioStar5 = false;
        break;
      case 3:
        this.radioStar1 = true;
        this.radioStar2 = true;
        this.radioStar3 = true;
        this.radioStar4 = false;
        this.radioStar5 = false;
        break;
      case 4:
        this.radioStar1 = true;
        this.radioStar2 = true;
        this.radioStar3 = true;
        this.radioStar4 = true;
        this.radioStar5 = false;
        break;
      case 5:
        this.radioStar1 = true;
        this.radioStar2 = true;
        this.radioStar3 = true;
        this.radioStar4 = true;
        this.radioStar5 = true;
        break;
    }
  }

  /**
 * Inicializa os formulários da aplicação.
 */
  initializeForm() {

    this.addSpecialityForm = this.formBuilder.group({
      selectSpeciality: ['Selecione uma especialidade', [Validators.required]],
      rating: ['', [Validators.required]],
      description: ['', [Validators.maxLength(200)]]
    });

    this.editSpecialityForm = this.formBuilder.group({
      price: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      presencial: ['', [Validators.required]],
      online: ['', [Validators.required]],
      domicilio: ['', [Validators.required]]
    });

    this.updateDescriptionForm = this.formBuilder.group({
      description: ['', [Validators.maxLength(200)]],
    });
  }

  /**
 * Obtém informações do profissional com base no ID fornecido.
 * @param id O ID do profissional.
 * @returns Uma promessa que será resolvida quando as informações do profissional forem obtidas.
 */
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

  /*getSpecialties() {

    if (this.professionalId) {
      this.profileService.getServicesByProfessionalId(this.professionalId).pipe(takeUntil(this.unsubscribe$)).subscribe(
        (specialties: Specialty[]) => {
          console.log(specialties);
          this.specialties = specialties;
        },
        error => {
          console.log(error);
          this.errorMessages.push('Erro ao carregar os serviços.');
        }
      );
    }
  }*/

  /**
 * Preenche os campos do utilizador com as informações do profissional.
 */
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

  /**
 * Converte os tipos de consulta de um serviço em uma string formatada.
 * @param service O serviço.
 * @returns Uma string contendo os tipos de consulta formatados.
 */
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

  /**
 * Manipula o evento de seleção de arquivo.
 * @param event O evento de seleção de arquivo.
 */
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

  /**
 * Obtém os arquivos PDF relacionados ao profissional.
 */
  getPdfs() {
    if (this.professionalId)
    this.profileService.getPdfsById(this.professionalId).subscribe(
      pdfs => {
        this.pdfList = pdfs;
      },
      error => {
        console.error('Error getting PDFs:', error);
        // Handle error appropriately (e.g., show error message)
      }
    );
  }

  /**
 * Exclui um arquivo PDF pelo ID do certificado.
 * @param certificateId O ID do certificado.
 */
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

  /**
 * Abre um arquivo PDF para visualização no navegador.
 * @param pdfFilename O nome do arquivo PDF.
 */
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

  /**
 * Exibe a animação de marcação de verificação.
 */
  showCheckAnimation() {
    const checkmark = document.querySelector('.container-animation');

    if (checkmark instanceof HTMLElement) {
      checkmark.style.display = 'flex';
    }
  }

 /**
 * Oculta a animação de marcação de verificação.
 */
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

  /**
 * Oculta a animação de marcação de verificação em caso de erro.
 */
  errorHideCheckAnimation() {
    const checkmark = document.querySelector('.container-animation');

    if (checkmark instanceof HTMLElement) {
      checkmark.style.display = 'none';
    }
  }

  /**
 * Adiciona uma especialidade ao perfil do profissional.
 */
  addSpeciality() {
    this.submittedAdd = true;
    this.errorMessages = [];
    /*this.responseText = '';*/

    if (this.addSpecialityForm.valid) {

      const form = this.addSpecialityForm.value;

      //generate the code fo get the serviceId of the the service from userData.services that has the same specialtyId as form.selectSpeciality
      var serviceId: number | null = null;
      if (this.userData && this.userData.services) {
        this.userData.services.forEach((service) => {
          if (service.specialtyId == form.selectSpeciality) {
            serviceId = service.serviceId;
          }
        });
      }

      if (serviceId) {
        var newReview = {
          idService: serviceId,
          idSpecialty: form.selectSpeciality,
          stars: form.rating,
          description: form.description,
        }
        console.log(newReview);
        this.profileService.addReview(newReview).subscribe({
          next: (response: any) => {
            /*this.responseText = response.value.message;*/
            console.log(newReview);
            this.submittedAdd = false;
            if (this.professionalId)
              this.getProfessionalInfo(this.professionalId);

            this.changeSpecialtyReview(this.selectedSpecialtyReview.toString());
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
      else {
        this.errorMessages.push("Algo correu mal!");
      }
    }
  }

  /**
 * Edita uma especialidade do perfil do profissional.
 */
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

  /**
 * Exibe a edição de uma especialidade.
 * @param service A especialidade a ser editada.
 */
  showSpecialtyEdit(service: Service) {

    this.selectEditService = service;

    this.openPopup('edit');

    this.setEditFormFields();
  }

 /**
 * Define os campos do formulário de edição com os valores da especialidade selecionada.
 */
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




  /*--------------------------------------------------------------------------------*/



  /*-------------------------------------- Reviews ---------------------------------*/




  /**
 * Recebe o evento de seleção de revisão.
 * @param event O evento de seleção.
 */
  selectReviewEventReceiver(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const value = target.value;

      this.changeSpecialtyReview(value);
    }
  }

  /**
 * Altera a revisão da especialidade selecionada.
 * @param value O valor da especialidade selecionada.
 */
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

  /**
 * Filtra as revisões pela especialidade.
 * @param serviceId O ID da especialidade.
 */
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

  /**
 * Calcula a média das estrelas das revisões.
 */
  private getAverageStars() {
    var sum = 0;
    for (let i = 0; i < this.reviews.length; i++) {
      sum += this.reviews[i].stars;
    }
    this.averageStars = sum / this.reviews.length;
  }

  /* ------------------------  Popups  -------------------------*/


  /**
 * Abre um popup específico.
 * @param opcao A opção do popup a ser aberto.
 */
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

 /**
 * Fecha o popup atualmente aberto.
 */
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

 /**
 * Impede a propagação do evento.
 * @param event O evento a ser interrompido.
 */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
