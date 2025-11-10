import { Component } from '@angular/core';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { SigninForm } from '../../pages/components/signin-form/signin-form';
import { Divider } from '../../pages/components/divider/divider';
import {PhotoSlide} from '../../pages/components/photo-slide/photo-slide';

@Component({
  selector: 'app-signin',
  imports: [SharedImports, SigninForm, Divider, PhotoSlide],
  templateUrl: './signin.html',
  styleUrl: './signin.scss',
})
export class Signin {

}
