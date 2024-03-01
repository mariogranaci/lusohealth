import { Component } from '@angular/core';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { Specialty } from '../../shared/models/profile/Specialty';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent {
  professionalTypes: ProfessionalType[] = [];
  specialties : Specialty[] = [];
}
