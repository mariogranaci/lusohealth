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
    this.loadMoreReports();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Carrega mais relatórios gerais.
   */
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

  /**
   * Carrega mais relatórios concluídos.
   */
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

  /**
  * Carrega mais relatórios cancelados.
  */
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

  /**
   * Carrega mais relatórios pendentes.
   */
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

  /**
  * Cancela um relatório.
  * @param report O relatório a ser cancelado.
  */
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

  /**
   * Suspende uma conta profissional.
   * @param report O relatório relacionado à conta profissional a ser suspensa.
   */
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

  /**
  * Bloqueia uma conta profissional.
  * @param report O relatório relacionado à conta profissional a ser bloqueada.
  */
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

  /**
   * Atualiza os relatórios exibidos com base no estado selecionado.
   */
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

  /**
   * Adiciona mais relatórios exibidos com base no estado selecionado.
   */
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

  /**
  * Converte uma string de data e hora em apenas hora.
  * @param dateTimeString A string de data e hora a ser convertida.
  * @returns A hora formatada.
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
   * Converte uma string de data e hora em apenas data.
   * @param dateTimeString A string de data e hora a ser convertida.
   * @returns A data formatada.
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
   * Abre o popup de opções para um relatório específico.
   * @param report O relatório para o qual as opções serão exibidas.
   */
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
    const tool = document.getElementById('tooltips');

    if (overlay) {
      overlay.style.display = 'none';
      if (options) {
        options.style.display = "none";
      }
      if (tool) {
        tool.style.display = "none";
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
   * @param event O evento a ser tratado.
   */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  /**
  * Retorna à página anterior.
  */
  goBack() {
    this.location.back();
  }

}
