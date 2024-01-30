import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-validation-messages',
  templateUrl: './validation-messages.component.html',
  styleUrl: './validation-messages.component.css'
})
export class ValidationMessagesComponent {
  @Input() errorMessages: string[] | undefined;
  showAlert: boolean = true;

  closeAlert(): void {
    this.showAlert = false;
  }
}
