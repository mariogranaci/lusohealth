import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../authentication/authentication.service';
import { ServicesService } from '../services.service';
import { PlatformLocation } from '@angular/common';
import { Subject, take } from 'rxjs';
import { User } from '../../shared/models/authentication/user';

@Component({
  selector: 'app-payment-failure',
  templateUrl: './payment-failure.component.html',
  styleUrl: './payment-failure.component.css'
})
export class PaymentFailureComponent {
  private unsubscribe$ = new Subject<void>();
  errorMessages: string[] = [];
  sessionId: string | null = null;
  loading: boolean = false;

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

  /**
   * Verifica a autenticidade.
   */
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

  /**
  * Obtém os detalhes da sessão.
  */
  getSessionDetails() {
    if (this.sessionId) {
      this.service.getSessionDetails(this.sessionId).subscribe({
        next: (data) => {
          console.log(data);
          this.cancelAppointment(data);
          /*if (data.paymentStatus == "paid") {
            
          }
          else {
            this.errorMessages.push("A consulta não se encontra paga.");
          }*/
        },
        error: (error) => {
          console.error("An error occurred:", error);
          this.errorMessages.push("Algo correu mal");
        }
      });
    }
  };

  /**
  * Cancela a consulta.
  */
  private cancelAppointment(data: any) {
    if (data && data.metadata.appointment_id) {
      this.service.cancelAppointment(parseInt(data.metadata.appointment_id)).subscribe({
        next: (response) => {
          console.log(response);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao cancelar a consulta:', error);
          this.errorMessages.push("Erro ao cancelar a consulta.");
        }
      });
    }
    else {
      this.errorMessages.push("Erro ao cancelar a consulta.");
    }
  }

}
