import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { Button } from '../components/ui/buttons/button/button';
import { FormIcon } from '../components/ui/form-icon/form-icon';
import { TopBarPlan } from '../components/plan/top-bar-plan/top-bar-plan';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';

@Component({
  selector: 'app-plan-basic-info',
  imports: [CommonModule, RouterModule, SharedImports, Button, FormIcon, TopBarPlan, GoogleMapComponent],
  templateUrl: './plan-basic-info.html',
  styleUrl: './plan-basic-info.scss',
})
export class PlanBasicInfo {
  // Przykładowe dane - w przyszłości będą pobierane z serwisu
  planData = {
    title: 'Wakacje w Paryżu',
    description: 'Wspaniała podróż do stolicy Francji. Zwiedzanie zabytków, degustacja lokalnej kuchni i relaks w romantycznej atmosferze.',
    location: 'Warszawa, Polska',
    destination: 'Paryż, Francja',
    startDate: '2024-07-01',
    endDate: '2024-07-10',
    tripTypeIds: ['1', '4'],
    customTripTypes: [],
    budgetAmount: '5000',
    budgetCurrency: 'EUR',
    coverImgUrl: ''
  };

  tripTypes = [
    { id: '1', name: 'Wypoczynek' },
    { id: '2', name: 'Zwiedzanie' },
    { id: '3', name: 'Biznes' },
    { id: '4', name: 'Romantyczny' },
    { id: '5', name: 'Rodzinny' },
    { id: '6', name: 'Przygoda' },
  ];

  currencies = [
    { code: 'PLN', symbol: 'zł', name: 'Polski złoty' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dolar amerykański' },
    { code: 'GBP', symbol: '£', name: 'Funt brytyjski' },
    { code: 'CZK', symbol: 'Kč', name: 'Korona czeska' },
  ];

  get selectedTripTypes() {
    return this.tripTypes.filter(type => this.planData.tripTypeIds.includes(type.id));
  }

  get selectedCustomTypes() {
    return this.planData.customTripTypes || [];
  }

  get currencySymbol() {
    const currency = this.currencies.find(c => c.code === this.planData.budgetCurrency);
    return currency?.symbol || '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Mapa - miejsca do wyświetlenia
  get placesForMap(): MapPlace[] {
    const places: MapPlace[] = [];

    if (this.planData.location && this.planData.location.trim()) {
      places.push({
        id: 1,
        name: 'Lokalizacja',
        address: this.planData.location,
        placeType: 'city'
      });
    }

    if (this.planData.destination && this.planData.destination.trim()) {
      places.push({
        id: 2,
        name: 'Cel podróży',
        address: this.planData.destination,
        placeType: 'city'
      });
    }

    return places;
  }
}
