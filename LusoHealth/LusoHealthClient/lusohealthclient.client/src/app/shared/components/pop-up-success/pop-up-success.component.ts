import { Component, Input } from '@angular/core';

@Component({
  selector: 'pop-up-success',
  templateUrl: './pop-up-success.component.html',
  styleUrl: './pop-up-success.component.css'
})
export class PopUpSuccessComponent {
  @Input() message: string | undefined;
  showAlert: boolean = true;
  

  closeAlert(): void {
    this.showAlert = false;
  }
}
