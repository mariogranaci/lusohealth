import { Component, Input } from '@angular/core';
import { AuthenticationService } from '../../../../authentication/authentication.service';

@Component({
  selector: 'app-validation-messages',
  templateUrl: './validation-messages.component.html',
  styleUrl: './validation-messages.component.css'
})
export class ValidationMessagesComponent {
  @Input() errorMessages: string[] | undefined;
  @Input() email: string | undefined;
  showAlert: boolean = true;

  constructor(private authService: AuthenticationService) { }

  closeAlert(): void {
    this.showAlert = false;
  }

  resendEmailConfirmationLink(): void {
    if (this.email) {
      this.authService.resendEmailConfirmationLink(this.email).subscribe({
        next: (response: any) => {
          this.showAlert = false;
        },
        error: (error) => {
          this.errorMessages = [];
          this.errorMessages.push(error.error);
        }

      });

    }
  }
}
