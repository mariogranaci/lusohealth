import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ModerationService } from '../moderation.service';
import { reportModel } from '../../shared/models/administration/reportModel';
import { Location } from '@angular/common';

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

  private offsetGeneral: number = 0;
  private offsetConcluded: number = 0;
  private offsetCanceled: number = 0;
  private offsetPending: number = 0;

  limit: number = 5;

  hide = false;

  currentReport: any;

  constructor(public moderationService: ModerationService, private location: Location) { }

  ngOnInit() {
    this.loadMoreReports();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadMoreReports() {
    this.moderationService.getReports(this.offsetGeneral, this.limit).subscribe({
      next: (newReports: reportModel[]) => {
        this.reports = this.reports.concat(newReports);
        this.offsetGeneral += newReports.length;
        if (newReports.length < this.limit) { this.hide = true; }
      },
      error: (error) => {
        this.hide = true;
        console.error(error);
      }
    });
  }

  loadMoreReportsConcluded() {
    this.moderationService.getReportsConcluded(this.offsetConcluded, this.limit).subscribe({
      next: (newReports: reportModel[]) => {
        this.reports = this.reports.concat(newReports);
        this.offsetConcluded += newReports.length;
        if (newReports.length < this.limit) { this.hide = true; }
      },
      error: (error) => {
        this.hide = true;
        console.error(error);
      }
    });
  }

  loadMoreReportsCanceled() {
    this.moderationService.getReportsCanceled(this.offsetCanceled, this.limit).subscribe({
      next: (newReports: reportModel[]) => {
        this.reports = this.reports.concat(newReports);
        this.offsetCanceled += newReports.length;
        if (newReports.length < this.limit) { this.hide = true; }
      },
      error: (error) => {
        this.hide = true;
        console.error(error);
      }
    });
  }

  loadMoreReportsPending() {
    this.moderationService.getReportsPending(this.offsetCanceled, this.limit).subscribe({
      next: (newReports: reportModel[]) => {
        this.reports = this.reports.concat(newReports);
        this.offsetPending += newReports.length;
        if (newReports.length < this.limit) { this.hide = true; }
      },
      error: (error) => {
        this.hide = true;
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

  updateDisplayedReports() {
    const value = document.getElementById("state") as HTMLSelectElement | null;

    this.reports = [];
    this.hide = false;

    if (value)
    {
      switch (value.value) {
        case '0':
          this.offsetGeneral = 0;
          this.loadMoreReports();
          break;
        case '1':
          this.offsetConcluded = 0;
          this.loadMoreReportsConcluded();
          break;
        case '2':
          this.offsetCanceled = 0;
          this.loadMoreReportsCanceled();
          break;
        case '3':
          this.offsetCanceled = 0;
          this.loadMoreReportsPending();
          break;
        default:
          break;
      }
    }
  }

  addDisplayedReports() {
    const value = document.getElementById("state") as HTMLSelectElement | null;

    if (value) {
      switch (value.value) {
        case '0':
          this.loadMoreReports();
          break;
        case '1':
          this.loadMoreReportsConcluded();
          break;
        case '2':
          this.loadMoreReportsCanceled();
          break;
        case '3':
          this.loadMoreReportsPending();
          break;
        default:
          break;
      }
    }
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

  openPopup(report: reportModel) {
    const overlay = document.getElementById('overlay');
    const options = document.getElementById('options');

    this.currentReport = report;

    if (options) {
      options.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (options) {
        options.style.display = "block";
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

  goBack() {
    this.location.back();
  }
}
