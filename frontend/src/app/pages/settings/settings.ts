import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../components/ui/buttons/button/button';
import { AuthService, UserInfo } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  imports: [Button, CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  userInfo: UserInfo | null = null;
  isLoading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    this.isLoading = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userInfo = user;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user info:', error);
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
