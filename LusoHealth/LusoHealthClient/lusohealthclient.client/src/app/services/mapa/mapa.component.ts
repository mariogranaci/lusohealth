import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { Specialty } from '../../shared/models/profile/specialty';
import { } from '@angular/google-maps';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment.development';
import { Marker } from '@googlemaps/adv-markers-utils';

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
  zoom = 14;
  center: google.maps.LatLngLiteral = { lat: 38.736946, lng: -9.142685 };
  map: google.maps.Map | undefined;

  ngOnInit() {
    const loader = new Loader({
      apiKey: environment.googleMapsApiKey,
      version: "weekly",
      libraries: [
        "places",
      ]
    });

    loader.load().then(async () => {
      this.initMap();
      console.log('Mapa carregado');
      this.initAutocomplete();
      console.log("Autocomplete carregado");
    });
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
    this.getCurrentLocation();
    if (this.map) {
      this.map.addListener('idle', () => {
        this.fetchProfessionalsBasedOnMapBounds();
      });
    }
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
        console.log(place.address_components);
        if (this.map) {
          console.log('Mapa existe');
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
            console.log(`Localização do usuário: ${currentPosition.lat}, ${currentPosition.lng}`);
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
      console.log("Geolocalização não é suportada por este navegador.");
    }
  }

  fetchProfessionalsBasedOnMapBounds(): void {
    if (this.map) {
      // Pega os limites do mapa atual
      const bounds = this.map.getBounds();
      if (bounds) {
        // Pega o canto nordeste e sudoeste dos limites
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        // Aqui você pode agora fazer uma chamada para a sua API backend
        // para buscar os profissionais que estão dentro desses limites
        // Exemplo:
        // this.yourService.fetchProfessionals(ne.lat(), ne.lng(), sw.lat(), sw.lng())
        // .subscribe(professionals => {
        //   // Fazer algo com os dados dos profissionais, como colocá-los no mapa
        // });

        console.log(`Limites do Mapa: NE: ${ne.lat()}, ${ne.lng()} - SW: ${sw.lat()}, ${sw.lng()}`);
      }
    }
  }
}
