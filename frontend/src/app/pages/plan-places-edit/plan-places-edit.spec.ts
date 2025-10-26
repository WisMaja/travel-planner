import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanPlacesEdit } from './plan-places-edit';

describe('PlanPlacesEdit', () => {
  let component: PlanPlacesEdit;
  let fixture: ComponentFixture<PlanPlacesEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanPlacesEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanPlacesEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
