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

  phrases: string[] = [
    "Poderá ver todos os reports efetuados no website.",
    "Poderá também filtrar os comentários da forma que pretende.",
    "Ao clicar nos 3 pontos será possivel rejeitar comentário, suspender conta, bloquear conta.",
  ];
  gifs: string[][] = [
    [],
    [],
    ["assets/images/Reports/points-gif.gif"],
  ];
  currentPhraseIndex: number = 0;
  currentPhrase: string = this.phrases[0];


  constructor(public moderationService: ModerationService, private location: Location) { }

  ngOnInit() {
    this.loadMoreReviews();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Carrega mais avaliações gerais.
   */
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

  /**
 * Carrega mais avaliações reportadas.
 */
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

  /**
 * Carrega mais avaliações excluídas.
 */
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

  /**
 * Carrega mais avaliações normais.
 */
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

  /**
   * Remove uma avaliação.
   * @param review A avaliação a ser removida.
   */
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

  /**
 * Suspende a conta de um paciente com base na revisão fornecida.
 * @param review A revisão que contém informações sobre o paciente a ser suspenso.
 */
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

  /**
 * Bloqueia a conta de um paciente com base na revisão fornecida.
 * @param review A revisão que contém informações sobre o paciente a ser bloqueado.
 */
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

  /**
   * Atualiza as avaliações exibidas com base no filtro selecionado.
   */
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

  /**
 * Este método chama os métodos apropriados para carregar mais avaliações, dependendo do estado selecionado.
 */
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

  /**
 * Converte uma string de data e hora em um formato de hora (HH:mm).
 * @param dateTimeString A string de data e hora a ser convertida.
 * @returns A string formatada no formato de hora (HH:mm).
 */
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

  /**
 * Converte uma string de data e hora em um formato de data.
 * A data é formatada como "Dia Mês Ano", por exemplo, "15 Janeiro 2022".
 * @param dateTimeString A string de data e hora a ser convertida.
 * @returns A string formatada no formato de data.
 */
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

  /**
  * Abre o popup de opções para uma avaliação específica.
  * @param review A avaliação para a qual as opções serão exibidas.
  */
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

  openPopupToolTip(opcao: string) {
    const overlay = document.getElementById('overlay');
    const remove = document.getElementById('remove-appointment-container');
    const accept = document.getElementById('accept-appointment-container');
    const tool = document.getElementById('tooltips');


    if (remove) {
      remove.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (opcao == "remove") {
        if (remove) {
          remove.style.display = "block";
        }
      }
      else if (opcao == "accept") {
        if (accept) {
          accept.style.display = "block";
        }
      }
      else if (opcao == "tool") {
        if (tool) {
          tool.style.display = "block";
        }
      }
    }
  }

  /**
   * Fecha o popup de opções.
   */
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

  nextPhrase() {
    this.currentPhraseIndex++;
    if (this.currentPhraseIndex < this.phrases.length) {
      this.currentPhrase = this.phrases[this.currentPhraseIndex];
    } else {
      this.currentPhraseIndex = 0;
      this.currentPhrase = this.phrases[this.currentPhraseIndex];
      this.closePopup();
    }
  }

  /**
   * Impede a propagação de eventos.
   * @param event O evento a ser manipulado.
   */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  /**
   * Retorna para a página anterior.
   */
  goBack() {
    this.location.back();
  }
}
