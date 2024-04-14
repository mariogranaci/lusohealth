import { Component } from '@angular/core';
import { BackOfficeService } from '../backoffice.service';

@Component({
  selector: 'app-estatisticas-classificacao-profissional',
  templateUrl: './estatisticas-classificacao-profissional.component.html',
  styleUrl: './estatisticas-classificacao-profissional.component.css'
})
export class EstatisticasClassificacaoProfissionalComponent {
  dataLoaded: boolean = false;
  presentedData: any[] = [];
  unorderedData: any[] = [];
  private rankingData: any[] = [];
  filterOptionsCategory: any[] = [];
  selectedCategoryOption: number = 0;
  filterOptionsSpeciality: any[] = [];
  presentedFilterOptionsSpeciality: any[] = [];
  selectedSpecialityOption: number = 0;
  isDataFiltered: boolean = false;
  selectedOrderOption: string = '';

  constructor(public backoffice: BackOfficeService) { }

  ngOnInit() {
    this.getServicesByRanking();
    this.getCategorys();
    this.getSpecialties();
  }

  getServicesByRanking() {
    this.backoffice.getServicesByRanking().subscribe(
      (response: any) => {
        console.log("Success!", response);
        this.rankingData = response;
        this.presentedData = this.rankingData;
        this.unorderedData = this.rankingData;
        this.dataLoaded = true;
      },
      (error: any) => {
        console.error('Error: ', error);
      }
    );
  }

  applyOrder(event: any) {
    if (event !== null && event !== undefined) {
      console.log(this.selectedOrderOption);
      switch (event.target.value) {
        case 'none':
          this.presentedData = this.unorderedData;
          break;
        case 'professionalName':
          this.presentedData = this.presentedData.sort((a, b) => a.professionalName.localeCompare(b.professionalName));
          break;
        case 'professionalType':
          this.presentedData = this.presentedData.sort((a, b) => a.professionalType.localeCompare(b.professionalType));
          break;
        case 'specialtyName':
          this.presentedData = this.presentedData.sort((a, b) => a.specialtyName.localeCompare(b.specialtyName));
          break;
        case 'rating':
          this.presentedData = this.presentedData.sort((a, b) => b.rating - a.rating);
          break;
      }
    }
  }

  applyCategoryFilter(event: any) {
    if (event !== null && event !== undefined) {
      this.selectedCategoryOption = event.target.value;
      this.dataLoaded = false;
      this.applyFilters();
    }
  }

  applySpecialityFilter(event: any) {
    if (event !== null && event !== undefined) {
      this.selectedSpecialityOption = parseInt(event.target.value);
      this.dataLoaded = false;
      this.applyFilters();
    }
  }

  getCategorys() {
      this.backoffice.getProfessionalTypes().subscribe(
        (response: any) => {
          console.log("Success!", response);
          this.filterOptionsCategory = response;
          this.filterOptionsCategory.push({
            id: 0,
            name: 'Categorias'
          });

        },
        (error: any) => {
          console.error('Error: ', error);
        }
      );
    }

  getSpecialties() {
    this.backoffice.getSpecialties().subscribe(
      (response: any) => {
        console.log("Success!", response);
        this.filterOptionsSpeciality = response;
        this.filterOptionsSpeciality.push({
          id: 0,
          name: 'Especialidades'
        });
        this.presentedFilterOptionsSpeciality = this.filterOptionsSpeciality;

      },
      (error: any) => {
        console.error('Error: ', error);
      }
    );
  }

  applyFilters() {
    // Check if both filters have selected options
    if (this.selectedSpecialityOption != 0 && this.selectedCategoryOption != 0) {
      this.presentedData = this.rankingData.filter((item) => {
        return item.professionalTypeId == this.selectedCategoryOption &&
          item.specialityId == this.selectedSpecialityOption;
      });
      this.unorderedData = this.presentedData;

      console.log(this.presentedData);
    } else if (this.selectedSpecialityOption != 0) { 
      this.presentedData = this.rankingData.filter((item) =>
        item.specialityId == this.selectedSpecialityOption
      );

      this.unorderedData = this.presentedData;
    } else if (this.selectedCategoryOption != 0) { // Only Category filter selected
      this.presentedFilterOptionsSpeciality = this.filterOptionsSpeciality.filter(speciality => speciality.professionalTypeId == this.selectedCategoryOption);

      this.presentedData = this.rankingData.filter((item) =>
        item.professionalTypeId == this.selectedCategoryOption
      );
      this.unorderedData = this.presentedData;

    } else { // No filters selected
      this.presentedData = this.rankingData;
      this.unorderedData = this.rankingData;
    }

    this.dataLoaded = true;
  }

}
