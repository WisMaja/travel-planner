import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-input-field.html',
  styleUrl: './form-input-field.scss',
})
export class FormInputField {
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() autocomplete: string = '';
  @Input() iconSvg?: string;
  @Input() control?: FormControl;
  @Input() errorMessage?: string;
  @Input() showPasswordToggle: boolean = false;

  hidePassword: boolean = true;

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  get inputType(): string {
    if (this.type === 'password' && this.showPasswordToggle) {
      return this.hidePassword ? 'password' : 'text';
    }
    return this.type;
  }

  get hasError(): boolean {
    return this.control ? (this.control.touched && this.control.invalid) : false;
  }

  get errorText(): string {
    if (!this.control || !this.control.errors) return '';
    
    if (this.control.errors['required']) {
      return this.errorMessage || `${this.label} jest wymagane`;
    }
    if (this.control.errors['email']) {
      return 'Podaj poprawny adres email';
    }
    if (this.control.errors['minlength']) {
      const requiredLength = this.control.errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} znaków`;
    }
    if (this.control.errors['pattern']) {
      return 'Nieprawidłowy format';
    }
    return '';
  }
}
