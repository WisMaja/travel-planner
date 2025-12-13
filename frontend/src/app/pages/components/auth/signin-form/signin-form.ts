import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedImports } from '../../../../shared/shared-imports/shared-imports'; 
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormIcon } from '../../ui/form-icon/form-icon';
import { AuthService } from '../../../../services/auth.service';

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
  errorMessage = '';
  form;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
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
    this.errorMessage = '';
    const { email, password } = this.form.value;
    
    if (!email || !password) {
      this.isLoading = false;
      this.errorMessage = 'Email i hasło są wymagane';
      return;
    }
    
    this.authService.login({ email, password }).subscribe({
      next: (response: { accessToken: string; refreshToken: string }) => {
        // Zapisz tokeny przez AuthService
        this.authService.saveTokens(response.accessToken, response.refreshToken);
        this.isLoading = false;
        // Przekieruj do strony głównej po sukcesie
        this.router.navigate(['/home']);
      },
      error: (error: any) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.errorMessage = 'Nieprawidłowy email lub hasło';
        } else {
          this.errorMessage = 'Wystąpił błąd podczas logowania. Spróbuj ponownie.';
        }
        console.error('Login error:', error);
      }
    });
  }

  togglePassword() {
    this.hide = !this.hide;
  }
}
