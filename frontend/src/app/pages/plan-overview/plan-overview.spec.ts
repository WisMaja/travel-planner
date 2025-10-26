import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanOverview } from './plan-overview';

describe('PlanOverview', () => {
  let component: PlanOverview;
  let fixture: ComponentFixture<PlanOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
