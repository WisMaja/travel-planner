import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanBasicInfoEdit } from './plan-basic-info-edit';

describe('PlanBasicInfoEdit', () => {
  let component: PlanBasicInfoEdit;
  let fixture: ComponentFixture<PlanBasicInfoEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanBasicInfoEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanBasicInfoEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
