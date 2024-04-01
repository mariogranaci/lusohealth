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

  onCompomentInit(): void {
    this.selected = new Date();
    this.dateChange.emit(this.selected);
  }

  onDateChange(date: Date): void {
    this.selected = date;
    this.dateChange.emit(this.selected);
  }
}
