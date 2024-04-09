import { Review } from '../../shared/models/administration/review';
import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ModerationService } from '../moderation.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-moderation',
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.css'
})
export class ModerationComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  responseText: string = "";

  reviews: Review[] = [];

  private offsetGeneral: number = 0;
  private offsetReported: number = 0;
  private offsetDeleted: number = 0;
  private offsetNormal: number = 0;

  limit: number = 5;

  hide = false;

  currentReview: any;

  constructor(public moderationService: ModerationService, private location: Location) { }

  ngOnInit() {
    this.loadMoreReviews();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadMoreReviews() {
    this.moderationService.getReviews(this.offsetGeneral, this.limit).subscribe({
      next: (newReviews: Review[]) => {
        this.reviews = this.reviews.concat(newReviews);
        this.offsetGeneral += newReviews.length;
        if (newReviews.length < this.limit) { this.hide = true; }
      },
      error: (error) => {
        this.hide = true;
        console.error(error);
      }
    });
  }

  loadMoreReviewsReported() {
    this.moderationService.getReviewsReported(this.offsetReported, this.limit).subscribe({
      next: (newReviews: Review[]) => {
        this.reviews = this.reviews.concat(newReviews);
        this.offsetReported += newReviews.length;
        if (newReviews.length < this.limit) { this.hide = true; }
      },
      error: (error) => {
        this.hide = true;
        console.error(error);
      }
    });
  }

  loadMoreReviewsDeleted() {
    this.moderationService.getReviewsDeleted(this.offsetDeleted, this.limit).subscribe({
      next: (newReviews: Review[]) => {
        this.reviews = this.reviews.concat(newReviews);
        this.offsetDeleted += newReviews.length;
        if (newReviews.length < this.limit) { this.hide = true; }
      },
      error: (error) => {
        this.hide = true;
        console.error(error);
      }
    });
  }

  loadMoreReviewsNormal() {
    this.moderationService.getReviewsNormal(this.offsetNormal, this.limit).subscribe({
      next: (newReviews: Review[]) => {
        this.reviews = this.reviews.concat(newReviews);
        this.offsetNormal += newReviews.length;
        if (newReviews.length < this.limit) { this.hide = true; }
      },
      error: (error) => {
        this.hide = true;
        console.error(error);
      }
    });
  }

  deleteReview(review: Review) {
    this.moderationService.deleteReview(review).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.updateDisplayedReviews();
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

  suspendAccount(review: Review) {
    this.moderationService.suspendAccountPatient(review).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.updateDisplayedReviews();
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

  blockAccount(review: Review) {
    this.moderationService.blockAccountPatient(review).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.updateDisplayedReviews();
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

  updateDisplayedReviews() {
    const value = document.getElementById("state") as HTMLSelectElement | null;

    this.reviews = [];
    this.hide = false;

    if (value) {
      switch (value.value) {
        case '0':
          this.offsetGeneral = 0;
          this.loadMoreReviews();
          break;
        case '1':
          this.offsetNormal = 0;
          this.loadMoreReviewsNormal();
          break;
        case '2':
          this.offsetReported = 0;
          this.loadMoreReviewsReported();
          break;
        case '3':
          this.offsetDeleted = 0;
          this.loadMoreReviewsDeleted();
          break;
        default:
          break;
      }
    }
  }

  addDisplayedReviews() {
    const value = document.getElementById("state") as HTMLSelectElement | null;

    if (value) {
      switch (value.value) {
        case '0':
          this.loadMoreReviews();
          break;
        case '1':
          this.loadMoreReviewsNormal();
          break;
        case '2':
          this.loadMoreReviewsReported();
          break;
        case '3':
          this.loadMoreReviewsDeleted();
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

  openPopup(review: Review) {
    const overlay = document.getElementById('overlay');
    const options = document.getElementById('options');

    this.currentReview = review;

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
