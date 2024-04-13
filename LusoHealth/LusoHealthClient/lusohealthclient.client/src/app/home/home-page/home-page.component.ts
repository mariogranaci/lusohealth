import { Component, HostListener } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HomeService } from '../home.service';
import { Service } from '../../shared/models/servic/service';
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

  /**
   * Retorna o primeiro e último nome a partir do nome completo.
   * @param fullName O nome completo do utilizador.
   * @returns O primeiro e último nome do utilizador.
   */
  getFirstAndLastName(fullName: string): string {
    const names = fullName.split(' ');
    if (names.length > 2) {
      return `${names[0]} ${names[names.length - 1]}`;
    } else {
      return fullName;
    }
  }

  /**
   * Obtém os tipos de profissional.
   */
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

  /**
  * Obtém os serviços.
  * @returns Uma Promise que resolve quando os serviços são obtidos.
  */
  getServices(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.homeService.getServices().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (services: any) => {
          this.services = services;
          this.services.sort((a, b) => {

            return this.returnStars(b) - this.returnStars(a);
          });
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
   * Retorna os quatro primeiros serviços de um tipo específico.
   * @param type O tipo de serviço.
   * @returns Um array contendo os quatro primeiros serviços do tipo especificado.
   */
  fourServices(type: String): Service[] {
    const services = this.services.filter(service => service.professional.professionalType === type).slice(0, 4);
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
   * Fecha os resultados de busca ao clicar fora do campo de busca.
   * @param event O evento de clique.
   */
  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    if (!event.target.closest('#searchDiv')) {
      this.searchTerm = '';
      this.searchResults = [];
    }
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
