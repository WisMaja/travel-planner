import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleOauthButton } from './google-oauth-button';

describe('GoogleOauthButton', () => {
  let component: GoogleOauthButton;
  let fixture: ComponentFixture<GoogleOauthButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleOauthButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleOauthButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
