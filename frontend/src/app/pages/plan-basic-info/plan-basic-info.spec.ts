import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanBasicInfo } from './plan-basic-info';

describe('PlanBasicInfo', () => {
  let component: PlanBasicInfo;
  let fixture: ComponentFixture<PlanBasicInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanBasicInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanBasicInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
