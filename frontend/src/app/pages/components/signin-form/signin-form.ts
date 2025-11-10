import { Component } from '@angular/core';
import { SharedImports } from '../../../shared/shared-imports/shared-imports'; 
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-signin-form',
  standalone: true,
  imports: [SharedImports, ReactiveFormsModule],
  templateUrl: './signin-form.html',
  styleUrl: './signin-form.scss',
})
export class SigninForm {
  hide = true;
  form;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.value;
      console.log('Sign in:', email, password);
    }

    togglePassword() {
      this.hide = !this.hide;
    }
}
