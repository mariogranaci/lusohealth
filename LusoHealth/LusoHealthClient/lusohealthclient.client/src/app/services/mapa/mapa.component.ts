import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { Specialty } from '../../shared/models/profile/specialty';
import { } from '@angular/google-maps';


declare var google: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements OnInit, AfterViewInit{
  @ViewChild('searchBox', { static: false }) searchBox?: ElementRef;
  professionalTypes: ProfessionalType[] = [];
  specialties: Specialty[] = [];
  zoom = 13;
  center: google.maps.LatLngLiteral = { lat: 38.736946, lng: -9.142685 };
  map: google.maps.Map | undefined; 

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.initAutocomplete();
  }

  onMapReady(map: any): void {
    this.map = map;
    console.log('Mapa carregado');
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
          } else {
            this.map.setCenter(place.geometry.location);
            this.map.setZoom(13);
          }
        }
      });
    }
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    console.log(event);
  }

  onMapIdle() {
    console.log('The map has finished loading');
  }
}
