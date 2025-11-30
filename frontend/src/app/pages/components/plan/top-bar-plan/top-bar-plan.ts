import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedImports } from '../../../../shared/shared-imports/shared-imports';

export type Step = {
  label: string;
  to: string;          // np. '/plan/basic-info' lub '/plan/123/basic-info'
  exact?: boolean;     // domyślnie true; ustaw false, gdy chcesz match „prefix”
};

@Component({
  selector: 'top-bar-plan',
  imports: [SharedImports, RouterModule],
  templateUrl: './top-bar-plan.html',
  styleUrl: './top-bar-plan.scss',
})
export class TopBarPlan {
  /** Kroki nawigacji */
  @Input({ required: true }) steps: Step[] = [];

  /** Warianty przycisków */
  @Input() variant: 'filter'|'primary'|'secondary'|'basic'|'other' = 'filter';
  @Input() activeVariant: typeof this.variant | 'filter-active' = 'filter-active';
}
