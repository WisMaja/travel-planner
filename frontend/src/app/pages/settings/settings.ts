import { Component } from '@angular/core';
import { Button } from '../components/ui/buttons/button/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  imports: [Button],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
