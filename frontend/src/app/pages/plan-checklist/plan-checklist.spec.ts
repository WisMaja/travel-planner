import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanChecklist } from './plan-checklist';

describe('PlanChecklist', () => {
  let component: PlanChecklist;
  let fixture: ComponentFixture<PlanChecklist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanChecklist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanChecklist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
