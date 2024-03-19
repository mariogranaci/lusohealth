import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CalendarOptions, EventInput, EventSourceInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Subject, take } from 'rxjs';
import { AuthenticationService } from '../../authentication/authentication.service';
import { User } from '../../shared/models/authentication/user';
import { ProfileService } from '../../profile/profile.service';
import { Router } from '@angular/router';

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
    private profileService: ProfileService,
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
    this.initializeForm();
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initializeForm() {

    this.addSlotsForm = this.formBuilder.group({
      /*selectSpeciality: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      presencial: ['', [Validators.required]],
      online: ['', [Validators.required]],
      domicilio: ['', [Validators.required]]*/
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
