import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { TripView } from './trip-view';

describe('TripView', () => {
  let component: TripView;
  let fixture: ComponentFixture<TripView>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TripView],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripView);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

