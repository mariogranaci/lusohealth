import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcarConsultaComponent } from './marcar-consulta.component';

describe('MarcarConsultaComponent', () => {
  let component: MarcarConsultaComponent;
  let fixture: ComponentFixture<MarcarConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarcarConsultaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarcarConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
