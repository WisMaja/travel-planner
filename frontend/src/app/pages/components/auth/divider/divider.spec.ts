import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Divider } from './divider';

describe('Divider', () => {
  let component: Divider;
  let fixture: ComponentFixture<Divider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Divider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Divider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
