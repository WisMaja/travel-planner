import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-divider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './divider.html',
  styleUrl: './divider.scss',
})
export class Divider {
  @Input() text: string = 'Nie posiadasz jeszcze konta?';
  @Input() linkText?: string;
  @Input() linkRoute?: string;
  @Input() divider: boolean = false;
}
