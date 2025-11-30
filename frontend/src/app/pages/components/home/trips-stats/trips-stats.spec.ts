import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripsStats } from './trips-stats';

describe('TripsStats', () => {
  let component: TripsStats;
  let fixture: ComponentFixture<TripsStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripsStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripsStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

