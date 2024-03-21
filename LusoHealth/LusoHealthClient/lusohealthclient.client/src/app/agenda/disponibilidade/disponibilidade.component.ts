import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { Availability } from '../../shared/models/services/availability';
import { Professional } from '../../shared/models/profile/professional';

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
    this.getSlots();
    this.geSpecialties();
  }

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
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      selectType: ['0', [Validators.required]],
      selectSpeciality: ['', [Validators.required]],
    });
  }

  dateClick(arg: DateClickArg): void { // Apply the type to 'arg'
    this.isSelecting = true;
    let calendarApi = arg.view.calendar;
    calendarApi.changeView('timeGridDay', arg.dateStr);

    setTimeout(() => {
      this.isSelecting = false;
    }, 300);
  }

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

  addAvailability() {
    this.submittedAddSlots = true;
    this.errorMessages = [];

    if (this.addSlotsForm.invalid) {
      this.submittedAddSlots = false;
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

  openPopup(option: string) {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-slots-container');
    const remove = document.getElementById('confirm-review-container');

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
