import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile.service';
import { Subject, takeUntil } from 'rxjs';
import { Professional } from '../../shared/models/profile/professional';

@Component({
  selector: 'app-private-profile-professional',
  templateUrl: './private-profile-professional.component.html',
  styleUrl: './private-profile-professional.component.css'
})
export class PrivateProfileProfessionalComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();

  constructor(private profileService: ProfileService) { }


  getProfessionalInfo() {
    this.profileService.getProfessionalInfo().pipe(takeUntil(this.unsubscribe$)).subscribe(
      (userData: Professional) => {
        console.log(userData);
      },
      error => {
        console.log(error);
      }
    );
  }

  ngOnInit() {
    this.getProfessionalInfo();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  openPopup(opcao: string) {
    const overlay = document.getElementById('overlay');
    const add = document.getElementById('add-speciality-container');
    const edit = document.getElementById('edit-speciality-container');

    if (edit) {
      edit.style.display = "none";
    }
    if (add) {
      add.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      if (opcao == "add") {
        if (add) {
          add.style.display = "block";
        }
      }
      else if (opcao == "edit") {
        if (edit) {
          edit.style.display = "block";
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
