import { Component, OnInit } from '@angular/core';
import { BackOfficeService } from '../backoffice.service';
import { environment } from '../../../environments/environment.development';
import { Loader } from '@googlemaps/js-api-loader';
import { } from '@angular/google-maps';


@Component({
  selector: 'app-estatisticas-profissional-concelho',
  templateUrl: './estatisticas-profissional-concelho.component.html',
  styleUrl: './estatisticas-profissional-concelho.component.css'
})
export class EstatisticasProfissionalConcelhoComponent implements OnInit {
  map: google.maps.Map | undefined;
  coordinates: any[] | undefined;
  mapMoved: boolean = false;
  zoom = 14;

  constructor(public backoffice: BackOfficeService) { }

  ngOnInit(): void {
    const loader = new Loader({
      apiKey: environment.googleMapsApiKey,
      version: "weekly",
      libraries: [
        "places",
        "geocoding",
        "visualization"
      ]
    });
    this.getCoordinates().then(() => {
      console.log(this.coordinates);
      loader.load().then(async () => {
        this.initMap();
      });
    });
  }

  getCoordinates(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.backoffice.getProfessionals().subscribe(
        (response: any) => {
          console.log("Success!", response);
          this.coordinates = [];

          response.forEach((professional: any) => {
            if (professional.address && professional.address.location) {
              const parts = professional.address.location.split(';');
              console.log(parts);
              if (parts.length === 2) {
                const latitude = parseFloat(parts[0].replace(',', '.'));
                const longitude = parseFloat(parts[1].replace(',', '.'));
                if (!isNaN(latitude) && !isNaN(longitude) && this.coordinates) {
                  this.coordinates.push({ lati: latitude, long: longitude });
                } else {
                  console.log('Invalid coordinates');
                }
              } else {
                console.log('Invalid location format');
              }
            } else {
              console.log('Missing location data for professional');
            }
          });

          resolve();
        },
        (error: any) => {
          console.error('Error: ', error);
          reject(error);
        }
      );
    });
  }

  initMap() {
    console.log('initMap');
    const domElement = document.getElementById('map');
    if (domElement instanceof HTMLElement) {
      const map = new google.maps.Map(domElement, {
        zoom: 10,
        center: { lat: 38.7074, lng: -9.1368 },
        mapTypeId: google.maps.MapTypeId.SATELLITE
      });

      var heatmapData = this.coordinates?.map(coord => {
        return new google.maps.LatLng(coord.lati, coord.long);
      })

      const heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
      });

      heatmap.setMap(map);
    }

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

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (this.map) {
            this.map.setCenter(currentPosition);
            this.map.setZoom(this.zoom);
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

}
