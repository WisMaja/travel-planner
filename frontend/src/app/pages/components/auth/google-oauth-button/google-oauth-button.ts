import { Component, Input } from '@angular/core';
import { Button } from '../../ui/buttons/button/button';

@Component({
  selector: 'app-google-oauth-button',
  standalone: true,
  imports: [Button],
  templateUrl: './google-oauth-button.html',
  styleUrl: './google-oauth-button.scss',
})
export class GoogleOauthButton {
  @Input() label: string = 'Login with Google';
}
