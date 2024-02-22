import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateProfileProfessionalComponent } from './private-profile-professional.component';

describe('PrivateProfileProfessionalComponent', () => {
  let component: PrivateProfileProfessionalComponent;
  let fixture: ComponentFixture<PrivateProfileProfessionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrivateProfileProfessionalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateProfileProfessionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
