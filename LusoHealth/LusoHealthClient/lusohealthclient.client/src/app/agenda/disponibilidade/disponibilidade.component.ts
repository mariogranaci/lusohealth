import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarOptions, EventInput, EventSourceInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Subject, take } from 'rxjs';
import { AuthenticationService } from '../../authentication/authentication.service';
import { User } from '../../shared/models/authentication/user';
import { ProfileService } from '../../profile/profile.service';
import { Router } from '@angular/router';
import { AgendaService } from '../agenda.service';
import { Availability } from '../../shared/models/services/availability';

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

  calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, dayGridPlugin],
    initialView: 'dayGridMonth',
    locale: 'pt',
    selectable: true,
    select: this.handleDateSelect.bind(this),
    events: this.currentEvents, // Eventos vinculados diretamente aqui
    dateClick: this.dateClick.bind(this),
    //events: [{ start: '2024-03-10', end: '2024-03-10', rendering: 'background', backgroundColor: '#ff9f89' },
    //         { start: '2024-03-15', end: '2024-03-15', rendering: 'background', backgroundColor: '#ff9f89' },
    //         { start: '2024-03-20', end: '2024-03-20', rendering: 'background', backgroundColor: '#ff9f89' }]

  }

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

  ngOnInit(): void {
    this.initializeForm();
    this.addAvailability();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initializeForm() {

    this.addSlotsForm = this.formBuilder.group({
      selectDuration: ['10', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      selectType: ['Presencial', [Validators.required]],
      selectSpeciality: ['', [Validators.required]],
    });
  }

  dateClick(info: any) {
    console.log('click', info);
    //info.dayEl.style.backgroundColor = '#dd4144';
  }

  handleDateSelect(selectInfo: any) {
    let calendarApi = selectInfo.view.calendar;
    console.log('select', selectInfo);
    /*calendarApi.unselect(); // Limpar seleção anterior*/
  }

  addAvailability() {
    this.submittedAddSlots = true;
    this.errorMessages = [];

    /*if (this.addSlotsForm.invalid) {
      return;
    }*/

    let start = new Date();
    start.setHours(23, 0, 0, 0);

    let end = new Date();
    end.setHours(1, 0, 0, 0);

    let availability = new Availability(
      new Date('2024-03-21'),   // startDate
      new Date('2024-03-22'),   // endDate
      start, // startTime
      end, // endTime
      3,    // serviceId
      30,     // slotDuration
      'Online', // type
      null       // id
    );

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

  deleteAvailability() {
    this.submittedDeleteSlots = true;
    this.errorMessages = [];

    /*if (this.addSlotsForm.invalid) {
      return;
    }*/

    let availability = new Availability(
      new Date('2024-03-21'),   // startDate
      new Date('2024-03-22'),   // endDate
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

  }

  openPopup() {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-speciality-container');

    if (add) {
      add.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (add) {
        add.style.display = "block";
      }
    }
  }

  closePopup() {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-speciality-container');
    const edit = document.getElementById('edit-speciality-container');

    if (overlay) {
      overlay.style.display = 'none';
      if (edit) {
        edit.style.display = "none";
      }
      if (add) {
        add.style.display = "none";
      }
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
