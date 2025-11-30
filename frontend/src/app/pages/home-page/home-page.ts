import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeHeader } from '../components/home/home-header/home-header';
import { TripsList } from '../components/home/trips-list/trips-list';
import { TripsStats } from '../components/home/trips-stats/trips-stats';
import { TripsHeader } from '../components/home/trips-header/trips-header';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';

type FilterType = 'all' | 'upcoming' | 'past';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterModule, HomeHeader, TripsList, TripsStats, TripsHeader, GoogleMapComponent],
  templateUrl:'./home-page.html',
  styleUrl: './home-page.scss', 
})
export class HomePage {
  activeFilter: FilterType = 'all';
  searchQuery: string = '';
  
  // Tymczasowo lista na twardo wstawiona
  trips = [
    { 
      id: 1, 
      where: 'Paryż', 
      date: '2.02 - 5.02', 
      title: 'Weekend w Paryżu', 
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop'
    },
    { 
      id: 2, 
      where: 'Rzym', 
      date: '10.02 - 15.02', 
      title: 'Zwiedzanie Rzymu', 
      imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400&h=300&fit=crop'
    },
    { 
      id: 3, 
      where: 'Barcelona', 
      date: '20.02 - 25.02', 
      title: 'Hiszpańska przygoda', 
      imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop'
    },
    { 
      id: 4, 
      where: 'Londyn', 
      date: '1.03 - 5.03', 
      title: 'Weekend w Londynie', 
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop'
    },
    { 
      id: 5, 
      where: 'Amsterdam', 
      date: '10.03 - 15.03', 
      title: 'Holenderskie kanały', 
      imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop'
    },
    { 
      id: 6, 
      where: 'Berlin', 
      date: '20.03 - 25.03', 
      title: 'Niemiecka stolica', 
      imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585a3c2e1d3?w=400&h=300&fit=crop'
    },
    { 
      id: 7, 
      where: 'Praga', 
      date: '1.04 - 5.04', 
      title: 'Czeska przygoda', 
      imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=300&fit=crop'
    }
  ];

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
    console.log('ADD TRIP'); 
  }
  
  onSort(): void { 
    console.log('SORT CLICK');  
  }

  onTripClick(tripId: number): void {
    // Navigate to trip overview
    console.log('Trip clicked:', tripId);
  }

  onFilterChange(filter: FilterType): void {
    this.activeFilter = filter;
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  // Przygotuj miejsca dla mapy na podstawie wyjazdów
  get placesForMap(): MapPlace[] {
    return this.trips.map(trip => ({
      id: trip.id,
      name: trip.where || trip.title,
      address: trip.where || '',
      placeType: 'city' as const
    }));
  }
}