import { Component, Output, EventEmitter } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { outputAst } from '@angular/compiler';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatCardModule, MatDatepickerModule],
})
export class CalendarioComponent {
  selected: Date | null = null;

  @Output() dateChange: EventEmitter<Date> = new EventEmitter<Date>();

  ngOnInit(): void {
     this.onCompomentInit();
  }

 /**
 * Inicializa o componente e emite o evento dateChange com a data selecionada.
 */
  onCompomentInit(): void {
    this.selected = new Date();
    this.dateChange.emit(this.selected);
  }

 /**
 * Manipula o evento de mudança de data e emite o evento dateChange com a nova data selecionada.
 * @param date A nova data selecionada.
 */
  onDateChange(date: Date): void {
    this.selected = date;
    this.dateChange.emit(this.selected);
  }
}
