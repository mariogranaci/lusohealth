import { Component } from '@angular/core';
import { CalendarOptions, EventInput, EventSourceInput } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-disponibilidade',
  templateUrl: './disponibilidade.component.html',
  styleUrl: './disponibilidade.component.css'
})
export class DisponibilidadeComponent {
  currentEvents: EventInput[] = [];

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

  dateClick(info: any) {
    console.log('click', info);
    //info.dayEl.style.backgroundColor = '#dd4144';
  }

  handleDateSelect(selectInfo: any) {
    let calendarApi = selectInfo.view.calendar;
    console.log('select', selectInfo);
    /*calendarApi.unselect(); // Limpar seleção anterior*/
  }
}
