import { Component, HostListener } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HomeService } from '../home.service';
import { Service } from '../../shared/models/services/service';
import { Specialty } from '../../shared/models/profile/specialty';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  professionalTypes: ProfessionalType[] = [];
  services: Service[] = [];
  specialties: Specialty[] = [];
  searchResults: Specialty[] = [];
  searchTerm: string = '';
  public topSpecialties: Specialty[] = [];

  constructor(public homeService: HomeService) { }

  ngOnInit() {
    this.getProfessionalTypes();
    this.getServices();
    this.getSpecialties().then(() => {
      this.getSpecialtiesByTimesScheduled();
    });
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

  getServices(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.homeService.getServices().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (services: any) => {
          this.services = services;
          resolve();
        },
        error: (error) => {
          console.log(error);
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
          reject(error);
        }
      });
    });
  }

  get fourServices(): Service[] {
    return this.services.slice(0, 4);
  }

  returnStars(service: Service): number {
    const reviewsForService = service.professional.reviews.filter(review => review.idService === service.serviceId);

    if (reviewsForService.length === 0) {
      return 0; // Default value when there are no reviews
    }

    const sumStars = reviewsForService.reduce((sum, review) => sum + review.stars, 0);
    return sumStars / reviewsForService.length;
  }

  getProfessionalTypeName(professionalTypeID: number): string | undefined {
    const professionalType = this.professionalTypes.find(pt => pt.id === professionalTypeID);
    return professionalType ? professionalType.name : undefined;
  }

  getSpecialties(): Promise<void> {
    
    return new Promise<void>((resolve, reject) => {
      this.homeService.getSpecialties().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (specialities: Specialty[]) => {
          this.specialties = specialities;
          resolve();
        },
        error: (error) => {
          console.log(error);
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
          reject(error);
        }
      });
    });
  }

  getSpecialtiesByTimesScheduled() {
    
    const sortedSpecialties = this.specialties.slice().sort((a, b) => {
      return b.timesScheduled - a.timesScheduled;
    });

    this.topSpecialties = sortedSpecialties.slice(0, 3);
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
        .map(specialty => specialty);
    } else {
      this.searchResults = [];
    }
  }

  removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  selectSpecialty(specialty: Specialty) {
    console.log("Selected specialty:", specialty.name);
  }
}
