import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { Button } from '../components/ui/buttons/button/button';
import { FormIcon } from '../components/ui/form-icon/form-icon';
import { TopBarPlan } from '../components/plan/top-bar-plan/top-bar-plan';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';
import { PlansBasicInfoService } from '../../services/plans-basic-info.service';

@Component({
  selector: 'app-plan-basic-info',
  imports: [CommonModule, RouterModule, SharedImports, Button, FormIcon, TopBarPlan, GoogleMapComponent],
  templateUrl: './plan-basic-info.html',
  styleUrl: './plan-basic-info.scss',
})
export class PlanBasicInfo implements OnInit {
  planId: string | null = null;
  planData: any = null;
  isLoading = false;
  errorMessage: string | null = null;

  currencies = [
    { code: 'PLN', symbol: 'zł', name: 'Polski złoty' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dolar amerykański' },
    { code: 'GBP', symbol: '£', name: 'Funt brytyjski' },
    { code: 'CZK', symbol: 'Kč', name: 'Korona czeska' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plansBasicInfoService: PlansBasicInfoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const newPlanId = params['planId'] || null;
      
      // Jeśli planId się zmienił, załaduj nowe dane
      if (newPlanId !== this.planId) {
        this.planId = newPlanId;
        if (this.planId) {
          this.loadPlanData();
        } else {
          // Jeśli brak planId, wyczyść dane i pokaż komunikat
          this.planData = null;
          this.errorMessage = 'Brak ID planu. Nie można załadować danych.';
        }
      }
    });
  }

  loadPlanData(): void {
    if (!this.planId) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.plansBasicInfoService.getBasicInfo(this.planId).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.planData = {
          title: data.title || '',
          description: data.description || '',
          location: data.location || '',
          destination: data.destination || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          tripTypeId: data.tripTypeId || null,
          budgetAmount: data.budgetAmount || null,
          budgetCurrency: data.budgetCurrency || 'PLN',
          coverImgUrl: data.coverImgUrl || data.coverImageUrl || ''
        };
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading plan data:', error);
        this.errorMessage = 'Nie udało się załadować danych planu. Spróbuj ponownie.';
        // Fallback do pustych danych
        this.planData = {
          title: '',
          description: '',
          location: '',
          destination: '',
          startDate: '',
          endDate: '',
          tripTypeId: null,
          budgetAmount: null,
          budgetCurrency: 'PLN',
          coverImgUrl: ''
        };
      }
    });
  }

  navigateToEdit(): void {
    if (this.planId) {
      this.router.navigate(['/plan/basic-info/edit'], {
        queryParams: { planId: this.planId }
      });
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  get currencySymbol() {
    if (!this.planData) return '';
    const currency = this.currencies.find(c => c.code === this.planData.budgetCurrency);
    return currency?.symbol || '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    } catch {
      return dateString;
    }
  }

  // Mapa - miejsca do wyświetlenia
  get placesForMap(): MapPlace[] {
    const places: MapPlace[] = [];

    if (this.planData?.location && this.planData.location.trim()) {
      places.push({
        id: 1,
        name: 'Lokalizacja',
        address: this.planData.location,
        placeType: 'city'
      });
    }

    if (this.planData?.destination && this.planData.destination.trim()) {
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
