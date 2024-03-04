import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { Specialty } from '../../shared/models/profile/specialty';
import { } from '@angular/google-maps';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment.development';
import { Marker } from '@googlemaps/adv-markers-utils';
import { ServicesService } from '../services.service';
import { Professional } from '../../shared/models/profile/professional';
import { Subject, takeUntil } from 'rxjs';
import { Bounds } from '../../shared/models/services/bounds';

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
  professionals: Professional[] = [];
  zoom = 14;
  center: google.maps.LatLngLiteral = { lat: 38.736946, lng: -9.142685 };
  map: google.maps.Map | undefined;
  mapMoved: boolean = false;
  markers: Marker[] = [];
  private unsubscribe$ = new Subject<void>();
  concelho: string | null = null;

  constructor(private servicesService: ServicesService) { }

  ngOnInit() {
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

  async initMap() {
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
    }
    this.getCurrentLocation();
  }

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
            this.fetchProfessionalsBasedOnMapBounds();
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

  fetchProfessionalsBasedOnMapBounds(): void {
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
              professionals.forEach((professional) => {
                console.log(professional);
                this.createMarker(professional);
              });
            });
          }, (error) => {
            console.error(error);
          }
        );
      }
    }
  }

  createMarker(professional: Professional): void {
    const professionalInfo = professional.professionalInfo;
    if (professional.location) {
      const location = professional.location.replace(/,/g, '.').split(';');
      const latitude = parseFloat(location[0]);
      const longitude = parseFloat(location[1]);
      const professionalLocationMarker = new Marker({
        position: { lat: latitude, lng: longitude },
        map: this.map,
        title: professional.professionalInfo.firstName + ' ' + professional.professionalInfo.lastName,
      });
      this.markers.push(professionalLocationMarker);
    }
  }

  clearMarkers() {
    for (let marker of this.markers) {
      marker.map = null;
    }
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

  getProfessionalRating(professional: Professional): string {
    if (professional.reviews.length === 0) return '-';
    let rating = 0;
    if (professional.reviews.length > 0) {
      professional.reviews.forEach((review) => {
        rating += review.stars;
      });
      rating = rating / professional.reviews.length;
    }
    return rating.toFixed(1).replace('.', ',');
  }

  async updateProfessionalsWithConcelho(professionals: Professional[]): Promise<void> {
    const geocoder = new google.maps.Geocoder();

    for (const professional of professionals) {
      const location = professional.location?.replace(/,/g, '.').split(';');
      if (location && location.length === 2) {
        const latlng = {
          lat: parseFloat(location[0]),
          lng: parseFloat(location[1])
        };

        // Note: Esta é uma função que retorna uma Promise para resolver a geocodificação reversa
        professional.concelho = await this.getConcelho(latlng, geocoder);
      }
    }
  }


  getConcelho(latlng: { lat: number, lng: number }, geocoder: any): Promise<string> {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ 'location': latlng }, (results: { address_components: any[]; }[], status: any) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const concelho = results[0]?.address_components.find(ac => ac.types.includes('administrative_area_level_2'))?.long_name || 'Não disponível';
          resolve(concelho);
        } else {
          resolve('Não disponível');
        }
      });
    });
  }
}
