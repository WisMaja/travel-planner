import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanBookings } from './plan-bookings';

describe('PlanBookings', () => {
  let component: PlanBookings;
  let fixture: ComponentFixture<PlanBookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanBookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanBookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
