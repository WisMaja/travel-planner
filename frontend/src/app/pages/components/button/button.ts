import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

type Variant = 'primary' | 'secondary' | 'basic' | 'other';

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

  @Output() clicked = new EventEmitter<void>();

  onClick() { if (!this.disabled) this.clicked.emit(); }
}
