import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  @Input() placeholder = 'Szukaj...';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value);
}}
