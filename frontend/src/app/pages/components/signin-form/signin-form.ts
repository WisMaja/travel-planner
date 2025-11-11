import { Component } from '@angular/core';
import { SharedImports } from '../../../shared/shared-imports/shared-imports'; 
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormIcon } from '../form-icon/form-icon';

@Component({
  selector: 'app-signin-form',
  standalone: true,
  imports: [SharedImports, ReactiveFormsModule, FormIcon],
  templateUrl: './signin-form.html',
  styleUrl: './signin-form.scss',
})
export class SigninForm {
  hide = true;
  isLoading = false;
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
    
    this.isLoading = true;
    const { email, password } = this.form.value;
    

  }

  togglePassword() {
    this.hide = !this.hide;
  }
}
