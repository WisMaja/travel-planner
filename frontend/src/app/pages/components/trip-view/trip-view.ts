import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormIcon } from '../form-icon/form-icon';

@Component({
  selector: 'app-trip-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormIcon],
  templateUrl: './trip-view.html',
  styleUrl: './trip-view.scss',
})
export class TripView {
  @Input() where?: string;
  @Input() date?: string;
  @Input() title?: string;
  @Input() imageUrl?: string;
  @Input() navigateTo?: string;
  @Output() clicked = new EventEmitter<void>();

  imageError = false;

  constructor(private router: Router) {}

  onCardClick(): void {
    this.clicked.emit();
    if (this.navigateTo) {
      this.router.navigate([this.navigateTo]);
    }
  }

  onImageError(): void {
    this.imageError = true;
  }
}

