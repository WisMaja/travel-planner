import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';



type Variant =
  | 'primary' | 'secondary' | 'basic' | 'other'
  | 'filter' | 'filter-active'
  | 'basic-accept'
  | 'oauth-google';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrls: ['./button.scss'], 
})
export class Button {
  @Input() label = 'Przycisk';
  @Input() variant: Variant = 'primary';
  @Input() disabled = false;
  @Input() icon?: string;
  @Input() navigateTo?: string;

  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() clicked = new EventEmitter<void>();


  constructor(private router: Router) {}

  onClick() {
    this.clicked.emit();

    // jeśli ustawiono trasę — przejdź
    if (this.navigateTo) {
      this.router.navigate([this.navigateTo]);
    }
  }
}