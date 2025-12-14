import { Component, Input, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SharedImports } from '../../../../shared/shared-imports/shared-imports';

export type Step = {
  label: string;
  to: string;          // np. '/plan/basic-info' lub '/plan/123/basic-info'
  exact?: boolean;     // domyślnie true; ustaw false, gdy chcesz match „prefix"
};

@Component({
  selector: 'top-bar-plan',
  imports: [SharedImports, RouterModule],
  templateUrl: './top-bar-plan.html',
  styleUrl: './top-bar-plan.scss',
})
export class TopBarPlan implements OnInit {
  /** Kroki nawigacji */
  @Input({ required: true }) steps: Step[] = [];

  /** Plan ID - jeśli nie podano, będzie pobrany z queryParams */
  @Input() planId: string | null = null;

  /** Warianty przycisków */
  @Input() variant: 'filter'|'primary'|'secondary'|'basic'|'other' = 'filter';
  @Input() activeVariant: typeof this.variant | 'filter-active' = 'filter-active';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Jeśli planId nie został przekazany jako input, pobierz z queryParams
    if (!this.planId) {
      this.route.queryParams.subscribe(params => {
        this.planId = params['planId'] || null;
      });
    }
  }

  /** Metoda pomocnicza do tworzenia queryParams z planId */
  getQueryParams(step: Step): any {
    if (this.planId) {
      return { planId: this.planId };
    }
    return {};
  }
}
