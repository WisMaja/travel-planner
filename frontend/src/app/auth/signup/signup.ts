import { Component } from '@angular/core';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { CommonModule } from '@angular/common';
import { Divider } from '../../pages/components/divider/divider';
import { SignupForm } from '../../pages/components/signup-form/signup-form';
import { PhotoSlide } from '../../pages/components/photo-slide/photo-slide';

@Component({
  selector: 'app-signup',
  imports: [SharedImports, Divider, SignupForm, CommonModule, PhotoSlide],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {

}
