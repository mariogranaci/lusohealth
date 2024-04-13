import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Specialty } from '../../shared/models/profile/specialty';
import { ServicesService } from '../services.service';
import { Service } from '../../shared/models/servic/service';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';


@Component({
  selector: 'app-marcacoes',
  templateUrl: './marcacoes.component.html',
  styleUrl: './marcacoes.component.css'
})
export class MarcacoesComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];

  professionalTypes: ProfessionalType[] = [];

  //Filtragem 
  services: Service[] = [];
  servicesFiltered: Service[] = [];
  servicesFilteredAgain: Service[] = [];
  servicesTemp: Service[] = [];

  specialties: Specialty[] = [];
  specialtiesFiltered: Specialty[] = [];

  searchResults: string[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 15;
  pageButtons: number[] = [];

  constructor(public servicesService: ServicesService) { }

  ngOnInit() {
    this.getProfessionalTypes();
    this.getSpecialties();
    this.getServices().then(() => {
      this.servicesFiltered = this.services;
      this.servicesFilteredAgain = this.servicesFiltered;
      this.servicesTemp = this.servicesFilteredAgain;
    });;
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

  getServices(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.servicesService.getServices().pipe(
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
        console.log(error);
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    });
  }

  /**
  * Obtém as especialidades com base no número de agendamentos.
  * @returns Uma lista das principais especialidades.
  */
  getSpecialtiesByTimesScheduled(): Specialty[] {
    const sortedSpecialties = this.specialties.slice().sort((a, b) => {
      return b.timesScheduled - a.timesScheduled;
    });

    const topSpecialties = sortedSpecialties.slice(0, 3);

    console.log(topSpecialties);

    return topSpecialties;
  }

  /**
 * Obtém os serviços paginados.
 * @returns Uma lista de serviços paginados.
 */
  get paginatedServices(): Service[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.servicesFilteredAgain.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
  * Avança para a próxima página na paginação.
  */
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePageButtons();
    }
  }

  /**
  * Retrocede para a página anterior na paginação.
  */
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePageButtons();
    }
  }

  /**
  * Calcula o número total de páginas.
  * @returns O número total de páginas.
  */
  get totalPages(): number {
    return Math.ceil(this.servicesFilteredAgain.length / this.itemsPerPage);
  }

  /**
  * Atualiza a paginação para a primeira página.
  */
  updatePagination() {
    this.currentPage = 1;
    this.updatePageButtons();
  }

  /**
  * Atualiza os botões de página.
  */
  updatePageButtons() {
    this.pageButtons = [this.currentPage];
    for (let i = 1; i <= 3; i++) {
      if (this.currentPage + i <= this.totalPages) {
        this.pageButtons.push(this.currentPage + i);
      }
    }
  }

  /**
   * Vai para uma página específica.
   * @param page O número da página para ir.
   */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePageButtons();
    }
  }

  /**
  * Manipula a entrada de pesquisa.
  * @param event O evento de entrada.
  */
  onSearchInput(event: any) {
    this.searchTerm = event.target.value.trim();
    const searchTermNormalized = this.removeAccents(this.searchTerm.toLowerCase());

    if (searchTermNormalized.length > 0) {
      this.servicesFilteredAgain = this.servicesFilteredAgain.filter(service => {
        const firstName = service.professional.professionalInfo?.firstName ?? '';
        const lastName = service.professional.professionalInfo?.lastName ?? '';
        const fullNameNormalized = this.removeAccents(`${firstName} ${lastName}`.toLowerCase());
        return fullNameNormalized.includes(searchTermNormalized);
      });

      this.searchResults = this.servicesFilteredAgain.map(service => `${service.professional.professionalInfo?.firstName} ${service.professional.professionalInfo?.lastName}`)
        .filter(name => name.trim() !== '');
    } else {
      this.searchResults = [];
      this.servicesFilteredAgain = this.servicesTemp;
    }
    if (event.key === "Backspace") {
      event.target.value = "";
      this.servicesFilteredAgain = this.servicesTemp;
    }
  }

  /**
  * Remove acentos de uma string.
  * @param str A string com acentos.
  * @returns A string sem acentos.
  */
  removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  /**
  * Seleciona uma especialidade.
  * @param specialty A especialidade selecionada.
  */
  selectSpecialty(specialty: string) {
    console.log("Selected specialty:", specialty);
  }

  /**
  * Retorna a classificação média de um serviço.
  * @param service O serviço.
   * @returns A classificação média do serviço.
  */
  returnStars(service: Service): number {
    const reviewsForService = service.professional.reviews.filter(review => review.idService === service.serviceId);

    if (reviewsForService.length === 0) {
      return 0; // Default value when there are no reviews
    }

    const sumStars = reviewsForService.reduce((sum, review) => sum + review.stars, 0);
    const averageStars = sumStars / reviewsForService.length;
    return parseFloat(averageStars.toFixed(1)); // Round to one decimal place
  }

  /**
  * Filtra as especialidades com base na categoria selecionada.
  */
  filterSpecialties(): void {

    const selectedCategory = document.getElementById("category") as HTMLSelectElement;

    const professionalType = this.professionalTypes.find(type => type.name === selectedCategory.value);

    if (professionalType) {

      this.specialtiesFiltered = this.specialties.filter(specialty => specialty.professionalTypeId === professionalType.id);

    } else {

      this.specialtiesFiltered = [];
    }
  }

  /**
  * Filtra os serviços com base na categoria selecionada.
  */
  filterProfessionalsCategory(): void {

    this.servicesFiltered = this.services;

    const selectedCategory = document.getElementById("category") as HTMLSelectElement | null;
    const selectedSpecialty = document.getElementById("specialty") as HTMLSelectElement | null;

    if (selectedCategory && selectedCategory.value != "Qualquer") {

      const professionalType = this.professionalTypes.find(type => type.name.trim() === selectedCategory.value.trim());

      if (professionalType) {

        this.servicesFilteredAgain = this.servicesFiltered.filter(service => {
          return service.professional.professionalType.trim() === professionalType.name.trim();
        });

        this.servicesFiltered = this.servicesFiltered.filter(service => {
          return service.professional.professionalType.trim() === professionalType.name.trim();
        });

        this.servicesTemp = this.servicesFilteredAgain;

        if (selectedSpecialty) {

          const specialty = this.specialties.find(type => type.name.trim() === selectedSpecialty.value.trim());


          if (specialty) {

            this.servicesFiltered = this.services.filter(service => {

              if (service.specialty) return service.specialty.trim() === specialty.name.trim();
              return false;
            });

            this.servicesFilteredAgain = this.servicesFiltered.filter(service => {
              if (service.specialty) return service.specialty.trim() === specialty.name.trim();
              return false;
            });

            this.servicesTemp = this.servicesFilteredAgain;

          } else if (selectedSpecialty.value == "Qualquer") {

            this.servicesFiltered = this.services.filter(service => {
              return service.professional.professionalType.trim() === professionalType.name.trim();
            });

            this.servicesFilteredAgain = this.servicesFiltered.filter(service => {
              return service.professional.professionalType.trim() === professionalType.name.trim();
            });
            this.servicesTemp = this.servicesFilteredAgain;
          }
        }
      }
    }
    else {
      this.servicesFiltered = this.services;
      this.servicesFilteredAgain = this.servicesFiltered;
      this.servicesTemp = this.servicesFilteredAgain;
    }
    this.updatePagination();
  }

  /**
  * Filtra os serviços com base no tipo selecionado.
  */
  filterProfessionalsType(): void {
    const selectedType = document.getElementById("type") as HTMLSelectElement | null;

    if (selectedType && selectedType.value != "Qualquer") {
      this.servicesFilteredAgain = this.servicesFiltered.filter(s => {
        return this.services.find(service => service.serviceId === s.serviceId);
      });

      this.servicesFilteredAgain = this.servicesFiltered.filter(service => {

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
      this.servicesTemp = this.servicesFilteredAgain;
    }
    else {
      this.servicesFilteredAgain = this.servicesFiltered;
      this.servicesTemp = this.servicesFilteredAgain;
    }
    this.updatePagination();
  }

  /**
  * Ordena os serviços com base na opção selecionada.
  */
  orderBy() {

    const option = document.getElementById("order") as HTMLSelectElement | null;

    switch (option?.value) {
      case 'Rank':
        // Order by rank (assuming rank is calculated in some method)
        this.servicesFilteredAgain.sort((a, b) => {
          // You need to replace calculateHighestRatedStars with your actual method
          return this.returnStars(b) - this.returnStars(a);
        });
        break;
      case 'p<':
        // Order by price ascending
        this.servicesFilteredAgain.sort((a, b) => {
          const priceA = a.pricePerHour || 0;
          const priceB = b.pricePerHour || 0;
          return priceA - priceB;
        });
        break;
      case 'p>':
        // Order by price descending
        this.servicesFilteredAgain.sort((a, b) => {
          const priceA = a.pricePerHour || 0;
          const priceB = b.pricePerHour || 0;
          return priceB - priceA;
        });
        break;
      default:
        break;
    }
    this.updatePagination();
  }
}
