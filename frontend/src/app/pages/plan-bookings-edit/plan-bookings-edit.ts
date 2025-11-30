import { Component } from '@angular/core';
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
export class PlanBookingsEdit {
  // Mapa - pusta lista miejsc (rezerwacje nie mają miejsc do wyświetlenia)
  get placesForMap(): MapPlace[] {
    return [];
  }
}
