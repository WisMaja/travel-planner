import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanBookingsEdit } from './plan-bookings-edit';

describe('PlanBookingsEdit', () => {
  let component: PlanBookingsEdit;
  let fixture: ComponentFixture<PlanBookingsEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanBookingsEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanBookingsEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
