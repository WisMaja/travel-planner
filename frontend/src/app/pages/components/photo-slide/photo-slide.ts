import { SharedImports } from '../../../shared/shared-imports/shared-imports';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-photo-slide',
  imports: [SharedImports, RouterModule],
  templateUrl: './photo-slide.html',
  styleUrl: './photo-slide.scss',
})
export class PhotoSlide {
  @Input() src: string = '';
  @Input() alt: string = 'photo';
  @Input() shadowDirection: 'left' | 'right' = 'left';
  @Input() navigateTo?: string;

  constructor(private router: Router) {}

  onPhotoClick() {
    if (this.navigateTo) {
      this.router.navigate([this.navigateTo]);
    }
  }
}
