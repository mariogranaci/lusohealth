import { Component, HostListener } from '@angular/core';
import { AuthenticationService, ProfessionalType } from '../../authentication/authentication.service';
import { Subject, takeUntil } from 'rxjs';
import { HomeService } from '../home.service';
import { Professional } from '../../shared/models/profile/professional';
import { Service } from '../../shared/models/profile/service';
import { Specialty } from '../../shared/models/profile/Specialty';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  professionalTypes: ProfessionalType[] = [];
  professionals: Professional[] = [];
  services: Service[] = [];
  specialties: Specialty[] = [];
  searchResults: string[] = [];
  searchTerm: string = '';

  constructor(public homeService: HomeService) { }

  ngOnInit() {
    this.getProfessionalTypes();
    this.getProfessionals();
    this.getSpecialties();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getFirstAndLastName(fullName: string): string {
    const names = fullName.split(' ');
    if (names.length > 2) {
      return `${names[0]} ${names[names.length - 1]}`;
    } else {
      return fullName;
    }
  }

  getProfessionalTypes() {
    this.homeService.getProfessionalTypes().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (professionalTypes: ProfessionalType[]) => {
        this.professionalTypes = professionalTypes;
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  getProfessionals() {
    this.homeService.getProfessionals().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (professionals: Professional[]) => {
        this.professionals = professionals;
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  getSpecialties() {
    this.homeService.getSpecialties().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (specialities: Specialty[]) => {
        this.specialties = specialities;
        
      },
      error: (error) => {
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  getSpecialtiesByTimesScheduled(): Specialty[] {
    const sortedSpecialties = this.specialties.slice().sort((a, b) => {
      return b.timesScheduled - a.timesScheduled;
    });

    const topSpecialties = sortedSpecialties.slice(0, 3);

    console.log(topSpecialties);

    return topSpecialties;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    if (!event.target.closest('#searchDiv')) {
      this.searchTerm = '';
      this.searchResults = [];
    }
  }

  onSearchInput(event: any) {
    this.searchTerm = event.target.value.trim();
    const searchTermNormalized = this.removeAccents(this.searchTerm.toLowerCase());

    if (searchTermNormalized.length > 1) {
      this.searchResults = this.specialties
        .filter(specialty => this.removeAccents(specialty.name.toLowerCase()).includes(searchTermNormalized))
        .map(specialty => specialty.name);
    } else {
      this.searchResults = [];
    }
  }

  removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  selectSpecialty(specialty: string) {
    console.log("Selected specialty:", specialty);
  }


  calculateAverageStars(professional: Professional): number {
    if (!professional.reviews || professional.reviews.length === 0) {
      return 0; // Default value when there are no reviews
    }

    const sumStars = professional.reviews.reduce((sum, review) => sum + review.stars, 0);
    return sumStars / professional.reviews.length;
  }

  findHighestRatedSpecialty(professional: Professional): string {
    if (!professional.reviews || professional.reviews.length === 0) {
      return '';
    }
    const highestRatedReview = professional.reviews.reduce((prev, current) => (prev.stars > current.stars) ? prev : current);

    this.services = professional.services;

    const service: Service | undefined = this.services.find(service => service.serviceId === highestRatedReview.idService);

    if (service) {
      const specialty: string | undefined | null = this.services.find(type => type.specialtyId === service.specialtyId)?.specialty;
      return specialty ? specialty: '';
    } else {
      return 'NENHUM';
    }
  }

  findHighestRatedSpecialtyPrice(professional: Professional): number | null{
    if (!professional.reviews || professional.reviews.length === 0) {
      return null;
    }
    const highestRatedReview = professional.reviews.reduce((prev, current) => (prev.stars > current.stars) ? prev : current);

    this.services = professional.services;

    const service: Service | undefined = this.services.find(service => service.serviceId === highestRatedReview.idService);

    if (service) {
      const specialty: number | undefined = this.services.find(type => type.specialtyId === service.specialtyId)?.pricePerHour;
      return specialty ? specialty : null;
    } else {
      return null;
    }
  }
}
