import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { SigninForm } from '../../pages/components/auth/signin-form/signin-form';
import { Divider } from '../../pages/components/auth/divider/divider';
import {PhotoSlide} from '../../pages/components/auth/photo-slide/photo-slide';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [RouterModule, SharedImports, SigninForm, Divider, PhotoSlide],
  templateUrl: './signin.html',
  styleUrl: './signin.scss',
})
export class Signin implements OnInit {
  constructor(private tokenStorage: TokenStorageService) {}

  ngOnInit(): void {
    // Wyloguj użytkownika i usuń tokeny przy wejściu na stronę logowania
    if (this.tokenStorage.hasTokens()) {
      this.tokenStorage.clearTokens();
    }
  }
}
