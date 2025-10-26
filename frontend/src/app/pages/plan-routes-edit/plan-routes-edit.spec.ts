import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanRoutesEdit } from './plan-routes-edit';

describe('PlanRoutesEdit', () => {
  let component: PlanRoutesEdit;
  let fixture: ComponentFixture<PlanRoutesEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanRoutesEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanRoutesEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
