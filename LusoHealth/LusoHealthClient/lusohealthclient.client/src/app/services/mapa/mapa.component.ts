import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { Specialty } from '../../shared/models/profile/specialty';
import { } from '@angular/google-maps';
import { ServicesService } from '../services.service';
import { Professional } from '../../shared/models/profile/professional';
import { Subject, takeUntil } from 'rxjs';

import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment.development';
import { Marker } from '@googlemaps/adv-markers-utils';
import { Bounds } from '../../shared/models/servic/bounds';

declare var google: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements OnInit {
  @ViewChild('searchBox', { static: false }) searchBox?: ElementRef;
  professionalTypes: ProfessionalType[] = [];
  specialties: Specialty[] = [];
  specialtiesFiltered: Specialty[] = [];
  professionals: Professional[] = [];
  filteredProfessionals: Professional[] = [];
  unsortedProfessionals: Professional[] = [];

  zoom = 14;
  center: google.maps.LatLngLiteral = { lat: 38.736946, lng: -9.142685 };
  map: google.maps.Map | undefined;
  mapMoved: boolean = false;
  markers: Marker[] = [];
  private unsubscribe$ = new Subject<void>();
  concelho: string | null = null;
  specialtyId: number = -1;
  professionalTypeId: number = -1;

  constructor(private servicesService: ServicesService) { }

  ngOnInit() {
    this.getProfessionalTypes();
    this.getSpecialties();
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
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

 /**
 * Inicializa o mapa e seus componentes.
 */
  async initMap(){
    await google.maps.importLibrary('marker');

    const domElement = document.querySelector('#map');
    // create the map
    this.map = new google.maps.Map(domElement, {
      center: { lat: 38.7074, lng: -9.1368 },
      zoom: this.zoom,
      mapId: 'lusohealth'
    });
    if (this.map) {
      this.map.addListener('dragend', () => {
        this.mapMoved = true;
      });
      this.map.addListener('zoom_changed', () => {
        this.mapMoved = true;
      });
      this.getCurrentLocation();
    }
  }

 /**
 * Inicializa a funcionalidade de autocompletar no campo de busca.
 */
  initAutocomplete(): void {
    if (this.searchBox) {
      const autocomplete = new google.maps.places.Autocomplete(this.searchBox.nativeElement);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          window.alert("No details available for input: '" + place.name + "'");
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
        }
      });
    }
  }

 /**
 * Obtém a localização atual do utilizador.
 */
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
            this.getProfessionalsOnBounds();
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

 /**
 * Obtém os profissionais dentro dos limites do mapa.
 */
  getProfessionalsOnBounds(): void {
    this.clearMarkers();
    if (this.map) {
      const bounds = this.map.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        this.mapMoved = false;

        const boundsMap: Bounds = {
          latitudeNorthEast: ne.lat(),
          longitudeNorthEast: ne.lng(),
          latitudeSouthWest: sw.lat(),
          longitudeSouthWest: sw.lng()
        };


        this.servicesService.getProfessionalsOnLocation(boundsMap).pipe(takeUntil(this.unsubscribe$)).subscribe(
          (professionals: Professional[]) => {


            this.updateProfessionalsWithConcelho(professionals).then(() => {
              this.professionals = professionals;
              this.calculateStarsForProfessionals();
              this.filterProfessionals();
            });
          }, (error) => {
            console.error(error);
          }
        );
      }
    }
  }

 /**
 * Obtém os limites do mapa.
 * @returns Um objeto contendo os limites do mapa.
 */
  getBoundsMap(): any {
    if (this.map) {
      const bounds = this.map.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        return {
          latitudeNorthEast: ne.lat(),
          longitudeNorthEast: ne.lng(),
          latitudeSouthWest: sw.lat(),
          longitudeSouthWest: sw.lng()
        };
      }
    }
  }

 
  fetchProfessionalsBasedOnMapBounds(): void {
    this.clearMarkers();
    if (this.map) {
      this.filteredProfessionals.forEach(professional => {
        const marker = this.createMarker(professional);
        this.markers.push(marker);
      });
    }
  }

  createMarker(professional: Professional): Marker {
    if (!professional.location) {
      throw new Error('Localização do profissional não disponível.');
    }
    const [lat, lng] = professional.location.replace(/,/g, '.').split(';').map(coord => parseFloat(coord));
    const position = new google.maps.LatLng(lat, lng);

    const marker = new Marker({
      position,
      map: this.map,
      title: this.getProfessionalName(professional),
    });

    return marker;
  }

  clearMarkers(): void {
    // Esta função remove todos os marcadores do mapa e limpa o array
    this.markers.forEach(marker => marker.map = null);
    this.markers = [];
  }

  getProfessionalName(professional: Professional): string {
    let name = '';
    if (professional.professionalInfo.firstName && professional.professionalInfo.lastName) {
      name = professional.professionalInfo.firstName.split(' ')[0] + ' ' + professional.professionalInfo.lastName.split(' ')[0];
    }
    return name;
  }

  getProfessionalCategory(professional: Professional): string {
    return professional.professionalType;
  }

  /**
 * Atualiza os profissionais com o nome do concelho.
 * @param professionals A lista de profissionais.
 */
  async updateProfessionalsWithConcelho(professionals: Professional[]): Promise<void> {
    const geocoder = new google.maps.Geocoder();
    for (const professional of professionals) {
      const location = professional.location?.replace(/,/g, '.').split(';');
      if (location && location.length === 2) {
        const latlng = {
          lat: parseFloat(location[0]),
          lng: parseFloat(location[1])
        };

        professional.concelho = await this.getConcelho(latlng, geocoder);
      }
    }
  }

  /**
 * Obtém o nome do concelho com base nas coordenadas.
 * @param latlng As coordenadas (latitude e longitude).
 * @param geocoder O objeto Geocoder do Google Maps.
 * @returns O nome do concelho.
 */
  getConcelho(latlng: { lat: number, lng: number }, geocoder: any): Promise<string> {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ 'location': latlng }, (results: { address_components: any[]; }[], status: any) => {
        console.log('Chamada de API');
        if (status === google.maps.GeocoderStatus.OK) {
          const concelho = results[0]?.address_components.find(ac => ac.types.includes('administrative_area_level_2'))?.long_name || 'Não disponível';
          resolve(concelho);
        } else {
          resolve('Não disponível');
        }
      });
    });
  }

 /**
 * Ordena os profissionais com base na classificação.
 */
  orderBy() {
    const option = document.getElementById("order-select") as HTMLSelectElement | null;
    if (option && option.value === 'rank') {
      this.unsortedProfessionals = this.filteredProfessionals;
      let sortedProfessionals = [...this.filteredProfessionals];

      // Sort the cloned array
      sortedProfessionals.sort((prof1, prof2) => {
        // Assuming getAverageRating is a method that calculates the average rating
        let ratingA = prof1.averageStars;
        let ratingB = prof2.averageStars;
        if (ratingA === undefined || ratingB === undefined) {
          return 0;
        }
        return ratingB - ratingA; // Descending order
      });
      this.filteredProfessionals = sortedProfessionals;
    } else {
      this.filteredProfessionals = this.unsortedProfessionals;
    }
  }

 /**
 * Filtra os profissionais com base nas opções selecionadas.
 */
  filterProfessionals(): void {
    const selectedCategory = document.getElementById("category") as HTMLSelectElement;
    const selectedSpecialty = document.getElementById("specialty") as HTMLSelectElement;
    const selectedConsultaTipo = document.getElementById("consulta-tipo") as HTMLSelectElement;

    const professionalTypeId = parseInt(selectedCategory.value);
    let specialtyId = parseInt(selectedSpecialty.value);

    console.log("professionals", this.professionals);

    // Primeiro filtre por tipo de profissional, se houver um selecionado
    if (professionalTypeId) {
      this.filteredProfessionals = this.professionals.filter(professional =>
        professional.professionalType === this.professionalTypes.find(type => type.id === professionalTypeId)?.name
      );
      if (professionalTypeId !== this.professionalTypeId) {
        selectedSpecialty.value = "0";
      }
      this.professionalTypeId = professionalTypeId;
    }

    specialtyId = parseInt(selectedSpecialty.value);
    if (specialtyId) {
      this.filteredProfessionals = this.professionals.filter(professional =>
        professional.services.some(service => service.specialtyId === specialtyId)
      );
    }

    const consultaTipo = selectedConsultaTipo.value;
    if (professionalTypeId === 0)
      this.filteredProfessionals = this.professionals;

    console.log("filtered professionals", this.filteredProfessionals);

    // Agora atualize os marcadores no mapa com os profissionais filtrados
    this.fetchProfessionalsBasedOnMapBounds();
  }


  /**
  * Filtra os tipos de profissionais.
  */
  filterProfessionalsType(): void {
    const selectedCategory = document.getElementById("category") as HTMLSelectElement;
    const professionalType = this.professionalTypes.find(type => type.id === parseInt(selectedCategory.value));
    if (professionalType) {
      this.filteredProfessionals = this.professionals.filter(professional => professional.professionalType === professionalType.name);
    }
  }

  /**
  * Atualiza o mapa com os profissionais filtrados.
  */
  updateMapWithFilteredProfessionals(): void {
    // Limpa os marcadores antigos
    this.clearMarkers();

    // Adiciona novos marcadores para os profissionais filtrados
    this.professionals.forEach(professional => {
      const marker = this.createMarker(professional);
      this.markers.push(marker);
    });
  }

  filterProfessionalsCategory(): void {

  }

  /**
  * Filtra as especialidades com base na categoria selecionada.
  */
  filterSpecialties(): void {
    const selectedCategory = document.getElementById("category") as HTMLSelectElement;
    const professionalType = this.professionalTypes.find(type => type.id === parseInt(selectedCategory.value));

    if (professionalType) {
      this.specialtiesFiltered = this.specialties.filter(specialty => specialty.professionalTypeId === professionalType.id);
    } else {
      this.specialtiesFiltered = [];
    }
  }

  /**
 * Calcula a classificação média dos profissionais.
 */
  calculateStarsForProfessionals() {
    this.professionals.forEach(professional => {
      professional.averageStars = this.calculateStars(professional);
      console.log('averageStars', professional.averageStars);
    });
  }

  /**
 * Calcula a classificação de um profissional.
 * @param professional O profissional.
 * @returns A classificação do profissional.
 */
  calculateStars(professional: Professional): number {
    if (professional.reviews.length === 0) return 0;

    const totalStars = professional.reviews.reduce((total, review) => total + review.stars, 0);
    return totalStars / professional.reviews.length;
  }

  /**
  * Obtém os tipos de profissionais.
  */
  getProfessionalTypes() {
    this.servicesService.getProfessionalTypes().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (professionalTypes: ProfessionalType[]) => {
        this.professionalTypes = professionalTypes;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  /**
  * Obtém as especialidades.
  */
  getSpecialties() {
    this.servicesService.getSpecialties().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (specialities: Specialty[]) => {
        this.specialties = specialities;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

}
