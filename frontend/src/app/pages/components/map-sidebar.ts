import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapComponent, MapPlace, MapDisplayMode } from './maps/google-map/google-map';
import { FormIcon } from './ui/form-icon/form-icon';

@Component({
  selector: 'app-map-sidebar',
  standalone: true,
  imports: [CommonModule, GoogleMapComponent, FormIcon],
  templateUrl: './map-sidebar.html',
  styleUrl: './map-sidebar.scss'
})
export class MapSidebarComponent {
  @Input() places: MapPlace[] = [];
  @Input() center: { lat: number; lng: number } = { lat: 52.2297, lng: 21.0122 };
  @Input() zoom: number = 10;
  @Input() showControls: boolean = true;
  @Input() autoFitBounds: boolean = true;
  @Input() isOpen: boolean = false;
  @Input() position: 'left' | 'right' = 'right';
  @Input() width: string = '400px';
  @Output() close = new EventEmitter<void>();

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.close.emit();
    }
  }

  onClose(): void {
    this.isOpen = false;
    this.close.emit();
  }
}

