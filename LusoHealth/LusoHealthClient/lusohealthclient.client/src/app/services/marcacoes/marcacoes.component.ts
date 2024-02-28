import { Component, HostListener } from '@angular/core';
import { AuthenticationService, ProfessionalType } from '../../authentication/authentication.service';
import { Subject, takeUntil } from 'rxjs';
import { Professional } from '../../shared/models/profile/professional';
import { Service } from '../../shared/models/profile/service';
import { Specialty } from '../../shared/models/profile/Specialty';
import { ServicesService } from '../services.service';


@Component({
  selector: 'app-marcacoes',
  templateUrl: './marcacoes.component.html',
  styleUrl: './marcacoes.component.css'
})
export class MarcacoesComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  professionalTypes: ProfessionalType[] = [];
  professionals: Professional[] = [];
  professionalsFiltered: Professional[] = [];
  services: Service[] = [];
  specialties: Specialty[] = [];
  specialtiesFiltered: Specialty[] = [];
  searchResults: string[] = [];
  searchTerm: string = '';

  constructor(public servicesService: ServicesService) { }

  ngOnInit() {
    this.getProfessionalTypes();
    this.getSpecialties();
    this.getProfessionals().then(() => {
      this.professionalsFiltered = this.professionals;
    });
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
    this.servicesService.getProfessionalTypes().pipe(
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

  getProfessionals(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.servicesService.getProfessionals().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (professionals: Professional[]) => {
          this.professionals = professionals;
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

  getSpecialties() {
    this.servicesService.getSpecialties().pipe(
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
        this.professionalsFiltered = this.professionals.filter(professional => {
        const firstName = professional.professionalInfo?.firstName ?? '';
        const lastName = professional.professionalInfo?.lastName ?? '';
        const fullNameNormalized = this.removeAccents(`${firstName} ${lastName}`.toLowerCase());
        return fullNameNormalized.includes(searchTermNormalized);
      });

      this.searchResults = this.professionalsFiltered.map(professional => `${professional.professionalInfo?.firstName} ${professional.professionalInfo?.lastName}`)
        .filter(name => name.trim() !== '');
    } else {
      this.searchResults = [];
      this.professionalsFiltered = this.professionals;
    }
  }

  removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  selectSpecialty(specialty: string) {
    console.log("Selected specialty:", specialty);
  }

  calculateHighestRatedStars(professional: Professional): number {
    if (!professional.reviews || professional.reviews.length === 0) {
      return 0;
    }
    return Math.max(...professional.reviews.map(review => review.stars));
  }

  findHighestRatedService(professional: Professional): Service | undefined {
    if (!professional.reviews || professional.reviews.length === 0) {
      return undefined;
    }
    const highestRatedReview = professional.reviews.reduce((prev, current) => (prev.stars > current.stars) ? prev : current);

    this.services = professional.services;

    const service: Service | undefined = this.services.find(service => service.serviceId === highestRatedReview.idService);

    return service;
  }

  findHighestRatedSpecialty(professional: Professional): string {

    const service: Service | undefined = this.findHighestRatedService(professional);

    if (service) {
      const specialty: string | undefined = this.services.find(type => type.specialtyId === service.specialtyId)?.specialty;
      return specialty ? specialty : '';
    } else {
      return 'NENHUMA';
    }
  }

  findHighestRatedSpecialtyPrice(professional: Professional): number | null {

    const service: Service | undefined = this.findHighestRatedService(professional);

    if (service) {
      const specialty: number | undefined = this.services.find(type => type.specialtyId === service.specialtyId)?.pricePerHour;
      return specialty ? specialty : null;
    } else {
      return null;
    }
  }

  filterSpecialties(): void {

    const selectedCategory = document.getElementById("category") as HTMLSelectElement;

    const professionalType = this.professionalTypes.find(type => type.name === selectedCategory.value);

    if (professionalType) {

      this.specialtiesFiltered = this.specialties.filter(specialty => specialty.professionalTypeId === professionalType.id);

    } else {

      this.specialtiesFiltered = [];
    }
  }

  filterProfessionals(): void {
    this.professionalsFiltered = this.professionals;

    const selectedCategory = document.getElementById("category") as HTMLSelectElement | null;
    const selectedSpecialty = document.getElementById("specialty") as HTMLSelectElement | null;
    const selectedType = document.getElementById("type") as HTMLSelectElement | null;

    if (selectedCategory && selectedSpecialty && selectedType) {

      console.log(this.professionalTypes);
      console.log(this.specialties);
      console.log(selectedSpecialty.value);
      console.log(selectedCategory.value);

      const professionalType = this.professionalTypes.find(type => type.name === selectedSpecialty.value);
      const specialty = this.specialties.find(type => type.name === selectedCategory.value);

      console.log(professionalType);
      console.log(specialty);


      if (specialty) {
        this.professionalsFiltered = this.professionals.filter(professional => {
          return this.findHighestRatedSpecialty(professional) === specialty.name;
        });
      }
      if (professionalType) {
        this.professionalsFiltered = this.professionals.filter(professional => {
          return professional.professionalType === professionalType.name;
        });
      }
      if (selectedType) {
        this.professionalsFiltered = this.professionals.filter(professional => {
          return this.services.find(service => service.serviceId === this.findHighestRatedService(professional)?.serviceId);
        });

        this.professionalsFiltered = this.professionals.filter(professional => {
          const service = this.findHighestRatedService(professional);

          if (service) {
            if (selectedType.value == "Home") {
              return service.home === true;
            }
            else if (selectedType.value == "Online") {
              return service.online === true;
            }
            else if (selectedType.value == "Presential") {
              return service.presential === true;
            }
          }
          return false;
        });
      }
    }
    console.log(this.professionalsFiltered);
  }



}
