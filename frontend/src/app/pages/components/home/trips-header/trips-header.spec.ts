import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripsHeader } from './trips-header';

describe('TripsHeader', () => {
  let component: TripsHeader;
  let fixture: ComponentFixture<TripsHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripsHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripsHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

