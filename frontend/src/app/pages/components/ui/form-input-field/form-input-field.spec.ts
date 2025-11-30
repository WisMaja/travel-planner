import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputField } from './form-input-field';

describe('FormInputField', () => {
  let component: FormInputField;
  let fixture: ComponentFixture<FormInputField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputField]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInputField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
