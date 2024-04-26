import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CalendarOptions, EventInput, EventSourceInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../authentication/authentication.service';
import { User } from '../../shared/models/authentication/user';
import { ProfileService } from '../../profile/profile.service';
import { Router } from '@angular/router';
import { AgendaService } from '../agenda.service';
import { Availability } from '../../shared/models/servic/availability';
import { Professional } from '../../shared/models/profile/professional';

/**
 * Componente Angular responsável pela gestão da disponibilidade de um profissional.
 * Permite adicionar e excluir horários de disponibilidade, visualizar eventos no calendário e interagir com eles.
 */
@Component({
  selector: 'app-disponibilidade',
  templateUrl: './disponibilidade.component.html',
  styleUrl: './disponibilidade.component.css'
})
export class DisponibilidadeComponent {
  private unsubscribe$ = new Subject<void>();
  currentEvents: EventInput[] = [];
  errorMessages: string[] = [];
  addSlotsForm: FormGroup = new FormGroup({});
  submittedAddSlots = false;
  submittedDeleteSlots = false;
  selectedDates: any;
  isSelecting: boolean = false;
  services: any;
  formValues: any;
  today = new Date().toISOString().split('T')[0];
  todayDate = new Date();

  phrases: string[] = [
    "Para adicionar a sua disponibilidade, clique no botão com o sinal de mais e preencha os campos.",
    "Para remover a sua disponibilidade, basta selecionar no calendário os dias que pretende apagar."
  ];
  gifs: string[][] = [
    ["assets/images/Agenda/add-gif.gif"], 
    ["caminho-para-gif2-1.gif"], 
  ];
  currentPhraseIndex: number = 0;
  currentPhrase: string = this.phrases[0];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridDay'
    },
    locale: 'pt',
    selectable: true,
    select: this.handleDateSelect.bind(this),
    dateClick: this.dateClick.bind(this),
    events: [],
    eventDidMount: this.hideEventsInMonthView.bind(this),
  }

  /**
   * Construtor do componente DisponibilidadeComponent.
   * @param authenticationService Serviço de autenticação para verificar o usuário logado.
   * @param profileService Serviço de perfil para obter informações do profissional.
   * @param agendaService Serviço de agenda para manipular horários de disponibilidade.
   * @param formBuilder Construtor de formulários para criar o formulário de adição de horários.
   * @param router Roteador para navegar entre as páginas.
   */
  constructor(private authenticationService: AuthenticationService,
    private profileService: ProfileService, private agendaService: AgendaService,
    private formBuilder: FormBuilder, private router: Router) {
    this.authenticationService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (!user) {
          this.router.navigateByUrl('/');
        }
        else {
          const decodedToken = this.profileService.getDecodedToken();

          if (decodedToken) {
            if (decodedToken.role !== "Professional") {
              this.router.navigateByUrl('/');
            }
          }
        }
      }
    });
  }

  /**
   * Método de inicialização do componente, chamado após a criação do componente.
   * Inicializa o formulário e obtém os slots de disponibilidade.
   */
  ngOnInit(): void {
    this.initializeForm();
    this.getSlots();
    this.geSpecialties();
  }

  /**
   * Método de destruição do componente, chamado antes da destruição do componente.
   * Desinscreve observables para evitar vazamentos de memória.
   */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  hideEventsInMonthView(arg: { view: { type: string; }; el: { style: { display: string; }; }; }) {
    if (arg.view.type === 'dayGridMonth') {
      arg.el.style.display = 'none';
    }
  }

  initializeForm() {
    this.addSlotsForm = this.formBuilder.group({
      selectDuration: ['10', [Validators.required]],
      startDate: ['', [Validators.required, this.minDateValidator()]],
      endDate: ['', [Validators.required, this.minDateValidator()]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      selectType: ['0', [Validators.required]],
      selectSpeciality: ['', [Validators.required]],
    });
    this.formValues = this.addSlotsForm.value;
  }

  minDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // if no date is entered, return null (consider whether you want to handle it as optional)
      }

      const minDate = new Date(); // Subtract one day
      minDate.setHours(0, 0, 0, 0); // Set the time to midnight

      // Parse the input date and also reset the time to midnight to only compare dates
      const inputDate = new Date(control.value);
      inputDate.setHours(0, 0, 0, 0);

      // Check if the input date is not before the minimum date
      return inputDate >= minDate ? null : { 'minDate': { value: control.value } };
    };
  }

  /**
 * Método que manipula o clique em uma data no calendário.
 * @param arg Objeto contendo informações sobre o clique na data.
 */
  dateClick(arg: DateClickArg): void { // Apply the type to 'arg'
    this.isSelecting = true;
    let calendarApi = arg.view.calendar;
    calendarApi.changeView('timeGridDay', arg.dateStr);

    setTimeout(() => {
      this.isSelecting = false;
    }, 300);
  }

  /**
 * Manipula a seleção de data no calendário.
 * @param selectInfo Informações sobre a seleção de data.
 */
  handleDateSelect(selectInfo: any) {
    setTimeout(() => {
      if (!this.isSelecting) {
        let calendarApi = selectInfo.view.calendar;
        this.selectedDates = selectInfo;
        console.log(this.selectedDates);
        this.openPopup('remove');
        calendarApi.unselect();
      }
      else {
        return;
      }
    }, 200);
  }

  /**
 * Obtém as especialidades do profissional.
 * @returns Uma Promise resolvida quando as especialidades são obtidas com sucesso.
 */
  geSpecialties(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.profileService.getProfessionalInfo().pipe(takeUntil(this.unsubscribe$)).subscribe(
        (userData: Professional) => {
          this.services = userData.services;
          console.log(this.services);
          resolve();
        },
        error => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
          reject(error);
        }
      );
    });
  }


  /**
 * Obtém os slots de disponibilidade do profissional.
 */
  getSlots() {

    var slots;

    this.agendaService.getAllSlots().pipe().subscribe({
      next: (response: any) => {
        this.submittedAddSlots = false;

        this.calendarOptions.events = response;
        console.log(this.calendarOptions.events);

        //this.addSlotsForm.reset();
      },
      error: (error) => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
        this.submittedAddSlots = false;
      }
    });
  }

  /**
 * Adiciona um novo horário de disponibilidade.
 */
  addAvailability() {
    this.submittedAddSlots = true;
    this.errorMessages = [];

    if (this.addSlotsForm.invalid) {
      return;
    }

    /*let start = new Date();
    start.setHours(8, 0, 0, 0);

    let end = new Date();
    end.setHours(12, 0, 0, 0);

    let availability = new Availability(
      new Date('2024-03-21'),   // startDate
      new Date('2024-03-22'),   // endDate
      start, // startTime
      end, // endTime
      2,    // serviceId
      30,     // slotDuration
      'Online', // type
      null       // id
    );*/

    const form = this.addSlotsForm.value;
    
    let start = new Date();
    const [startHours, startMinutes] = form.startTime.split(':');
    start.setHours(startHours, startMinutes, 0, 0);

    let end = new Date();
    const [endHours, endMinutes] = form.endTime.split(':');
    end.setHours(endHours, endMinutes, 0, 0);

    let availability = new Availability(
      form.startDate,   // startDate
      form.endDate,   // endDate
      start, // startTime
      end, // endTime
      form.selectSpeciality,    // serviceId
      form.selectDuration,     // slotDuration
      this.getType(form.selectType), // type
      null       // id
    );
    console.log(availability);
    
    /*endDate: this.addSlotsForm.controls.endDate.value,
    startTime: this.addSlotsForm.controls.startTime.value,
    endTime: this.addSlotsForm.controls.endTime.value,
    type: this.addSlotsForm.controls.selectType.value,
    speciality: this.addSlotsForm.controls.selectSpeciality.value*/
    console.log(availability);
    this.agendaService.addAvailability(availability).subscribe({
      next: () => {
        this.submittedAddSlots = false;
        this.closePopup();
        this.getSlots();
        this.addSlotsForm.reset();
        this.addSlotsForm.setValue(this.formValues);
      },
      error: (error) => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
        this.submittedAddSlots = false;
      }
    });
  }

  resetAddAailabilityForm() {
    this.closePopup();
    this.addSlotsForm.reset();
    this.addSlotsForm.setValue(this.formValues);
  }

  /**
 * Retorna o tipo de disponibilidade com base no código.
 * @param type O código do tipo de disponibilidade.
 * @returns O tipo de disponibilidade correspondente.
 */
  private getType(type: string) {
    switch (type) {
      case "0":
        return "Presential";
      case "1":
        return "Online";
      default:
        return "Home";
    }
  }

  /**
 * Exclui um horário de disponibilidade.
 */
  deleteAvailability() {
    this.submittedDeleteSlots = true;
    this.errorMessages = [];

    /*if (this.addSlotsForm.invalid) {
      return;
    }*/

    let availability = new Availability(
      this.selectedDates.start,   // startDate
      this.selectedDates.end,   // endDate
      null, // startTime
      null, // endTime
      null,    // serviceId
      null,     // slotDuration
      null, // type
      null       // id
    );

    this.agendaService.deleteAvailability(availability).subscribe({
      next: () => {
        this.submittedDeleteSlots = false;
        this.closePopup();
        this.getSlots();
        //this.addSlotsForm.reset();
      },
      error: (error) => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
        this.submittedDeleteSlots = false;
      }
    });
    this.selectedDates = null;
  }

  /**
 * Abre o popup especificado.
 * @param option A opção do popup a ser aberto.
 */
  openPopup(option: string) {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-slots-container');
    const remove = document.getElementById('confirm-review-container');
    const tool = document.getElementById('tooltips'); 

    if (add) {
      add.style.display = "none";
    }
    if (remove) {
      remove.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (option == "add") {
        if (add) {
          add.style.display = "block";
        }
      }
      if (option == "remove") {
        if (remove) {
          remove.style.display = "block";
        }
      }
      if (option == "tool") {
        if (tool) {
          tool.style.display = "block";
        }
      }
    }
  }

  /**
 * Fecha o popup.
 */
  closePopup() {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-speciality-container');
    const edit = document.getElementById('edit-speciality-container');
    const tool = document.getElementById('tooltips'); 

    if (overlay) {
      overlay.style.display = 'none';
      if (edit) {
        edit.style.display = "none";
      }
      if (add) {
        add.style.display = "none";
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
 * Impede a propagação do evento.
 * @param event O evento a ser interrompido.
 */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
