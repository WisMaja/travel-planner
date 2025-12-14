import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormIcon } from '../../ui/form-icon/form-icon';

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
  @Input() planId?: string; // ID planu do przekazania w queryParams
  @Output() clicked = new EventEmitter<void>();

  imageError = false;

  constructor(private router: Router) {}

  onCardClick(): void {
    this.clicked.emit();
    if (this.navigateTo) {
      const queryParams = this.planId ? { planId: this.planId } : undefined;
      this.router.navigate([this.navigateTo], {
        queryParams: queryParams
      });
    }
  }

  onImageError(): void {
    this.imageError = true;
  }
}

