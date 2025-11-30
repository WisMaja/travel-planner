import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchBar } from '../../home/search-bar/search-bar';
import { Button } from '../../ui/buttons/button/button';
import { FormIcon } from '../../ui/form-icon/form-icon';

type PlaceCategory = 'all' | 'restaurant' | 'hotel' | 'attraction' | 'shopping' | 'transport';

interface Place {
  id: number;
  name: string;
  address: string;
  category: PlaceCategory;
  rating: number;
  reviews: number;
  distance?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-find-places',
  imports: [CommonModule, RouterModule, SearchBar, Button, FormIcon],
  templateUrl: './find-places.html',
  styleUrl: './find-places.scss',
})
export class FindPlaces {
  searchQuery: string = '';
  activeCategory: PlaceCategory = 'all';
  categories: PlaceCategory[] = ['all', 'restaurant', 'hotel', 'attraction', 'shopping', 'transport'];
  
  // Przykładowe miejsca (tymczasowo)
  places: Place[] = [
    {
      id: 1,
      name: 'Restauracja La Piazza',
      address: 'ul. Główna 15, Warszawa',
      category: 'restaurant',
      rating: 4.5,
      reviews: 234,
      distance: '0.5 km',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Hotel Grand',
      address: 'ul. Królewska 42, Warszawa',
      category: 'hotel',
      rating: 4.8,
      reviews: 567,
      distance: '1.2 km',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      name: 'Muzeum Narodowe',
      address: 'al. Jerozolimskie 3, Warszawa',
      category: 'attraction',
      rating: 4.7,
      reviews: 1234,
      distance: '2.1 km',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      name: 'Centrum Handlowe Złote Tarasy',
      address: 'ul. Złota 59, Warszawa',
      category: 'shopping',
      rating: 4.3,
      reviews: 890,
      distance: '0.8 km',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      name: 'Dworzec Centralny',
      address: 'al. Jerozolimskie 54, Warszawa',
      category: 'transport',
      rating: 4.0,
      reviews: 456,
      distance: '1.5 km',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      name: 'Kawiarnia Artystyczna',
      address: 'ul. Nowy Świat 25, Warszawa',
      category: 'restaurant',
      rating: 4.6,
      reviews: 321,
      distance: '1.0 km',
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4c7c6e?w=400&h=300&fit=crop'
    }
  ];

  get filteredPlaces() {
    let result = this.places;
    
    // Filtrowanie po kategorii
    if (this.activeCategory !== 'all') {
      result = result.filter(place => place.category === this.activeCategory);
    }
    
    // Filtrowanie po wyszukiwaniu
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(place => 
        place.name.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query)
      );
    }
    
    return result;
  }

  get categoryLabels(): Record<PlaceCategory, string> {
    return {
      all: 'Wszystkie',
      restaurant: 'Restauracje',
      hotel: 'Hotele',
      attraction: 'Atrakcje',
      shopping: 'Zakupy',
      transport: 'Transport'
    };
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  onCategoryChange(category: PlaceCategory): void {
    this.activeCategory = category;
  }

  onPlaceClick(placeId: number): void {
    console.log('Place clicked:', placeId);
    // Tutaj można dodać nawigację do szczegółów miejsca
  }

  onAddToTrip(placeId: number): void {
    console.log('Add to trip:', placeId);
    // Tutaj można dodać logikę dodawania miejsca do wycieczki
  }
}

