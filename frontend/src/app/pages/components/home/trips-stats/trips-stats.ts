import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Trip {
  id: number;
  title?: string;
  where?: string;
  date?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-trips-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trips-stats.html',
  styleUrl: './trips-stats.scss',
})
export class TripsStats {
  @Input() tripsCount: number = 0;
  @Input() upcomingTripsCount: number = 0;
  @Input() nextTrip: Trip | null = null;
}

