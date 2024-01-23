import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlterarPassComponent } from './alterar-pass.component';

describe('AlterarPassComponent', () => {
  let component: AlterarPassComponent;
  let fixture: ComponentFixture<AlterarPassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlterarPassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlterarPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
