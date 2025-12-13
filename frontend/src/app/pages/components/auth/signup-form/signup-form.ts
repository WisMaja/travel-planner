import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedImports } from '../../../../shared/shared-imports/shared-imports';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormIcon } from '../../ui/form-icon/form-icon';
import { AuthService } from '../../../../services/auth.service';

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
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
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

    const { email, password } = this.form.value;
    
    if (!email || !password) {
      this.errorMessage = 'Email i hasło są wymagane';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({ email, password }).subscribe({
      next: () => {
        this.isLoading = false;
        // Przekieruj do strony logowania po sukcesie
        this.router.navigate(['/signin']);
      },
      error: (error: any) => {
        this.isLoading = false;
        if (error.status === 409) {
          this.errorMessage = 'Użytkownik o tym emailu już istnieje';
        } else {
          this.errorMessage = 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.';
        }
        console.error('Registration error:', error);
      }
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
