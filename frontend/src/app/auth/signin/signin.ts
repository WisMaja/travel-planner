import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { SigninForm } from '../../pages/components/auth/signin-form/signin-form';
import { Divider } from '../../pages/components/auth/divider/divider';
import {PhotoSlide} from '../../pages/components/auth/photo-slide/photo-slide';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [RouterModule, SharedImports, SigninForm, Divider, PhotoSlide],
  templateUrl: './signin.html',
  styleUrl: './signin.scss',
})
export class Signin {
  // Guard loginGuard automatycznie przekieruje zalogowanych użytkowników do /home
}
