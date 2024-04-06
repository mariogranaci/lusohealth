import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ModerationService } from '../moderation.service';
import { reportModel } from '../../shared/models/administration/reportModel';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {

  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  responseText: string = "";

  reports: reportModel[] = [];

  constructor(public moderationService: ModerationService) { }

  ngOnInit() {
    this.loadMoreReports();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadMoreReports() {
    const offset = this.reports.length; 
    const limit = 3; 

    this.moderationService.getReports(offset, limit).subscribe({
      next: (newReports: reportModel[]) => {
        this.reports = this.reports.concat(newReports);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  loadMoreReportsCanceled() {
    const offset = this.reports.length;
    const limit = 3;

    this.moderationService.getReports(offset, limit).subscribe({
      next: (newReports: reportModel[]) => {
        this.reports = this.reports.concat(newReports);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  loadMoreReportsConcluded() {
    const offset = this.reports.length;
    const limit = 3;

    this.moderationService.getReports(offset, limit).subscribe({
      next: (newReports: reportModel[]) => {
        this.reports = this.reports.concat(newReports);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cancelReport(report: reportModel) {
    this.moderationService.cancelReport(report).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.updateDisplayedReports();
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

  suspendAccount(report: reportModel) {
    this.moderationService.suspendAccountProfessional(report).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.updateDisplayedReports();
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

  blockAccount(report: reportModel) {
    this.moderationService.blockAccountProfessional(report).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.updateDisplayedReports();
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

  convertToHours(dateTimeString: Date | null): string {
    if (!dateTimeString) {
      return "";
    }

    let dateTime: Date = new Date(dateTimeString);

    let hours: number = dateTime.getHours();
    let formattedHours: string = hours < 10 ? '0' + hours : hours.toString();

    let min: number = dateTime.getMinutes();
    let formattedMinutes: string = min < 10 ? '0' + min : min.toString();

    return formattedHours + ":" + formattedMinutes;
  }


  convertToDate(dateTimeString: Date | null): string {
    if (!dateTimeString) {
      return ""; 
    }

    const monthsInPortuguese: string[] = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    let dateTime: Date = new Date(dateTimeString);

    let day: number = dateTime.getDate();
    let month: number = dateTime.getMonth();
    let year: number = dateTime.getFullYear();

    let formattedDate: string = `${day} ${monthsInPortuguese[month]} ${year}`;

    return formattedDate;
  }

  openPopup(opcao: string) {
    const overlay = document.getElementById('overlay');
    const options = document.getElementById('options');

    if (options) {
      options.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (opcao == "options") {
        if (options) {
          options.style.display = "block";
        }
      }
    }
  }

  closePopup() {
    const overlay = document.getElementById('overlay');
    const options = document.getElementById('options');

    if (overlay) {
      overlay.style.display = 'none';
      if (options) {
        options.style.display = "none";
      }
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  updateDisplayedReports() {
    this.loadMoreReports();
  }
}
