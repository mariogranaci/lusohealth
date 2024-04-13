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

import { Marker } from '@googlemaps/adv-markers-utils';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment.development';
import { Location } from '../../shared/models/profile/location';

declare let google: any;

@Component({
  selector: 'app-private-profile-professional',
  templateUrl: './private-profile-professional.component.html',
  styleUrl: './private-profile-professional.component.css'
})
export class PrivateProfileProfessionalComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  addSpecialityForm: FormGroup = new FormGroup({});
  editSpecialityForm: FormGroup = new FormGroup({});
  updateDescriptionForm: FormGroup = new FormGroup({});
  addressForm: FormGroup = new FormGroup({});
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

  zoom = 20;
  center: google.maps.LatLngLiteral = { lat: 38.736946, lng: -9.142685 };
  map: google.maps.Map | undefined;
  marker: Marker | undefined;
  position: google.maps.LatLng | undefined;
  isInPortugal = false;
  hasStreetNumber = false;
  address: string | undefined;

  constructor(private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private router: Router) {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
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
    const loader = new Loader({
      apiKey: environment.googleMapsApiKey,
      version: "weekly",
      libraries: [
        "places",
        "geocoding"
      ]
    });
    this.initializeForm();
    this.getProfessionalInfo().then(() => {
      this.setUserFields();
      this.getDescription();
      this.changeSpecialtyReview("0");
      loader.load().then(async () => {
        this.initMap();
        this.initAutocomplete();
      });
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

  /**
   * Inicializa os formulários de adição e edição de especialidades, descrição e endereço.
   */
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

    this.addressForm = this.formBuilder.group({
      address: ['', [Validators.required, Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  /**
   * Obtém as informações do profissional.
   */
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

  /**
   * Obtém as especialidades disponíveis.
   */
  getSpecialties() {
    this.profileService.getServices().pipe(takeUntil(this.unsubscribe$)).subscribe(
      (specialties: Specialty[]) => {
        this.specialties = specialties;
      },
      error => {
      }
    );
  }

  /**
   * Define os campos do utilizador.
   */
  setUserFields() {

    const nomeElement = document.getElementById('nome');
    const apelidoElement = document.getElementById('apelido');
    const emailElement = document.getElementById('email');
    const telemovelElement = document.getElementById('telemovel');
    const nifElement = document.getElementById('nif');
    const genderElement = document.getElementById('gender');

    const enderecoElement = document.getElementById('endereco');

    console.log(this.userData);

    if (nomeElement && apelidoElement && emailElement && telemovelElement && nifElement && genderElement && this.userData && enderecoElement) {
      nomeElement.textContent = this.userData.professionalInfo.firstName;
      apelidoElement.textContent = this.userData.professionalInfo.lastName;
      emailElement.textContent = this.userData.professionalInfo.email;
      telemovelElement.textContent = this.userData.professionalInfo.telemovel;
      nifElement.textContent = this.userData.professionalInfo.nif;
      genderElement.textContent = (this.userData.professionalInfo.genero === "M") ? "Masculino" : "Feminino";
      enderecoElement.textContent = this.userData.address;

      if (this.userData.professionalInfo.picture) {
        this.profileImagePath = this.userData.professionalInfo.picture;
      }
    }
  }

  /**
 * Manipula o evento de seleção de arquivo.
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
  * Obtém a lista de PDFs.
  */
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

  /**
   * Exclui um PDF com o ID fornecido.
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
  * Abre o PDF especificado.
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
   * Obtém a descrição do utilizador.
   */
  getDescription() {
    const descriptionElement = document.getElementById('description');

    if (descriptionElement && this.userData && this.userData.description) {
      this.updateDescriptionForm.setValue({
        description: this.userData.description
      });
    }
  }

  /**
 * Atualiza a descrição do profissional.
 */
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

 /**
 * Exibe a animação de verificação.
 */
  showCheckAnimation() {
    const checkmark = document.querySelector('.container-animation');

    if (checkmark instanceof HTMLElement) {
      checkmark.style.display = 'flex';
    }
  }

 /**
 * Oculta a animação de verificação.
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
 * Oculta a animação de verificação em caso de erro.
 */
  errorHideCheckAnimation() {
    const checkmark = document.querySelector('.container-animation');

    if (checkmark instanceof HTMLElement) {
      checkmark.style.display = 'none';
    }
  }

 /**
 * Adiciona uma especialidade ao profissional.
 */
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

 /**
 * Edita uma especialidade do profissional.
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

  /**
 * Apaga uma especialidade do profissional.
 * @param specialtyId O ID da especialidade a ser apagada.
 */
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

  /**
 * Exibe a interface de edição de especialidade.
 * @param service O serviço a ser editado.
 */
  showSpecialtyEdit(service: Service) {

    this.selectEditService = service;

    this.openPopup('edit');

    this.setEditFormFields();
  }

  /**
 * Define os campos do formulário de edição de especialidade com os valores existentes.
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

  /**
 * Manipula o evento de seleção de revisão.
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
 * Altera a especialidade de revisão selecionada.
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
 * Filtra as revisões pela especialidade selecionada.
 * @param serviceId O ID da especialidade.
 */
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

 /**
 * Calcula a média das estrelas nas revisões.
 */
  private getAverageStars()
  {
    var sum = 0;
    for (let i = 0; i < this.reviews.length; i++)
    {
      sum += this.reviews[i].stars;
    }
    this.averageStars = sum / this.reviews.length;
  }

 /**
 * Abre o popup com a opção especificada.
 * @param opcao A opção a ser exibida no popup.
 */
  openPopup(opcao: string) {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-speciality-container');
    const edit = document.getElementById('edit-speciality-container');
    const editAddress = document.getElementById('edit-address-container');

    if (edit) {
      edit.style.display = "none";
    }
    if (add) {
      add.style.display = "none";
    }
    if (editAddress) {
      editAddress.style.display = "none";
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
      else if (opcao == "address") {
        if (editAddress) {
          editAddress.style.display = "block";
        }
      }
    }
  }

 /**
 * Fecha o popup.
 */
  closePopup() {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-speciality-container');
    const edit = document.getElementById('edit-speciality-container');
    const address = document.getElementById('edit-address-container');

    if (overlay) {
      overlay.style.display = 'none';
      if (edit) {
        edit.style.display = "none";
      }
      if (add) {
        add.style.display = "none";
      }
      if (address) {
        address.style.display = "none";
      }
    }
  }

 /**
 * Impede a propagação do evento.
 * @param event O evento a ser manipulado.
 */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

 /**
 * Inicializa o mapa do Google Maps.
 */
  async initMap() {
    await google.maps.importLibrary('marker');
    await this.userData;

    const domElement = document.querySelector('#map');
    // create the map
    this.map = new google.maps.Map(domElement, {
      center:  { lat: 38.7074, lng: -9.1368 },
      zoom: this.zoom,
      mapId: 'luso-health'
    });

    if (this.userData && this.userData.location) {
      this.marker = this.createMarker(this.userData);
      const [lat, lng] = this.userData.location.replace(/,/g, '.').split(';').map(coord => parseFloat(coord));
      const position = new google.maps.LatLng(lat, lng);
      this.position = position;
      console.log(position);
      this.map?.setCenter(position);
    }
  }

  /**
 * Inicializa o autocompletar do Google Places para o campo de endereço.
 */
  private initAutocomplete(): void {
    const input = document.getElementById('address-input') as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'PT' },
      types: ['geocode'], // Use 'geocode' para endereços apenas, sem estabelecimentos comerciais.
      fields: ['formatted_address', 'address_components', 'geometry'] // Lista de campos que você quer que sejam retornados.
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      this.hasStreetNumber = place.address_components.some((component: { types: string | string[]; }) =>
        component.types.includes('street_number')
      );
      console.log('hasStreetNumber', this.hasStreetNumber);

      if (!place.geometry) {
        return;
      }
      if (this.map) {
        if (place.geometry.viewport) {
          this.map.fitBounds(place.geometry.viewport);
          this.map.setZoom(this.zoom);
        } else {
          this.map.setCenter(place.geometry.location);
          this.map.setZoom(this.zoom);
        }
        if (this.hasStreetNumber) {
            this.position = place.geometry.location;
            this.address = place.formatted_address;
          if (this.marker) {
            this.marker.position = place.geometry.location;
          } else {
            this.marker = new Marker({
              position: this.position,
              map: this.map,
              title: 'marker',
            });
          }
        }
      }
    });
  }


  /**
   * Submete o endereço atualizado.
   */
  submitAddress() {
    this.errorMessages = [];

    if (!this.hasStreetNumber) {
      this.errorMessages.push('Por favor, inclua o número da porta no endereço.');
      this.hasStreetNumber = false;
      return;
    }
    
    if (this.position && this.address) {
      let location = this.position.lat() + ';' + this.position.lng();
      console.log('location', location);
      location = location.replace(/\./g, ',');
      console.log('location replace', location);
      const model = {
        location: location,
        address: this.address,
      } as Location;

      this.profileService.updateAddress(model).subscribe({
        next: (response: any) => {
          const morada = document.getElementById('endereco');
          if (morada && this.address) {
            morada.textContent = this.address;
          }
          this.closePopup();
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

  /**
 * Cria um marcador no mapa com base na localização do profissional.
 * @param professional O profissional.
 * @returns O marcador criado.
 */
  createMarker(professional: Professional): Marker {
    if (!professional.location) {
      throw new Error('Localização do profissional não disponível.');
    }
    const [lat, lng] = professional.location.replace(/,/g, '.').split(';').map(coord => parseFloat(coord));
    const position = new google.maps.LatLng(lat, lng);

    const marker = new Marker({
      position,
      map: this.map,
      title: 'marker',
    });

    return marker;
  }
}
