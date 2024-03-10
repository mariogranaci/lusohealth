import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProfessionalType } from '../../shared/models/authentication/professionalType';
import { Specialty } from '../../shared/models/profile/specialty';
import { ServicesService } from '../../services/services.service';

@Component({
  selector: 'app-historico-consultas',
  templateUrl: './historico-consultas.component.html',
  styleUrl: './historico-consultas.component.css'
})
export class HistoricoConsultasComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];

  professionalTypes: ProfessionalType[] = [];

  specialties: Specialty[] = [];
  specialtiesFiltered: Specialty[] = [];



  constructor(public servicesService: ServicesService) { }

  ngOnInit() {
    this.getProfessionalTypes();
    this.getSpecialties();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  resetDropdowns() {
    const categoryDropdown = document.getElementById("category") as HTMLSelectElement;
    const specialtyDropdown = document.getElementById("specialty") as HTMLSelectElement;

    categoryDropdown.selectedIndex = 0;
    specialtyDropdown.selectedIndex = 0;
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

  orderBy() {

    //const option = document.getElementById("order") as HTMLSelectElement | null;

    //switch (option?.value) {
    //  case 'Rank':
    //    // Order by rank (assuming rank is calculated in some method)
    //    this.servicesFilteredAgain.sort((a, b) => {
    //      // You need to replace calculateHighestRatedStars with your actual method
    //      return this.returnStars(b) - this.returnStars(a);
    //    });
    //    break;
    //  case 'p<':
    //    // Order by price ascending
    //    this.servicesFilteredAgain.sort((a, b) => {
    //      const priceA = a.pricePerHour || 0;
    //      const priceB = b.pricePerHour || 0;
    //      return priceA - priceB;
    //    });
    //    break;
    //  case 'p>':
    //    // Order by price descending
    //    this.servicesFilteredAgain.sort((a, b) => {
    //      const priceA = a.pricePerHour || 0;
    //      const priceB = b.pricePerHour || 0;
    //      return priceB - priceA;
    //    });
    //    break;
    //  default:
    //    break;
    //}
  }
}
