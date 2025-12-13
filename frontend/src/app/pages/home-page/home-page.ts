import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HomeHeader } from '../components/home/home-header/home-header';
import { TripsList, Trip } from '../components/home/trips-list/trips-list';
import { TripsStats } from '../components/home/trips-stats/trips-stats';
import { TripsHeader } from '../components/home/trips-header/trips-header';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';
import { PlansService, Plan } from '../../services/plans.service';

type FilterType = 'all' | 'upcoming' | 'past';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterModule, HomeHeader, TripsList, TripsStats, TripsHeader, GoogleMapComponent],
  templateUrl:'./home-page.html',
  styleUrl: './home-page.scss', 
})
export class HomePage implements OnInit {
  activeFilter: FilterType = 'all';
  searchQuery: string = '';
  trips: Trip[] = [];
  isLoading = true;
  
  constructor(
    private plansService: PlansService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.isLoading = true;
    this.plansService.getMyPlans().subscribe({
      next: (plans) => {
        this.trips = this.mapPlansToTrips(plans);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.trips = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Mapuje plany z API na format Trip użyty w komponencie
   */
  private mapPlansToTrips(plans: Plan[]): Trip[] {
    return plans.map((plan, index) => ({
      id: index + 1, // Tymczasowe ID dla kompatybilności
      plansId: plan.plansId, // Przechowaj plansId dla nawigacji
      where: plan.title || 'Brak lokalizacji',
      date: this.formatDate(plan.createdAtUtc),
      title: plan.title || 'Bez tytułu',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop' // Domyślne zdjęcie
    }));
  }

  /**
   * Formatuje datę do wyświetlenia
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return `${day}.${month < 10 ? '0' : ''}${month}`;
    } catch {
      return '';
    }
  }

  get filteredTrips() {
    let result = this.trips;
    
    // Filtrowanie musze obsłuzyc jeszcze
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(trip => 
        trip.title?.toLowerCase().includes(query) ||
        trip.where?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }

  get tripsCount(): number {
    return this.trips.length;
  }

  get upcomingTripsCount(): number {
    return this.trips.length;
  }

  get nextTrip() {
    return this.trips.length > 0 ? this.trips[0] : null;
  }

  onAddTrip(): void {
    this.isLoading = true;
    this.plansService.createEmptyPlan().subscribe({
      next: (plan) => {
        this.isLoading = false;
        // Przekieruj do strony edycji podstawowych informacji z ID planu
        this.router.navigate(['/plan/basic-info/edit'], {
          queryParams: { planId: plan.plansId }
        });
      },
      error: (error) => {
        console.error('Error creating plan:', error);
        this.isLoading = false;
        // TODO: Wyświetlić komunikat błędu użytkownikowi
        alert('Wystąpił błąd podczas tworzenia planu. Spróbuj ponownie.');
      }
    });
  }
  
  onSort(): void { 
    console.log('SORT CLICK');  
  }

  onTripClick(tripId: number): void {
    // Znajdź plan na podstawie ID i przekieruj do szczegółów
    const trip = this.trips.find(t => t.id === tripId);
    if (trip) {
      // Użyj plansId z oryginalnego planu - potrzebujemy przechować to w Trip
      // Na razie przekieruj do overview
      // TODO: Przekazać plansId do Trip interface
    }
  }

  onFilterChange(filter: FilterType): void {
    this.activeFilter = filter;
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  // Przygotuj miejsca dla mapy na podstawie wyjazdów
  get placesForMap(): MapPlace[] {
    return this.trips
      .filter(trip => trip.where || trip.title)
      .map(trip => ({
        id: trip.id,
        name: trip.where || trip.title || 'Nieznane miejsce',
        address: trip.where || '',
        placeType: 'city' as const
      }));
  }
}