import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Logo } from '../logo/logo';
import { SearchBar } from '../search-bar/search-bar';
import { Button } from '../button/button';
import { FormIcon } from '../form-icon/form-icon';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule, RouterModule, Logo, SearchBar, Button, FormIcon],
  templateUrl: './home-header.html',
  styleUrl: './home-header.scss',
})
export class HomeHeader {
  @Input() searchQuery: string = '';
  @Output() searchChange = new EventEmitter<string>();

  onSearchChange(query: string): void {
    this.searchChange.emit(query);
  }
}

