import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { CommonModule } from '@angular/common';
import { Divider } from '../../pages/components/auth/divider/divider';
import { SignupForm } from '../../pages/components/auth/signup-form/signup-form';
import { PhotoSlide } from '../../pages/components/auth/photo-slide/photo-slide';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterModule, SharedImports, Divider, SignupForm, CommonModule, PhotoSlide],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {

}
