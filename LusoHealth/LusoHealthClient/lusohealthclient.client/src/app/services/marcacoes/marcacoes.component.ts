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
  professionalsFilteredAgain: Professional[] = [];
  professionalsTemp: Professional[] = [];
  services: Service[] = [];
  specialties: Specialty[] = [];
  specialtiesFiltered: Specialty[] = [];
  searchResults: string[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  pageButtons: number[] = [];

  constructor(public servicesService: ServicesService) { }

  ngOnInit() {
    this.getProfessionalTypes();
    this.getSpecialties();
    this.getProfessionals().then(() => {
      this.professionalsFiltered = this.professionals;
      this.professionalsFilteredAgain = this.professionalsFiltered;
      this.professionalsTemp = this.professionalsFilteredAgain;
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

  get paginatedProfessionals(): Professional[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.professionalsFilteredAgain.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePageButtons();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePageButtons();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.professionalsFilteredAgain.length / this.itemsPerPage);
  }

  updatePagination() {
    this.currentPage = 1;
    this.updatePageButtons();
  }

  updatePageButtons() {
    this.pageButtons = [this.currentPage];
    for (let i = 1; i <= 3; i++) {
      if (this.currentPage + i <= this.totalPages) {
        this.pageButtons.push(this.currentPage + i);
      }
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePageButtons();
    }
  }


  onSearchInput(event: any) {
    this.searchTerm = event.target.value.trim();
    const searchTermNormalized = this.removeAccents(this.searchTerm.toLowerCase());

    if (searchTermNormalized.length > 0) {
      this.professionalsFilteredAgain = this.professionalsFilteredAgain.filter(professional => {
        const firstName = professional.professionalInfo?.firstName ?? '';
        const lastName = professional.professionalInfo?.lastName ?? '';
        const fullNameNormalized = this.removeAccents(`${firstName} ${lastName}`.toLowerCase());
        return fullNameNormalized.includes(searchTermNormalized);
      });

      this.searchResults = this.professionalsFilteredAgain.map(professional => `${professional.professionalInfo?.firstName} ${professional.professionalInfo?.lastName}`)
        .filter(name => name.trim() !== '');
    } else {
      this.searchResults = [];
      this.professionalsFilteredAgain = this.professionalsTemp;
    }
    if (event.key === "Backspace")
    {
      event.target.value = "";
      this.professionalsFilteredAgain = this.professionalsTemp;
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


  filterProfessionalsCategory(): void {

    this.professionalsFiltered = this.professionals;

    const selectedCategory = document.getElementById("category") as HTMLSelectElement | null;
    const selectedSpecialty = document.getElementById("specialty") as HTMLSelectElement | null;

    if (selectedCategory && selectedCategory.value != "-----") {

      const professionalType = this.professionalTypes.find(type => type.name.trim() === selectedCategory.value.trim());

      if (professionalType) {

        this.professionalsFilteredAgain = this.professionalsFiltered.filter(professional => {
          return professional.professionalType.trim() === professionalType.name.trim();
        });

        this.professionalsFiltered = this.professionalsFiltered.filter(professional => {
          return professional.professionalType.trim() === professionalType.name.trim();
        });

        this.professionalsTemp = this.professionalsFilteredAgain; 

        if (selectedSpecialty) {

          const specialty = this.specialties.find(type => type.name.trim() === selectedSpecialty.value.trim());


          if (specialty) {

            this.professionalsFiltered = this.professionals.filter(professional => {
              return this.findHighestRatedSpecialty(professional).trim() === specialty.name.trim();
            });

            this.professionalsFilteredAgain = this.professionalsFiltered.filter(professional => {
              return this.findHighestRatedSpecialty(professional).trim() === specialty.name.trim();
            });

            this.professionalsTemp = this.professionalsFilteredAgain; 

          } else if (selectedSpecialty.value == "-----") {

            this.professionalsFiltered = this.professionals.filter(professional => {
              return professional.professionalType.trim() === professionalType.name.trim();
            });

            this.professionalsFilteredAgain = this.professionalsFiltered.filter(professional => {
              return professional.professionalType.trim() === professionalType.name.trim();
            });
            this.professionalsTemp = this.professionalsFilteredAgain; 
          }
        }
      } 
    }
    else {
      this.professionalsFiltered = this.professionals;
      this.professionalsFilteredAgain = this.professionalsFiltered;
      this.professionalsTemp = this.professionalsFilteredAgain; 
    }
    this.updatePagination();
  }

  filterProfessionalsType(): void {

    const selectedType = document.getElementById("type") as HTMLSelectElement | null;
    
    if (selectedType && selectedType.value != "-----") {
      this.professionalsFilteredAgain = this.professionalsFiltered.filter(professional => {
        return this.services.find(service => service.serviceId === this.findHighestRatedService(professional)?.serviceId);
      });

      this.professionalsFilteredAgain = this.professionalsFiltered.filter(professional => {
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
      this.professionalsTemp = this.professionalsFilteredAgain; 
    }
    else {
      this.professionalsFilteredAgain = this.professionalsFiltered;
      this.professionalsTemp = this.professionalsFilteredAgain; 
    }
    this.updatePagination();
  }

  orderBy() {

    const option = document.getElementById("order") as HTMLSelectElement | null;

    switch (option?.value) {
      case 'Rank':
        // Order by rank (assuming rank is calculated in some method)
        this.professionalsFilteredAgain.sort((a, b) => {
          // You need to replace calculateHighestRatedStars with your actual method
          return this.calculateHighestRatedStars(b) - this.calculateHighestRatedStars(a);
        });
        break;
      case 'p<':
        // Order by price ascending
        this.professionalsFilteredAgain.sort((a, b) => {
          const priceA = this.findHighestRatedSpecialtyPrice(a) || 0;
          const priceB = this.findHighestRatedSpecialtyPrice(b) || 0;
          return priceA - priceB;
        });
        break;
      case 'p>':
        // Order by price descending
        this.professionalsFilteredAgain.sort((a, b) => {
          const priceA = this.findHighestRatedSpecialtyPrice(a) || 0;
          const priceB = this.findHighestRatedSpecialtyPrice(b) || 0;
          return priceB - priceA;
        });
        break;
      default:
        // Default behavior: do nothing
        break;
    }
    this.updatePagination();
  }

  /*filterProfessionals(): void {
    this.professionalsFiltered = this.professionals;

    const selectedCategory = document.getElementById("category") as HTMLSelectElement | null;
    const selectedSpecialty = document.getElementById("specialty") as HTMLSelectElement | null;
    const selectedType = document.getElementById("type") as HTMLSelectElement | null;

    if (selectedCategory && selectedCategory.value != "-----") {

      const professionalType = this.professionalTypes.find(type => type.name.trim() === selectedCategory.value.trim());

      if (professionalType) {

        this.professionalsFiltered = this.professionals.filter(professional => {
          return professional.professionalType.trim() === professionalType.name.trim();
        });

        if (selectedSpecialty) {

          const specialty = this.specialties.find(type => type.name.trim() === selectedSpecialty.value.trim());

          if (specialty) {
            this.professionalsFiltered = this.professionalsFiltered.filter(professional => {
              return this.findHighestRatedSpecialty(professional).trim() === specialty.name.trim();
            });
          } else if (selectedSpecialty.value == "-----") {
            this.professionalsFiltered = this.professionals.filter(professional => {
              return professional.professionalType.trim() === professionalType.name.trim();
            });
          }
        }
        else {
          this.professionalsFiltered = this.professionals;
        }

      }
    }else if (selectedType) {
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
    
  }*/
}
