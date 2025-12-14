import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';
import { TopBarPlan } from '../components/plan/top-bar-plan/top-bar-plan';
import { Button } from '../components/ui/buttons/button/button';

@Component({
  selector: 'app-plan-bookings-edit',
  imports: [SharedImports, GoogleMapComponent, TopBarPlan, Button],
  templateUrl: './plan-bookings-edit.html',
  styleUrl: './plan-bookings-edit.scss',
})
export class PlanBookingsEdit implements OnInit {
  planId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.planId = params['planId'] || null;
    });
  }

  navigateToBookings(): void {
    if (this.planId) {
      this.router.navigate(['/plan/bookings'], {
        queryParams: { planId: this.planId }
      });
    } else {
      this.router.navigate(['/plan/bookings']);
    }
  }

  // Mapa - pusta lista miejsc (rezerwacje nie mają miejsc do wyświetlenia)
  get placesForMap(): MapPlace[] {
    return [];
  }
}
