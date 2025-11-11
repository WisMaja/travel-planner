import { Component } from '@angular/core';
import { SharedImports } from '../../../shared/shared-imports/shared-imports';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormIcon } from '../form-icon/form-icon';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [SharedImports, ReactiveFormsModule, FormIcon],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {
  hidePassword = true;
  hideConfirmPassword = true;
  form;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+48)?\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/)]],
      // dateOfBirth: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      // terms: [false, [Validators.requiredTrue]]
    }, {
      validators: SignupForm.passwordMatchValidator
    });
  }

  static passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { firstName, lastName, email, phone, password } = this.form.value;
    console.log('Sign up:', { firstName, lastName, email, phone});
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
