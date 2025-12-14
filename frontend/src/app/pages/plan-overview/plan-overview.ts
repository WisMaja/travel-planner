import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';

@Component({
  selector: 'app-plan-overview',
  imports: [SharedImports],
  templateUrl: './plan-overview.html',
  styleUrl: './plan-overview.scss',
})
export class PlanOverview implements OnInit {
  planId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.planId = params['planId'] || null;
    });
  }
}
