import { SharedImports } from '../../../shared/shared-imports/shared-imports';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-photo-slide',
  imports: [SharedImports],
  templateUrl: './photo-slide.html',
  styleUrl: './photo-slide.scss',
})
export class PhotoSlide {
  @Input() src: string = '';
  @Input() alt: string = 'photo';
}
