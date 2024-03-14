import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaProfissionalComponent } from './agenda-profissional.component';

describe('AgendaProfissionalComponent', () => {
  let component: AgendaProfissionalComponent;
  let fixture: ComponentFixture<AgendaProfissionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgendaProfissionalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgendaProfissionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
