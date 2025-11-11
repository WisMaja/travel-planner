import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName = 'email' | 'user' | 'phone' | 'eye' | 'eye-off' | 'plus' | 'sort' | 'calendar';

@Component({
  selector: 'app-form-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-icon.html',
  styleUrl: './form-icon.scss',
})
export class FormIcon {
  @Input() name!: IconName;
  @Input() size: number = 24;
  @Input() color: string = '#D7D7D7';

  getViewBox(): string {
    return '0 0 24 24';
  }

  getIconPath(): string {
    const paths: Record<'email' | 'user' | 'phone', string> = {
      'email': 'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v0.3l-10 7-10-7V6zm0 3.5l9.4 6.6a1 1 0 0 0 1.2 0L22 9.5V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5z',
      'user': 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
      'phone': 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'
    };
    return paths[this.name as 'email' | 'user' | 'phone'] || '';
  }
}

