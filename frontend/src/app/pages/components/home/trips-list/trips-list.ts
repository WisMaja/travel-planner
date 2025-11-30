import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripView } from '../trip-view/trip-view';
import { Button } from '../../ui/buttons/button/button';
import { FormIcon } from '../../ui/form-icon/form-icon';

export interface Trip {
  id: number;
  where?: string;
  date?: string;
  title?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TripView, Button, FormIcon],
  templateUrl: './trips-list.html',
  styleUrl: './trips-list.scss',
})
export class TripsList {
  @Input() trips: Trip[] = [];
  @Input() navigateTo?: string;
  @Input() emptyStateTitle: string = 'Brak wyjazdów';
  @Input() emptyStateMessage: string = 'Nie masz jeszcze żadnych zaplanowanych wyjazdów. Dodaj swój pierwszy wyjazd!';
  @Input() emptyStateButtonLabel: string = 'Dodaj pierwszy wyjazd';
  @Input() emptyStateButtonNavigateTo: string = '/plan/basic-info/edit';
  
  @Output() tripClick = new EventEmitter<number>();

  onTripClick(tripId: number): void {
    this.tripClick.emit(tripId);
  }
}
