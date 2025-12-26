import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianDetailComponent } from './technician-detail.component';

describe('TechnicianDetailComponent', () => {
  let component: TechnicianDetailComponent;
  let fixture: ComponentFixture<TechnicianDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicianDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
