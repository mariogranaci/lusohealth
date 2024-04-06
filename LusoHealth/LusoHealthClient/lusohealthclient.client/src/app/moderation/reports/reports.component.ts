import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ModerationService } from '../moderation.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {

  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  responseText: string = "";

  reports: Report[] = [];
  displayedReports: Report[] = [];

  initialReportCount = 3;

  constructor(public moderationService: ModerationService) { }

  ngOnInit() {
    this.getReports();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getReports() {
    this.moderationService.getReports().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (reports: Report[]) => {
        this.reports = reports;
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

  cancelReport(report: Report) {
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

  suspendAccount(report: Report) {
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

  blockAccount(report: Report) {
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

  loadMoreAppointments() {
    this.initialReportCount += 3;
    this.updateDisplayedReports();
  }

  updateDisplayedReports() {
    this.displayedReports = this.reports.slice(0, this.initialReportCount);
  }
}
