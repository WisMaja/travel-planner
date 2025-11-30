import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { SharedImports } from '../../../../shared/shared-imports/shared-imports';

interface NavOption {
  label: string;
  route?: string; // opcjonalna ścieżka
}

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [SharedImports],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar implements OnInit {
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
