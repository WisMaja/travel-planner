import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';

@Component({
  selector: 'app-plan-bookings',
  imports: [SharedImports],
  templateUrl: './plan-bookings.html',
  styleUrl: './plan-bookings.scss',
})
export class PlanBookings implements OnInit {
  planId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.planId = params['planId'] || null;
    });
  }
}
