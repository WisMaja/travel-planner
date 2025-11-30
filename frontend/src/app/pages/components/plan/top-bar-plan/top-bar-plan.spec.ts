import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBarPlan } from './top-bar-plan';

describe('TopBarPlan', () => {
  let component: TopBarPlan;
  let fixture: ComponentFixture<TopBarPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBarPlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopBarPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
