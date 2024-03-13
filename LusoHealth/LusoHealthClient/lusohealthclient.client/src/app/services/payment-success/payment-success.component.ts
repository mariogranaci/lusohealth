import { Component } from '@angular/core';
import { AuthenticationService } from '../../authentication/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../services.service';
import { Subject, take } from 'rxjs';
import { User } from '../../shared/models/authentication/user';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  sessionId: string | null = null;
  loading = false;

  constructor(private authenticationService: AuthenticationService,
    private router: Router,
    private activateRoute: ActivatedRoute, private service: ServicesService,
    private platformLocation: PlatformLocation) {
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      history.pushState(null, '', location.href);
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.verifyAuthenticity().then(() => {
      this.getSessionDetails();
    })
      .catch((error) => {
        this.router.navigateByUrl('/error');
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  verifyAuthenticity(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.authenticationService.user$.pipe(take(1)).subscribe({
        next: (user: User | null) => {
          if (!user) {
            reject();
          } else {
            this.activateRoute.queryParamMap.subscribe({
              next: (params: any) => {
                this.sessionId = params.get('session_id');
                if (this.sessionId) {
                  resolve();
                }
                else {
                  reject();
                }
              }
            });
          }
        }
      });
    });
  }

  getSessionDetails() {
    if (this.sessionId) {
      this.service.getSessionDetails(this.sessionId).subscribe({
        next: (data) => {
          console.log(data);
          if (data.paymentStatus == "paid") {
            this.changeAppointmentStatus(data);
          }
          else {
            this.errorMessages.push("A consulta não se encontra paga.");
          }
        },
        error: (error) => {
          console.error("An error occurred:", error);
          // Handle the error here, such as displaying an error message to the user
        }
      });
    }
  };

  private changeAppointmentStatus(data: any) {
    if (data && data.metadata.appointment_id && data.paymentIntentId) {
      this.service.updateAppointmentState(parseInt(data.metadata.appointment_id), data.paymentIntentId).subscribe({
        next: (response) => {
          console.log(response);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao alterar a consulta para paga:', error);
          this.errorMessages.push("Erro ao alterar a consulta para paga.");
        }
      });
    }
    else {
      this.errorMessages.push("Erro ao alterar a consulta para paga.");
    }

  }
}
