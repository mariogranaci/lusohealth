import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  services: Service[] = [];

  specialties: Specialty[] = [];
  specialtiesFiltered: Specialty[] = [];

  searchResults: string[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pageButtons: number[] = [];
  hasMorePages: boolean = true;

  selectedCategory: string = '';
  selectedSpecialty: string = '';
  selectedType: string = '';
  selectedOrder: string = 'Rank';

  constructor(public servicesService: ServicesService,
  private route: ActivatedRoute,
  private router: Router) { }

  ngOnInit() {
    Promise.all([
      this.getProfessionalTypes(),
      this.getSpecialties()
    ]).then(() => {
      this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {

        const professionalType = this.professionalTypes.find(type => type.id === +params['categoryId'])?.id;

        if (professionalType && params['categoryId'])
        {
          this.selectedCategory = professionalType.toString();

          this.filterSpecialties();

          if (params['specialty'])
          {
            this.selectedSpecialty = params['specialty'];
          }
        }
        this.getServicesFiltered();
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  getServicesFiltered() {

    this.updateUrlParams();

    this.servicesService.getServicesFiltered(this.selectedCategory, this.selectedSpecialty, this.searchTerm, this.selectedType, this.currentPage, this.itemsPerPage).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (services: any) => {
        this.services = services;
        this.hasMorePages = services.length === this.itemsPerPage;
        this.updatePageButtons();
      },
      error: (error: any) => {
        this.errorMessages = [error.message || "An error occurred while fetching services."];
      }
    });
  }

  updateUrlParams() {
    const queryParams: any = {};
    if (this.selectedCategory) queryParams.categoryId = this.selectedCategory;
    if (this.selectedSpecialty) queryParams.specialty = this.selectedSpecialty;
    if (this.selectedType) queryParams.type = this.selectedType;
    if (this.selectedOrder) queryParams.order = this.selectedOrder;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  getProfessionalTypes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.servicesService.getProfessionalTypes().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (professionalTypes: ProfessionalType[]) => {
          this.professionalTypes = professionalTypes;
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  getSpecialties(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.servicesService.getSpecialties().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (specialities: Specialty[]) => {
          this.specialties = specialities;
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  onSearchInput() {
    this.searchTerm = this.removeAccents(this.searchTerm.trim().toLowerCase());
    this.currentPage = 1;
    this.getServicesFiltered();
  }


  filterSpecialties(): void {
    const professionalType = this.professionalTypes.find(type => type.id === +this.selectedCategory);
    this.specialtiesFiltered = professionalType ? this.specialties.filter(specialty => specialty.professionalTypeId === professionalType.id) : [];
    this.selectedSpecialty = '0';
    this.updatePagination();
  }

  orderBy() {
    switch (this.selectedOrder) {
      case 'Rank':
        this.services.sort((a, b) => this.returnStars(b) - this.returnStars(a));
        break;
      case 'p<':
        this.services.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0));
        break;
      case 'p>':
        this.services.sort((a, b) => (b.pricePerHour || 0) - (a.pricePerHour || 0));
        break;
    }
    this.updatePagination();
  }

  removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  returnStars(service: Service): number {
    const reviewsForService = service.professional.reviews.filter(review => review.idService === service.serviceId);

    if (reviewsForService.length === 0) {
      return 0;
    }

    const sumStars = reviewsForService.reduce((sum, review) => sum + review.stars, 0);
    const averageStars = sumStars / reviewsForService.length;
    return parseFloat(averageStars.toFixed(1));
  }

  nextPage() {
    if (this.hasMorePages) {
      this.currentPage++;
      this.getServicesFiltered();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getServicesFiltered();
    }
  }

  get totalPages(): number {
    if (this.hasMorePages) {
      return this.currentPage = 1;
    }
    return this.currentPage;
  }

  updatePagination() {
    this.currentPage = 1;
    this.updatePageButtons();
  }

  updatePageButtons() {
    this.pageButtons = [this.currentPage];
    if (this.hasMorePages) {
      this.pageButtons.push(this.currentPage + 1);
    }
    if (this.currentPage > 1) {
      this.pageButtons.unshift(this.currentPage - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && (!this.hasMorePages && page <= this.currentPage) || (this.hasMorePages && page <= this.currentPage + 1)) {
      this.currentPage = page;
      this.getServicesFiltered();
    }
  }
}
