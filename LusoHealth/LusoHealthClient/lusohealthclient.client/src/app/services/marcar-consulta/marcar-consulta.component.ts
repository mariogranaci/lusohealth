import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../authentication/authentication.service';
import { User } from '../../shared/models/authentication/user';
import { Subject, take, takeUntil } from 'rxjs';
import { ServicesService } from '../services.service';
import { MakeAppointment } from '../../shared/models/servic/makeAppointment';
import { Appointment } from '../../shared/models/servic/appointment';
import { AvailableSlot } from '../../shared/models/servic/availableSlot';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Marker } from '@googlemaps/adv-markers-utils';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment.development';
import { Location } from '../../shared/models/profile/location';
import { ProfileService } from '../../profile/profile.service';

declare var google: any;

@Component({
  selector: 'app-marcar-consulta',
  templateUrl: './marcar-consulta.component.html',
  styleUrl: './marcar-consulta.component.css'
})
export class MarcarConsultaComponent {
  checked = false;
  serviceId: string = "";
  serviceInfo: MakeAppointment | null = null;
  private unsubscribe$ = new Subject<void>();
  categoria: string = "";
  especialidade: string = "";
  errorMessages: string[] = [];
  availableSlots: AvailableSlot[] = [];
  displayedAvailabity: boolean = false;
  selectedDate: Date = new Date();
  selectedOption: string = "";
  slots: any[] = [];

  addressForm: FormGroup = new FormGroup({});
  zoom = 20;
  center: google.maps.LatLngLiteral = { lat: 38.736946, lng: -9.142685 };
  map: google.maps.Map | undefined;
  marker: Marker | undefined;
  position: google.maps.LatLng | undefined;
  isInPortugal = false;
  hasStreetNumber = false;
  address: string | undefined;
  slot: AvailableSlot | undefined;
  suggestedAppointment: AvailableSlot | undefined;
  suggestionPrice: number = 0;
  isSuggestionLoaded: boolean = false;

  phrases: string[] = [
    "A sugestão de consulta é dada com base na disponibilidade do profissional, de forma a garantir uma melhor alocação das vagas.",
    "Para procurar por um Tipo de Consulta específico, aceda à opção 'Tipo de Consulta' e selecione o tipo pretendido, seja Online, Presencial ou Domicílio.",
    "Se pretender escolher a data da consulta, clique na opção 'Quero marcar para outra data', e será fornecido um calendário, onde após selecionada a data, serão apresentadas as disponibilidades para a mesma.",
    "Para aceder ao perfil do profissional, clique no seu nome ou na sua imagem de perfil."
  ];
  currentPhraseIndex: number = 0;
  currentPhrase: string = this.phrases[0];

  constructor(private authenticationService: AuthenticationService,
    private profileService: ProfileService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private service: ServicesService,
    private formBuilder: FormBuilder) {

  }

  /**
  * Método executado quando o componente é destruído.
  */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  /**
   * Método executado quando o componente é inicializado.
   */
  ngOnInit(): void {
    this.initializeForm();
    const loader = new Loader({
      apiKey: environment.googleMapsApiKey,
      version: "weekly",
      libraries: [
        "places",
        "geocoding"
      ]
    });
    loader.load().then(async () => {
      this.initMap();
      this.initAutocomplete();
    });
    this.getServiceId().then(() => {
      this.getServiceInfo();
      this.getAppointmentSugestion();
    });
  }

  initializeForm() {
    this.addressForm = this.formBuilder.group({
      address: ['', [Validators.required, Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  /**
   * Obtém o identificador do serviço.
   */
  getServiceId(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.authenticationService.user$.pipe(take(1)).subscribe({
        next: (user: User | null) => {
          if (!user) {
            this.router.navigateByUrl('/');
          } else {
            this.activateRoute.queryParamMap.subscribe({
              next: (params: any) => {
                this.serviceId = params.get('serviceId')
                resolve();
              }
            });
          }
        }
      });
    });
  }

  /**
   * Obtém as informações do serviço.
   */
  getServiceInfo() {
    const name = document.getElementById('name-title');
    this.service.getServiceInfo(parseInt(this.serviceId)).pipe(takeUntil(this.unsubscribe$)).subscribe(
      (serviceInfo: MakeAppointment) => {
        this.serviceInfo = serviceInfo;
        if (name) {
          name.innerText = this.serviceInfo.professionalName;
          this.categoria = this.serviceInfo.category;
          this.especialidade = this.serviceInfo.specialty;
        }

      },
      error => {
        console.error(error);
        this.errorMessages.push("Error ao carregar informação do serviço.");
      }
    );
  }

  /**
   * Manipula o clique no botão de marcar consulta.
   */
  marcarClick(slot: AvailableSlot | undefined, location: string | null, address: string | null) {
    if (this.serviceInfo) {
      if (!slot || slot.start === undefined || slot.appointmentType === undefined || slot.slotDuration === undefined) {
        // Handle the case where the slot is not found or start is undefined
        this.errorMessages.push("Algo correu mal.");
        return;
      }

      const startDate = new Date(slot.start);


      const newAppointment = new Appointment(
        startDate,               // Date | null for timestamp
        location,                 // string | null for location
        address,                  // string | null for address
        slot.appointmentType,     // string | null for type
        null,                     // string | null for description
        null,                     // string | null for state
        slot.slotDuration,        // number | null for duration
        null,                     // string | null for idPatient
        null,                     // number | null for id
        null,                     // string | null for idProfessional
        parseInt(this.serviceId), // number | null for idService
        null,                     // Professional | null for Professional
        null,                     // Patiente | null for Patiente
        null,                     // Specialty | null for Service
      );

      this.service.addAppointment(newAppointment).subscribe({
        next: (response) => {
          console.log('Consulta marcada com sucesso:', response.appointmentId);

          if (!newAppointment.duration) {
            this.errorMessages.push("Algo correu mal.");
            return;
          }

          this.payment(response.appointmentId, newAppointment.duration);
        },
        error: (error) => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
          console.error(error);
        }
      });

    }
    else {
      this.errorMessages.push("Algo correu mal.");
    }
  }

  /**
   * Realiza o pagamento.
   */
  private payment(appointmentId: number, slotDuration: number) {
    if (this.serviceInfo) {
      this.service.requestStripeSession((this.serviceInfo.pricePerHour * slotDuration) / 60, appointmentId, this.serviceInfo.specialty);
    }
    else {
      this.errorMessages.push("Algo correu mal.");
    }
  }

  /**
  * Manipula a mudança de data.
  */
  handleDateChange(selectedDate: Date): void {
    this.selectedDate = selectedDate;
    console.log('selectedDate calendar', selectedDate);

    this.getAvailability();
  }

  /**
   * Manipula a mudança de seleção de opção.
   */
  onOptionSelectionChange(selectedOption: any) {
    if (selectedOption !== null && selectedOption !== undefined) {
      this.selectedOption = selectedOption.target.value;
    }

    this.getAvailability();
  }

  /**
   * Obtém a disponibilidade.
   */
  getAvailability() {
    this.service.getAvailableSlots(parseInt(this.serviceId)).subscribe(
      (response: AvailableSlot[]) => {
        this.slots = response.filter((s: any) => {
          const slotDate = new Date(s.start);

          if (s.appointmentType === this.selectedOption || !this.selectedOption) {
            console.log('selected option: ', this.selectedOption);
            if (slotDate.toDateString() === this.selectedDate.toDateString()) {
              const slotTime = slotDate.getTime();
              const selectedTime = this.selectedDate.getTime();
              return slotTime >= selectedTime;
            } else {
              return false;
            }
          } else {
            return false
          }
        }).map((s: any) => ({
          appointmentType: s.appointmentType,
          id: s.id,
          idService: s.idService,
          isAvailable: s.isAvailable,
          slotDuration: s.slotDuration,
          price: this.serviceInfo ? s.slotDuration * this.serviceInfo.pricePerHour / 60 : 0,
          start: s.start
        }));

        console.log("Slots: ", this.slots);

      },
      error => {
        console.error('Error: ', error);
      }
    );

  }

  /**
   * Obtém a sugestão de consulta.
   */
  getAppointmentSugestion() {
    this.service.getAppointmentSugestion(parseInt(this.serviceId)).subscribe(
      (response: AvailableSlot) => {

        this.suggestedAppointment = response;
        if (this.suggestedAppointment && this.suggestedAppointment.slotDuration && this.suggestedAppointment.start) {
          this.suggestionPrice = this.serviceInfo ? this.suggestedAppointment.slotDuration * this.serviceInfo.pricePerHour / 60 : 0;

          this.isSuggestionLoaded = true;

          this.selectedDate = new Date(this.suggestedAppointment.start);
        }

        console.log('selectedDate Sugestion', this.selectedDate);
        this.getAvailability();
      },
      error => {
        console.error('Erro: ', error);
      }

    );

  }


  /**
  * Converte uma data para uma string formatada.
  */
  convertToDate(dateTimeString: Date | undefined): string {
    if (!dateTimeString) {
      return "";
    }

    const monthsInPortuguese: string[] = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    let dateTime: Date = new Date(dateTimeString);

    let day: number = dateTime.getDate();
    let month: number = dateTime.getMonth();
    let year: number = dateTime.getFullYear();

    let formattedDate: string = `${day} ${monthsInPortuguese[month]} ${year}`;

    return formattedDate;
  }

  /**
   * Converte uma hora para uma string formatada.
   */
  convertToHours(dateTimeString: Date | undefined): string {
    if (!dateTimeString) {
      return "";
    }

    let dateTime: Date = new Date(dateTimeString);

    let hours: number = dateTime.getHours();
    let formattedHours: string = hours < 10 ? '0' + hours : hours.toString();

    let min: number = dateTime.getMinutes();
    let formattedMinutes: string = min < 10 ? '0' + min : min.toString();

    return formattedHours + ":" + formattedMinutes;
  }

  /**
   * Obtém o tipo de consulta através de uma String.
   */
  getAppointmentType(type: string | undefined): string {
    switch (type) {
      case "Presential":
        return 'Presencial';
      case "Online" :
        return 'Online';
      case "Home" :
        return 'Domiciliária';
      default:
        return '';
    }
  }

  /**
   * Obtém a disponibilidade através de um Number.
   */
  getAppointmentTypeByNumber(type: number | undefined): string {
    switch (type) {
      case 0:
        return 'Presencial';
      case 1:
        return 'Online';
      case 2:
        return 'Domiciliária';
      default:
        return '';
    }
  }


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

      console.log('appointmentId', this.slot);
      if (location && this.address && this.slot) {
        this.marcarClick(this.slot, location, this.address);
        this.closePopup();
      }
    }
  }

  async initMap() {
    await google.maps.importLibrary('marker');

    const domElement = document.querySelector('#map');
    // create the map
    this.map = new google.maps.Map(domElement, {
      center: { lat: 38.7074, lng: -9.1368 },
      zoom: this.zoom,
      mapId: 'luso-health-appointment'
    });
    this.getCurrentLocation();
  }

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

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          // Use 'currentPosition' para centralizar o mapa ou fazer o que precisar
          if (this.map) {
            this.map.setCenter(currentPosition);
            this.map.setZoom(this.zoom);

            // Crie um marcador avançado para a posição do usuário
            const currentPositionMarkerImage = document.createElement('img');
            currentPositionMarkerImage.style.width = '30px';
            currentPositionMarkerImage.src = 'https://assets-global.website-files.com/62c5e0898dea0b799c5f2210/62e8212acc540f291431bad2_location-icon.png';
            const userLocationMarker = new Marker({
              position: currentPosition,
              map: this.map,
              content: currentPositionMarkerImage,
              title: 'Sua Localização',
            });
            this.position = new google.maps.LatLng(currentPosition.lat, currentPosition.lng);
            // Adicionar o endereço ao input do endereço
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: currentPosition }, (results: { formatted_address: any; }[], status: string) => {
              if (status === 'OK' && results[0]) {
                this.address = results[0].formatted_address;
                this.hasStreetNumber = true;
                const input = document.getElementById('address-input') as HTMLInputElement;
                input.value = this.address ? this.address : '';
              } else {
                console.error('Geocoder failed due to: ' + status);
              }
            });
          }
        },
        (err) => {
          console.warn(`ERROR(${err.code}): ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert("Geolocalização não é suportada por este navegador.");
    }
  }


  openPopupAndDefineAppointmentId(opcao: string, slot: AvailableSlot | undefined) {
    this.slot = slot;
    this.openPopup(opcao);
  }

  openPopup(option: string) {
    const overlay = document.getElementById('overlay');
    const editAddress = document.getElementById('edit-address-container');
    const tool = document.getElementById('tooltips');

    if (editAddress) {
      editAddress.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (option == "address") {
        if (editAddress) {
          editAddress.style.display = "block";
        }
      }
      if (option == "tool") {
        if (tool) {
          tool.style.display = "block";
        }
      }
    }
  }

  closePopup() {
    const overlay = document.getElementById('overlay');
    const address = document.getElementById('edit-address-container');
    const tool = document.getElementById('tooltips');

    if (overlay) {
      overlay.style.display = 'none';
      if (address) {
        address.style.display = "none";
      }
      if (tool) {
        tool.style.display = "none";
      }
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  nextPhrase() {
    this.currentPhraseIndex++;
    if (this.currentPhraseIndex < this.phrases.length) {
      this.currentPhrase = this.phrases[this.currentPhraseIndex];
    } else {
      this.currentPhraseIndex = 0;
      this.currentPhrase = this.phrases[this.currentPhraseIndex];
      this.closePopup();
    }
  }

}
