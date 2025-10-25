import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Button } from '../button/button';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [Button, CommonModule],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  /** Lista przycisków */
  @Input({ required: true }) options: string[] = [];

  /** Aktywny przycisk */
  active: string | null = null;

  /** Ustaw pierwszy element jako domyślny */
  ngOnInit() {
    if (this.options.length > 0) {
      this.active = this.options[0];
    }
  }

  /** Kliknięcie przycisku */
  select(option: string) {
    this.active = option;
  }

  /** Czy dany przycisk jest aktywny */
  isActive(option: string): boolean {
    return this.active === option;
}}
