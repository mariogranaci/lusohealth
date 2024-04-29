import { Component, HostListener } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HomeService } from '../home.service';
import { Service } from '../../shared/models/servic/service';
import { Specialty } from '../../shared/models/profile/specialty';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { BestServices } from '../../shared/models/profile/bestServices';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  professionalTypes: ProfessionalType[] = [];
  services: BestServices[] = [];
  specialties: Specialty[] = [];
  searchResults: Specialty[] = [];
  searchTerm: string = '';
  public topSpecialties: Specialty[] = [];
  servicesByProfessionalType: { [key: number]: BestServices[] } = {};
  loading = false;

  constructor(public homeService: HomeService) { }

  ngOnInit() {
    this.loading = true;
    this.getProfessionalTypes().then(() => {
      this.getServices().then(() => {
        this.populateServicesByProfessionalType();
        this.loading = false;
      });
    });
    this.getSpecialties().then(() => {
      this.getSpecialtiesByTimesScheduled();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Obtém os tipos de profissional.
   */
  getProfessionalTypes(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.homeService.getProfessionalTypes().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (professionalTypes: ProfessionalType[]) => {
          this.professionalTypes = professionalTypes;
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
  * Obtém os serviços.
  * @returns Uma Promise que resolve quando os serviços são obtidos.
  */
  getServices(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.homeService.getServices().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (services: BestServices[]) => {
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

  getServicesByProfessionalType(professionalTypeId: number): BestServices[] {
    const services = this.services.filter(service => service.professionalTypeId === professionalTypeId);
    console.log('filtered services', services);
    return services;
  }

  /**
   * Retorna a média de estrelas para um serviço.
   * @param service O serviço.
   * @returns A média de estrelas para o serviço.
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
   * Retorna o nome do tipo de profissional.
   * @param professionalTypeID O ID do tipo de profissional.
   * @returns O nome do tipo de profissional, se encontrado.
   */
  getProfessionalTypeName(professionalTypeID: number): string | undefined {
    const professionalType = this.professionalTypes.find(pt => pt.id === professionalTypeID);
    return professionalType ? professionalType.name : undefined;
  }

  populateServicesByProfessionalType() {
    this.professionalTypes.forEach((professionalType) => {
      this.servicesByProfessionalType[professionalType.id] = this.getServicesByProfessionalType(professionalType.id);
    });
  }

  /**
   * Obtém as especialidades.
   * @returns Uma Promise que resolve quando as especialidades são obtidas.
   */
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

  /**
   * Obtém as especialidades ordenadas pelo número de vezes agendadas.
   */
  getSpecialtiesByTimesScheduled() {
    
    const sortedSpecialties = this.specialties.slice().sort((a, b) => {
      return b.timesScheduled - a.timesScheduled;
    });
    this.topSpecialties = sortedSpecialties.slice(0, 3);
  }

  /**
   * Atualiza os resultados de busca conforme o utilizador digita.
   * @param event O evento de input.
   */
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

  /**
   * Remove acentos de uma string.
   * @param str A string com acentos.
   * @returns A string sem acentos.
   */
  removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  /**
  * Seleciona uma especialidade para exibir detalhes ou agendar.
  * @param specialty A especialidade selecionada.
  */
  selectSpecialty(specialty: Specialty) {
    console.log("Selected specialty:", specialty.name);
  }
}
