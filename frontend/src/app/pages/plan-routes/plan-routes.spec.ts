import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanRoutes } from './plan-routes';

describe('PlanRoutes', () => {
  let component: PlanRoutes;
  let fixture: ComponentFixture<PlanRoutes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanRoutes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanRoutes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
