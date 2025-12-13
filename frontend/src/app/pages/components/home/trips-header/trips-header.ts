import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Button } from '../../ui/buttons/button/button';
import { FormIcon } from '../../ui/form-icon/form-icon';

export type FilterType = 'all' | 'upcoming' | 'past';

@Component({
  selector: 'app-trips-header',
  standalone: true,
  imports: [CommonModule, RouterModule, Button, FormIcon],
  templateUrl: './trips-header.html',
  styleUrl: './trips-header.scss',
})
export class TripsHeader {
  @Input() title: string = 'Nadchodzące wyjazdy';
  @Input() activeFilter: FilterType = 'all';
  @Input() addButtonNavigateTo: string = '/plan/basic-info/edit';
  
  @Output() filterChange = new EventEmitter<FilterType>();
  @Output() sortClick = new EventEmitter<void>();
  @Output() addClick = new EventEmitter<void>();

  onFilterChange(filter: FilterType): void {
    this.filterChange.emit(filter);
  }

  onSort(): void {
    this.sortClick.emit();
  }

  onAddClick(): void {
    this.addClick.emit();
  }
}

