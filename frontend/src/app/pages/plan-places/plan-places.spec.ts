import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanPlaces } from './plan-places';

describe('PlanPlaces', () => {
  let component: PlanPlaces;
  let fixture: ComponentFixture<PlanPlaces>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanPlaces]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanPlaces);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
