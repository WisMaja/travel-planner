import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { FormIcon } from '../components/ui/form-icon/form-icon';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';
import { PlacesAutocompleteComponent, PlaceResult } from '../components/maps/places-autocomplete/places-autocomplete';

type PlaceCategory = 'all' | 'restaurant' | 'hotel' | 'attraction' | 'shopping' | 'transport';
type PlaceType = 'country' | 'city' | 'accommodation' | 'attraction' | 'food';
type Priority = 'low' | 'medium' | 'high';

interface PlaceLink {
  name: string;
  url: string;
}

interface Place {
  id: number;
  name: string;
  address: string;
  category: PlaceCategory;
  rating: number;
  reviews: number;
  distance?: string;
  imageUrl?: string;
  lat?: number; // Współrzędna szerokości geograficznej
  lng?: number; // Współrzędna długości geograficznej
  // Nowe pola dla planu
  order?: number;
  priority?: Priority;
  tags?: string[];
  notes?: string;
  links?: PlaceLink[];
  isExpanded?: boolean;
  placeType?: PlaceType; // Kategoria: Kraje/Miasta/Noclegi/Atrakcje/Jedzenie
  parentId?: number; // ID rodzica (kraj dla miasta, miasto dla miejsca)
  children?: Place[]; // Podrzędne miejsca (miasta dla kraju, miejsca dla miasta)
  variantName?: string; // Nazwa wariantu/podlisty dla miejsca (np. "Dzień 1", "Wariant A")
  variants?: string[]; // Lista dostępnych wariantów dla miasta/kraju
}

@Component({
  selector: 'app-plan-places-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, SharedImports, FormIcon, GoogleMapComponent, PlacesAutocompleteComponent],
  templateUrl: './plan-places-edit.html',
  styleUrl: './plan-places-edit.scss',
})
export class PlanPlacesEdit implements OnInit {
  planId: string | null = null;
  searchQuery: string = '';
  mapSearchValue: string = '';
  activeCategory: PlaceCategory = 'all';
  categories: PlaceCategory[] = ['all', 'restaurant', 'hotel', 'attraction', 'shopping', 'transport'];
  activePlaceType: PlaceType | 'all' = 'all';
  
  placeTypes: { id: PlaceType | 'all'; name: string }[] = [
    { id: 'all', name: 'Wszystkie' },
    { id: 'country', name: 'Kraje' },
    { id: 'city', name: 'Miasta' },
    { id: 'accommodation', name: 'Noclegi' },
    { id: 'attraction', name: 'Atrakcje' },
    { id: 'food', name: 'Jedzenie' }
  ];

  get placeTypesWithoutAll(): { id: PlaceType; name: string }[] {
    return this.placeTypes.filter(pt => pt.id !== 'all') as { id: PlaceType; name: string }[];
  }
  
  priorities: { id: Priority; name: string }[] = [
    { id: 'low', name: 'Niski' },
    { id: 'medium', name: 'Średni' },
    { id: 'high', name: 'Wysoki' }
  ];

  editingPlaceId: number | null = null;
  placeToDelete: number | null = null;
  showDeleteConfirm: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  showVariantModal: boolean = false;
  variantParentId: number | null = null;
  variantParentType: 'city' | 'country' | null = null;
  newVariantName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.planId = params['planId'] || null;
    });
  }

  navigateToPlaces(): void {
    if (this.planId) {
      this.router.navigate(['/plan/places'], {
        queryParams: { planId: this.planId }
      });
    } else {
      this.router.navigate(['/plan/places']);
    }
  }
  
  getNewTagForPlace(placeId: number): string {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    return (place as any)?._newTag || '';
  }
  
  setNewTagForPlace(placeId: number, value: string): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (place) {
      (place as any)._newTag = value;
    }
  }
  
  getNewLinkForPlace(placeId: number): { name: string; url: string } {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    return (place as any)?._newLink || { name: '', url: '' };
  }
  
  setNewLinkForPlace(placeId: number, value: { name: string; url: string }): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (place) {
      (place as any)._newLink = value;
    }
  }

  updateNewLinkName(placeId: number, name: string): void {
    const currentLink = this.getNewLinkForPlace(placeId);
    this.setNewLinkForPlace(placeId, { ...currentLink, name });
  }

  updateNewLinkUrl(placeId: number, url: string): void {
    const currentLink = this.getNewLinkForPlace(placeId);
    this.setNewLinkForPlace(placeId, { ...currentLink, url });
  }
  
  // Miejsca już dodane do planu
  selectedPlaces: Place[] = [
    // Polska - Kraj
    {
      id: 100,
      name: 'Polska',
      address: 'Europa Środkowa',
      category: 'attraction',
      rating: 4.8,
      reviews: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=300&fit=crop',
      order: 1,
      priority: 'high',
      tags: ['europa', 'środkowa'],
      notes: 'Główny cel podróży',
      links: [],
      isExpanded: false,
      placeType: 'country',
      parentId: undefined,
      children: []
    },
    // Warszawa - Miasto w Polsce
    {
      id: 101,
      name: 'Warszawa',
      address: 'Mazowsze, Polska',
      category: 'attraction',
      rating: 4.6,
      reviews: 3000,
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop',
      order: 2,
      priority: 'high',
      tags: ['stolica', 'kultura'],
      notes: 'Stolica Polski',
      links: [],
      isExpanded: false,
      placeType: 'city',
      parentId: 100,
      children: []
    },
    // Miejsca w Warszawie
    {
      id: 102,
      name: 'Hotel Bristol',
      address: 'ul. Krakowskie Przedmieście 42/44, Warszawa',
      category: 'hotel',
      rating: 4.8,
      reviews: 567,
      distance: '0.3 km',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      order: 3,
      priority: 'high',
      tags: ['luksusowy', 'centrum'],
      notes: 'Zarezerwować pokój z widokiem',
      links: [{ name: 'Strona hotelu', url: 'https://example.com/hotel-bristol' }],
      isExpanded: false,
      placeType: 'accommodation',
      parentId: 101,
      children: []
    },
    {
      id: 103,
      name: 'Zamek Królewski',
      address: 'Plac Zamkowy 4, Warszawa',
      category: 'attraction',
      rating: 4.7,
      reviews: 1234,
      distance: '0.5 km',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      order: 4,
      priority: 'high',
      tags: ['historia', 'zabytek'],
      notes: 'Sprawdzić godziny otwarcia',
      links: [{ name: 'Oficjalna strona', url: 'https://example.com/zamek' }],
      isExpanded: false,
      placeType: 'attraction',
      parentId: 101,
      children: []
    },
    {
      id: 104,
      name: 'Restauracja U Fukiera',
      address: 'Rynek Starego Miasta 27, Warszawa',
      category: 'restaurant',
      rating: 4.5,
      reviews: 890,
      distance: '0.2 km',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      order: 5,
      priority: 'medium',
      tags: ['tradycyjna', 'polska kuchnia'],
      notes: 'Zarezerwować stolik na 19:00',
      links: [],
      isExpanded: false,
      placeType: 'food',
      parentId: 101,
      children: []
    },
    // Kraków - Miasto w Polsce
    {
      id: 105,
      name: 'Kraków',
      address: 'Małopolska, Polska',
      category: 'attraction',
      rating: 4.9,
      reviews: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      order: 6,
      priority: 'high',
      tags: ['kultura', 'historia'],
      notes: 'Miasto królów',
      links: [],
      isExpanded: false,
      placeType: 'city',
      parentId: 100,
      children: []
    },
    // Miejsca w Krakowie
    {
      id: 106,
      name: 'Hotel Stary',
      address: 'ul. Szczepańska 5, Kraków',
      category: 'hotel',
      rating: 4.7,
      reviews: 432,
      distance: '0.1 km',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      order: 7,
      priority: 'medium',
      tags: ['boutique', 'stare miasto'],
      notes: 'Blisko Rynku',
      links: [],
      isExpanded: false,
      placeType: 'accommodation',
      parentId: 105,
      children: []
    },
    {
      id: 107,
      name: 'Wawel',
      address: 'Wawel 5, Kraków',
      category: 'attraction',
      rating: 4.8,
      reviews: 2100,
      distance: '0.8 km',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      order: 8,
      priority: 'high',
      tags: ['zamek', 'historia'],
      notes: 'Zwiedzić komnaty królewskie',
      links: [{ name: 'Strona Wawelu', url: 'https://example.com/wawel' }],
      isExpanded: false,
      placeType: 'attraction',
      parentId: 105,
      children: []
    },
    {
      id: 108,
      name: 'Restauracja Wierzynek',
      address: 'Rynek Główny 15, Kraków',
      category: 'restaurant',
      rating: 4.6,
      reviews: 567,
      distance: '0.2 km',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      order: 9,
      priority: 'medium',
      tags: ['elegancka', 'tradycyjna'],
      notes: 'Słynna restauracja na Rynku',
      links: [],
      isExpanded: false,
      placeType: 'food',
      parentId: 105,
      children: []
    },
    // Włochy - Kraj
    {
      id: 200,
      name: 'Włochy',
      address: 'Europa Południowa',
      category: 'attraction',
      rating: 4.9,
      reviews: 8000,
      imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=300&fit=crop',
      order: 10,
      priority: 'high',
      tags: ['europa', 'południe'],
      notes: 'Kraj sztuki i kuchni',
      links: [],
      isExpanded: false,
      placeType: 'country',
      parentId: undefined,
      children: []
    },
    // Rzym - Miasto we Włoszech
    {
      id: 201,
      name: 'Rzym',
      address: 'Lazio, Włochy',
      category: 'attraction',
      rating: 4.8,
      reviews: 6000,
      imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400&h=300&fit=crop',
      order: 11,
      priority: 'high',
      tags: ['stolica', 'historia'],
      notes: 'Wieczne Miasto',
      links: [],
      isExpanded: false,
      placeType: 'city',
      parentId: 200,
      children: []
    },
    // Miejsca w Rzymie
    {
      id: 202,
      name: 'Hotel de Russie',
      address: 'Via del Babuino 9, Rzym',
      category: 'hotel',
      rating: 4.9,
      reviews: 789,
      distance: '0.5 km',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      order: 12,
      priority: 'high',
      tags: ['luksusowy', 'centrum'],
      notes: 'Blisko Panteonu',
      links: [],
      isExpanded: false,
      placeType: 'accommodation',
      parentId: 201,
      children: []
    },
    {
      id: 203,
      name: 'Koloseum',
      address: 'Piazza del Colosseo, Rzym',
      category: 'attraction',
      rating: 4.7,
      reviews: 5000,
      distance: '1.2 km',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      order: 13,
      priority: 'high',
      tags: ['zabytek', 'rzym'],
      notes: 'Kupić bilety z wyprzedzeniem',
      links: [{ name: 'Bilety online', url: 'https://example.com/colosseum' }],
      isExpanded: false,
      placeType: 'attraction',
      parentId: 201,
      children: []
    },
    {
      id: 204,
      name: 'Trattoria da Enzo',
      address: 'Via dei Vascellari 29, Rzym',
      category: 'restaurant',
      rating: 4.6,
      reviews: 1234,
      distance: '0.8 km',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      order: 14,
      priority: 'medium',
      tags: ['tradycyjna', 'włoska'],
      notes: 'Autentyczna kuchnia rzymska',
      links: [],
      isExpanded: false,
      placeType: 'food',
      parentId: 201,
      children: []
    },
    // Wenecja - Miasto we Włoszech
    {
      id: 205,
      name: 'Wenecja',
      address: 'Veneto, Włochy',
      category: 'attraction',
      rating: 4.7,
      reviews: 3500,
      imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=400&h=300&fit=crop',
      order: 15,
      priority: 'high',
      tags: ['romantyczna', 'kanały'],
      notes: 'Miasto na wodzie',
      links: [],
      isExpanded: false,
      placeType: 'city',
      parentId: 200,
      children: []
    },
    // Miejsca w Wenecji
    {
      id: 206,
      name: 'Hotel Danieli',
      address: 'Riva degli Schiavoni 4196, Wenecja',
      category: 'hotel',
      rating: 4.8,
      reviews: 654,
      distance: '0.3 km',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      order: 16,
      priority: 'high',
      tags: ['luksusowy', 'widok'],
      notes: 'Widok na lagunę',
      links: [],
      isExpanded: false,
      placeType: 'accommodation',
      parentId: 205,
      children: []
    },
    {
      id: 207,
      name: 'Plac Św. Marka',
      address: 'Piazza San Marco, Wenecja',
      category: 'attraction',
      rating: 4.9,
      reviews: 2800,
      distance: '0.1 km',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      order: 17,
      priority: 'high',
      tags: ['plac', 'zabytki'],
      notes: 'Główny plac Wenecji',
      links: [],
      isExpanded: false,
      placeType: 'attraction',
      parentId: 205,
      children: []
    },
    {
      id: 208,
      name: 'Osteria alle Testiere',
      address: 'Calle del Mondo Novo 5801, Wenecja',
      category: 'restaurant',
      rating: 4.7,
      reviews: 456,
      distance: '0.4 km',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      order: 18,
      priority: 'medium',
      tags: ['seafood', 'tradycyjna'],
      notes: 'Słynna z owoców morza',
      links: [],
      isExpanded: false,
      placeType: 'food',
      parentId: 205,
      children: []
    }
  ];

  // Dostępne miejsca do dodania (przykładowe)
  availablePlaces: Place[] = [
    // Kraje do dodania
    {
      id: 300,
      name: 'Francja',
      address: 'Europa Zachodnia',
      category: 'attraction',
      rating: 4.8,
      reviews: 7000,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop',
      placeType: 'country'
    },
    {
      id: 301,
      name: 'Hiszpania',
      address: 'Europa Południowa',
      category: 'attraction',
      rating: 4.7,
      reviews: 6000,
      imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop',
      placeType: 'country'
    },
    // Miasta do dodania
    {
      id: 302,
      name: 'Paryż',
      address: 'Île-de-France, Francja',
      category: 'attraction',
      rating: 4.9,
      reviews: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop',
      placeType: 'city'
    },
    {
      id: 303,
      name: 'Barcelona',
      address: 'Katalonia, Hiszpania',
      category: 'attraction',
      rating: 4.8,
      reviews: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop',
      placeType: 'city'
    },
    {
      id: 304,
      name: 'Gdańsk',
      address: 'Pomorskie, Polska',
      category: 'attraction',
      rating: 4.6,
      reviews: 2000,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      placeType: 'city'
    },
    // Noclegi do dodania
    {
      id: 305,
      name: 'Hotel Ritz Paris',
      address: '15 Place Vendôme, Paryż',
      category: 'hotel',
      rating: 4.9,
      reviews: 890,
      distance: '0.5 km',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      placeType: 'accommodation'
    },
    {
      id: 306,
      name: 'Hotel Arts Barcelona',
      address: 'Carrer de la Marina 19-21, Barcelona',
      category: 'hotel',
      rating: 4.7,
      reviews: 654,
      distance: '0.3 km',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      placeType: 'accommodation'
    },
    {
      id: 307,
      name: 'Hotel Hilton Gdańsk',
      address: 'ul. Targ Rybny 1, Gdańsk',
      category: 'hotel',
      rating: 4.6,
      reviews: 432,
      distance: '0.2 km',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      placeType: 'accommodation'
    },
    // Atrakcje do dodania
    {
      id: 308,
      name: 'Wieża Eiffla',
      address: 'Champ de Mars, Paryż',
      category: 'attraction',
      rating: 4.8,
      reviews: 8000,
      distance: '1.0 km',
      imageUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=400&h=300&fit=crop',
      placeType: 'attraction'
    },
    {
      id: 309,
      name: 'Sagrada Família',
      address: 'Carrer de Mallorca 401, Barcelona',
      category: 'attraction',
      rating: 4.9,
      reviews: 6000,
      distance: '2.0 km',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      placeType: 'attraction'
    },
    {
      id: 310,
      name: 'Muzeum Bursztynu',
      address: 'ul. Targ Węglowy 26, Gdańsk',
      category: 'attraction',
      rating: 4.5,
      reviews: 567,
      distance: '0.5 km',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      placeType: 'attraction'
    },
    // Restauracje do dodania
    {
      id: 311,
      name: 'Le Comptoir du Relais',
      address: '9 Carrefour de l\'Odéon, Paryż',
      category: 'restaurant',
      rating: 4.7,
      reviews: 1234,
      distance: '0.8 km',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      placeType: 'food'
    },
    {
      id: 312,
      name: 'El Celler de Can Roca',
      address: 'Carrer de Can Sunyer 48, Girona',
      category: 'restaurant',
      rating: 4.9,
      reviews: 890,
      distance: '1.2 km',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      placeType: 'food'
    },
    {
      id: 313,
      name: 'Restauracja Kubicki',
      address: 'ul. Długi Targ 27, Gdańsk',
      category: 'restaurant',
      rating: 4.6,
      reviews: 456,
      distance: '0.3 km',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      placeType: 'food'
    },
    {
      id: 314,
      name: 'Pałac Kultury i Nauki',
      address: 'pl. Defilad 1, Warszawa',
      category: 'attraction',
      rating: 4.4,
      reviews: 1500,
      distance: '1.5 km',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      placeType: 'attraction'
    },
    {
      id: 315,
      name: 'Restauracja Belvedere',
      address: 'ul. Agrykola 1, Warszawa',
      category: 'restaurant',
      rating: 4.5,
      reviews: 678,
      distance: '2.0 km',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      placeType: 'food'
    }
  ];

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

  get filteredAvailablePlaces() {
    let result = this.availablePlaces.filter(place => 
      !this.selectedPlaces.some(selected => selected.id === place.id)
    );
    
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

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  onCategoryChange(category: PlaceCategory): void {
    this.activeCategory = category;
  }

  get filteredSelectedPlaces() {
    // Jeśli wybrano "Wszystkie", zwróć hierarchiczną strukturę
    if (this.activePlaceType === 'all') {
      return this.getHierarchicalPlaces();
    }
    
    // Dla innych filtrów - zwykła lista
    let result = this.selectedPlaces.filter(place => place.placeType === this.activePlaceType);
    
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

  getHierarchicalPlaces(): Place[] {
    // Pobierz wszystkie miejsca bez filtrowania
    let allPlaces = [...this.selectedPlaces];
    
    // Filtrowanie po wyszukiwaniu (jeśli jest)
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      allPlaces = allPlaces.filter(place => 
        place.name.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query)
      );
    }
    
    // Znajdź kraje (miejsca bez rodzica z typem 'country')
    const countries = allPlaces.filter(place => 
      place.placeType === 'country' && !place.parentId
    );
    
    // Dla każdego kraju znajdź miasta i miejsca bezpośrednio w kraju
    countries.forEach(country => {
      // Miasta w kraju - posortuj według kolejności
      country.children = allPlaces.filter(place => 
        place.placeType === 'city' && place.parentId === country.id
      ).sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Dla każdego miasta znajdź miejsca - posortuj według kolejności
      country.children.forEach(city => {
        city.children = allPlaces.filter(place => 
          place.placeType !== 'country' && 
          place.placeType !== 'city' && 
          place.parentId === city.id
        ).sort((a, b) => (a.order || 0) - (b.order || 0));
      });
      
      // Miejsca bezpośrednio w kraju (nie przypisane do miasta) - posortuj według kolejności
      (country as any).directPlaces = allPlaces.filter(place => 
        place.placeType !== 'country' && 
        place.placeType !== 'city' && 
        place.parentId === country.id
      ).sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    
    // Znajdź miasta bez przypisania do kraju (bez parentId)
    const unassignedCities = allPlaces.filter(place => 
      place.placeType === 'city' && !place.parentId
    ).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Dla każdego miasta bez przypisania znajdź miejsca
    unassignedCities.forEach(city => {
      city.children = allPlaces.filter(place => 
        place.placeType !== 'country' && 
        place.placeType !== 'city' && 
        place.parentId === city.id
      ).sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    
    // Znajdź miejsca bez przypisania (bez kraju i bez miasta)
    const unassignedPlaces = allPlaces.filter(place => 
      place.placeType !== 'country' && 
      place.placeType !== 'city' && 
      !place.parentId
    ).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Jeśli są miasta bez przypisania, dodaj je jako specjalny "kraj"
    if (unassignedCities.length > 0) {
      const unassignedCitiesCountry: Place = {
        id: -2, // Specjalne ID dla miast bez przypisania
        name: 'Miasta bez przypisania',
        address: 'Miasta nieprzypisane do kraju',
        category: 'attraction',
        rating: 0,
        reviews: 0,
        order: 999998, // Przed miejscami bez przypisania
        priority: 'low',
        tags: [],
        notes: '',
        links: [],
        isExpanded: true,
        placeType: 'country',
        parentId: undefined,
        children: unassignedCities
      };
      (unassignedCitiesCountry as any).isUnassigned = true;
      countries.push(unassignedCitiesCountry);
    }
    
    // Jeśli są miejsca bez przypisania, dodaj je jako specjalny "kraj"
    if (unassignedPlaces.length > 0) {
      const unassignedCountry: Place = {
        id: -1, // Specjalne ID dla miejsc bez przypisania
        name: 'Miejsca bez przypisania',
        address: 'Miejsca nieprzypisane do kraju ani miasta',
        category: 'attraction',
        rating: 0,
        reviews: 0,
        order: 999999, // Na końcu
        priority: 'low',
        tags: [],
        notes: '',
        links: [],
        isExpanded: true,
        placeType: 'country',
        parentId: undefined,
        children: []
      };
      (unassignedCountry as any).directPlaces = unassignedPlaces;
      (unassignedCountry as any).isUnassigned = true;
      countries.push(unassignedCountry);
    }
    
    // Zwróć kraje + specjalne kontenery dla miejsc bez przypisania
    return countries;
  }

  onAddPlace(place: Place, parentId?: number): void {
    if (this.selectedPlaces.some(p => p.id === place.id)) {
      this.errorMessage = 'To miejsce jest już dodane do planu';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }
    
    const newPlace: Place = {
      ...place,
      order: this.selectedPlaces.length + 1,
      priority: 'medium',
      tags: [],
      notes: '',
      links: [],
      isExpanded: false,
      placeType: place.placeType || 'attraction', // Domyślny typ
      parentId: parentId,
      children: []
    };
    this.selectedPlaces.push(newPlace);
    this.updateOrders();
    this.successMessage = `Miejsce "${place.name}" zostało dodane`;
    setTimeout(() => this.successMessage = null, 3000);
  }

  onAddPlaceToParent(place: Place, parentId: number): void {
    const parentPlace = this.selectedPlaces.find(p => p.id === parentId);
    if (!parentPlace) return;

    // Ustaw odpowiedni typ miejsca w zależności od rodzica
    let placeType: PlaceType | undefined = place.placeType;
    
    if (parentPlace.placeType === 'country') {
      // Jeśli dodajemy do kraju, ustaw jako miasto
      placeType = 'city';
    } else if (parentPlace.placeType === 'city') {
      // Jeśli dodajemy do miasta, zachowaj typ miejsca lub ustaw domyślny
      if (!placeType || placeType === 'country' || placeType === 'city') {
        placeType = 'attraction'; // Domyślny typ dla miejsca w mieście
      }
    }

    const placeToAdd: Place = {
      ...place,
      placeType: placeType
    };

    this.onAddPlace(placeToAdd, parentId);
  }

  getAvailablePlacesForParent(parentPlace: Place): Place[] {
    // Dla kraju: zwróć tylko miasta (lub miejsca bez typu, które mogą być miastami)
    if (parentPlace.placeType === 'country') {
      return this.filteredAvailablePlaces.filter(place => 
        place.placeType === 'city' || (!place.placeType && !this.selectedPlaces.some(p => p.id === place.id))
      );
    }
    
    // Dla miasta: zwróć miejsca (noclegi, atrakcje, jedzenie), ale nie kraje ani miasta
    if (parentPlace.placeType === 'city') {
      return this.filteredAvailablePlaces.filter(place => 
        place.placeType !== 'country' && 
        place.placeType !== 'city' &&
        (place.placeType === 'accommodation' || 
         place.placeType === 'attraction' || 
         place.placeType === 'food' ||
         (!place.placeType && !this.selectedPlaces.some(p => p.id === place.id)))
      );
    }
    
    return [];
  }

  isPlaceExpandedForAdding(place: Place): boolean {
    return (place as any)?._isExpandedForAdding || false;
  }

  togglePlaceExpandedForAdding(place: Place): void {
    if (place) {
      (place as any)._isExpandedForAdding = !(place as any)?._isExpandedForAdding;
    }
  }

  getDirectPlacesForCountry(place: Place): Place[] {
    return (place as any)?.directPlaces || [];
  }

  onPlaceTypeChange(placeId: number, placeType: PlaceType): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (place) {
      place.placeType = placeType;
    }
  }

  onAssignPlaceToCountry(placeId: number, countryId: string | number): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    const countryIdNum = typeof countryId === 'string' ? parseInt(countryId, 10) : countryId;
    if (place && countryIdNum && placeId !== countryIdNum && !isNaN(countryIdNum)) {
      place.parentId = countryIdNum;
      const country = this.selectedPlaces.find(p => p.id === countryIdNum);
      this.successMessage = `Miejsce "${place.name}" zostało przypisane do kraju "${country?.name || ''}"`;
      setTimeout(() => this.successMessage = null, 3000);
    }
  }

  onAssignPlaceToCity(placeId: number, cityId: string | number): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    const cityIdNum = typeof cityId === 'string' ? parseInt(cityId, 10) : cityId;
    if (place && cityIdNum && placeId !== cityIdNum && !isNaN(cityIdNum)) {
      place.parentId = cityIdNum;
      const city = this.selectedPlaces.find(p => p.id === cityIdNum);
      this.successMessage = `Miejsce "${place.name}" zostało przypisane do miasta "${city?.name || ''}"`;
      setTimeout(() => this.successMessage = null, 3000);
    }
  }

  getAvailableCountriesForAssignment(): Place[] {
    return this.selectedPlaces.filter(p => 
      p.placeType === 'country' && 
      !p.parentId && 
      p.id !== -1 // Wyklucz specjalny kontener "Miejsca bez przypisania"
    );
  }

  getAvailableCitiesForAssignment(): Place[] {
    return this.selectedPlaces.filter(p => 
      p.placeType === 'city' && 
      p.parentId !== undefined
    );
  }

  isUnassignedPlace(place: Place): boolean {
    return (place as any).isUnassigned === true;
  }

  onFilterByPlaceType(placeType: PlaceType | 'all'): void {
    this.activePlaceType = placeType;
  }

  onRemovePlace(placeId: number): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (place) {
      this.placeToDelete = placeId;
      this.showDeleteConfirm = true;
    }
  }

  confirmDelete(): void {
    if (this.placeToDelete !== null) {
      // Usuń również wszystkie miejsca potomne
      const placeToDelete = this.selectedPlaces.find(p => p.id === this.placeToDelete);
      if (placeToDelete) {
        const childrenIds = this.getChildrenIds(placeToDelete);
        this.selectedPlaces = this.selectedPlaces.filter(p => 
          p.id !== this.placeToDelete && !childrenIds.includes(p.id)
        );
        this.updateOrders();
        this.successMessage = `Miejsce "${placeToDelete.name}" zostało usunięte`;
        setTimeout(() => this.successMessage = null, 3000);
      }
      this.cancelDelete();
    }
  }

  cancelDelete(): void {
    this.placeToDelete = null;
    this.showDeleteConfirm = false;
  }

  getChildrenIds(place: Place): number[] {
    const ids: number[] = [];
    if (place.children) {
      place.children.forEach(child => {
        ids.push(child.id);
        ids.push(...this.getChildrenIds(child));
      });
    }
    return ids;
  }

  onMoveUp(placeId: number): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (!place) return;

    // Jeśli miejsce ma rodzica, przesuń w obrębie dzieci rodzica
    if (place.parentId) {
      const parent = this.selectedPlaces.find(p => p.id === place.parentId);
      if (parent && parent.children && parent.children.length > 0) {
        const index = parent.children.findIndex((p: Place) => p.id === placeId);
        if (index > 0) {
          // Zamień miejsca w tablicy children
          [parent.children[index], parent.children[index - 1]] = 
            [parent.children[index - 1], parent.children[index]];
          // Zaktualizuj kolejność w głównej tablicy selectedPlaces
          const placeInMain = this.selectedPlaces.find(p => p.id === placeId);
          const prevPlaceId = parent.children[index].id;
          const prevPlaceInMain = this.selectedPlaces.find(p => p.id === prevPlaceId);
          if (placeInMain && prevPlaceInMain) {
            [placeInMain.order, prevPlaceInMain.order] = [prevPlaceInMain.order, placeInMain.order];
          }
          this.updateOrdersForChildren(parent.children);
        }
      }
    } else {
      // Dla miejsc bez rodzica (kraje) - przesuń tylko wśród krajów
      if (place.placeType === 'country') {
        const countries = this.selectedPlaces.filter(p => p.placeType === 'country' && !p.parentId);
        const countryIndex = countries.findIndex(p => p.id === placeId);
        if (countryIndex > 0) {
          const prevCountry = countries[countryIndex - 1];
          const currentIndex = this.selectedPlaces.findIndex(p => p.id === placeId);
          const prevIndex = this.selectedPlaces.findIndex(p => p.id === prevCountry.id);
          if (currentIndex !== -1 && prevIndex !== -1) {
            [this.selectedPlaces[currentIndex], this.selectedPlaces[prevIndex]] = 
              [this.selectedPlaces[prevIndex], this.selectedPlaces[currentIndex]];
            this.updateOrders();
          }
        }
      } else {
        // Dla innych miejsc bez rodzica - standardowe przesuwanie
        const index = this.selectedPlaces.findIndex(p => p.id === placeId);
        if (index > 0) {
          [this.selectedPlaces[index], this.selectedPlaces[index - 1]] = 
            [this.selectedPlaces[index - 1], this.selectedPlaces[index]];
          this.updateOrders();
        }
      }
    }
  }

  onMoveDown(placeId: number): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (!place) return;

    // Jeśli miejsce ma rodzica, przesuń w obrębie dzieci rodzica
    if (place.parentId) {
      const parent = this.selectedPlaces.find(p => p.id === place.parentId);
      if (parent && parent.children && parent.children.length > 0) {
        const index = parent.children.findIndex((p: Place) => p.id === placeId);
        if (index < parent.children.length - 1) {
          // Zamień miejsca w tablicy children
          [parent.children[index], parent.children[index + 1]] = 
            [parent.children[index + 1], parent.children[index]];
          // Zaktualizuj kolejność w głównej tablicy selectedPlaces
          const placeInMain = this.selectedPlaces.find(p => p.id === placeId);
          const nextPlaceId = parent.children[index].id;
          const nextPlaceInMain = this.selectedPlaces.find(p => p.id === nextPlaceId);
          if (placeInMain && nextPlaceInMain) {
            [placeInMain.order, nextPlaceInMain.order] = [nextPlaceInMain.order, placeInMain.order];
          }
          this.updateOrdersForChildren(parent.children);
        }
      }
    } else {
      // Dla miejsc bez rodzica (kraje) - przesuń tylko wśród krajów
      if (place.placeType === 'country') {
        const countries = this.selectedPlaces.filter(p => p.placeType === 'country' && !p.parentId);
        const countryIndex = countries.findIndex(p => p.id === placeId);
        if (countryIndex < countries.length - 1) {
          const nextCountry = countries[countryIndex + 1];
          const currentIndex = this.selectedPlaces.findIndex(p => p.id === placeId);
          const nextIndex = this.selectedPlaces.findIndex(p => p.id === nextCountry.id);
          if (currentIndex !== -1 && nextIndex !== -1) {
            [this.selectedPlaces[currentIndex], this.selectedPlaces[nextIndex]] = 
              [this.selectedPlaces[nextIndex], this.selectedPlaces[currentIndex]];
            this.updateOrders();
          }
        }
      } else {
        // Dla innych miejsc bez rodzica - standardowe przesuwanie
        const index = this.selectedPlaces.findIndex(p => p.id === placeId);
        if (index < this.selectedPlaces.length - 1) {
          [this.selectedPlaces[index], this.selectedPlaces[index + 1]] = 
            [this.selectedPlaces[index + 1], this.selectedPlaces[index]];
          this.updateOrders();
        }
      }
    }
  }

  updateOrders(): void {
    this.selectedPlaces.forEach((place, index) => {
      place.order = index + 1;
    });
  }

  updateOrdersForChildren(children: Place[]): void {
    children.forEach((place, index) => {
      place.order = index + 1;
    });
  }

  canMoveUp(place: Place, parentChildren?: Place[]): boolean {
    if (parentChildren) {
      const index = parentChildren.findIndex(p => p.id === place.id);
      return index > 0;
    }
    return false;
  }

  canMoveDown(place: Place, parentChildren?: Place[]): boolean {
    if (parentChildren) {
      const index = parentChildren.findIndex(p => p.id === place.id);
      return index < parentChildren.length - 1;
    }
    return false;
  }

  canMoveUpCountry(place: Place): boolean {
    if (place.placeType !== 'country' || place.parentId) return false;
    const countries = this.getHierarchicalPlaces().filter(p => p.placeType === 'country' && !p.parentId);
    const index = countries.findIndex(p => p.id === place.id);
    return index > 0;
  }

  canMoveDownCountry(place: Place): boolean {
    if (place.placeType !== 'country' || place.parentId) return false;
    const countries = this.getHierarchicalPlaces().filter(p => p.placeType === 'country' && !p.parentId);
    const index = countries.findIndex(p => p.id === place.id);
    return index < countries.length - 1;
  }

  getParentForPlace(place: Place): Place | undefined {
    if (place.parentId) {
      return this.selectedPlaces.find(p => p.id === place.parentId);
    }
    return undefined;
  }

  toggleExpand(placeId: number): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (place) {
      place.isExpanded = !place.isExpanded;
    }
  }

  onPriorityChange(placeId: number, priority: Priority): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (place) {
      place.priority = priority;
    }
  }

  onAddTag(placeId: number): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (!place) return;
    const newTag = this.getNewTagForPlace(placeId).trim();
    if (!newTag) {
      this.errorMessage = 'Tag nie może być pusty';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }
    if (newTag.length > 20) {
      this.errorMessage = 'Tag może mieć maksymalnie 20 znaków';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }
    if (!place.tags) place.tags = [];
    if (!place.tags.includes(newTag)) {
      place.tags.push(newTag);
      this.setNewTagForPlace(placeId, '');
    } else {
      this.errorMessage = 'Ten tag już istnieje';
      setTimeout(() => this.errorMessage = null, 3000);
    }
  }

  onRemoveTag(placeId: number, tag: string): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (place && place.tags) {
      place.tags = place.tags.filter(t => t !== tag);
    }
  }

  onNotesChange(placeId: number, notes: string): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (place) {
      place.notes = notes;
    }
  }

  onAddLink(placeId: number): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (!place) return;
    const newLink = this.getNewLinkForPlace(placeId);
    const name = newLink.name.trim();
    const url = newLink.url.trim();
    
    if (!name || !url) {
      this.errorMessage = 'Nazwa i URL są wymagane';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }
    
    // Walidacja URL
    try {
      new URL(url);
    } catch {
      this.errorMessage = 'Nieprawidłowy format URL';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }
    
    if (!place.links) place.links = [];
    place.links.push({ name, url });
    this.setNewLinkForPlace(placeId, { name: '', url: '' });
    this.successMessage = 'Link został dodany';
    setTimeout(() => this.successMessage = null, 3000);
  }

  onRemoveLink(placeId: number, linkIndex: number): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (place && place.links) {
      place.links.splice(linkIndex, 1);
    }
  }

  getPriorityLabel(priority?: Priority): string {
    const p = this.priorities.find(pr => pr.id === priority);
    return p ? p.name : 'Średni';
  }

  onSave(): void {
    if (this.selectedPlaces.length === 0) {
      this.errorMessage = 'Dodaj przynajmniej jedno miejsce do planu';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }
    
    console.log('Saving places:', this.selectedPlaces);
    this.successMessage = 'Plan został zapisany pomyślnie';
    setTimeout(() => {
      this.successMessage = null;
      this.navigateToPlaces();
    }, 1000);
    // Tutaj będzie logika zapisywania miejsc do planu
  }

  dismissMessage(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  // Funkcje do zarządzania wariantami
  openVariantModal(parentId: number, parentType: 'city' | 'country'): void {
    this.variantParentId = parentId;
    this.variantParentType = parentType;
    this.newVariantName = '';
    this.showVariantModal = true;
  }

  closeVariantModal(): void {
    this.showVariantModal = false;
    this.variantParentId = null;
    this.variantParentType = null;
    this.newVariantName = '';
  }

  createVariant(): void {
    if (!this.variantParentId || !this.variantParentType || !this.newVariantName.trim()) {
      this.errorMessage = 'Wprowadź nazwę wariantu';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }

    const parent = this.selectedPlaces.find(p => p.id === this.variantParentId);
    if (!parent) {
      this.errorMessage = 'Nie znaleziono rodzica';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }

    // Inicjalizuj tablicę wariantów, jeśli nie istnieje
    if (!parent.variants) {
      parent.variants = [];
    }

    // Sprawdź, czy wariant o takiej nazwie już istnieje
    if (parent.variants.includes(this.newVariantName.trim())) {
      this.errorMessage = 'Wariant o tej nazwie już istnieje';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }

    // Dodaj wariant do listy
    parent.variants.push(this.newVariantName.trim());
    
    this.successMessage = `Wariant "${this.newVariantName.trim()}" został utworzony`;
    setTimeout(() => this.successMessage = null, 3000);
    
    this.closeVariantModal();
  }

  getPlacesForVariant(parentId: number, variantName: string): Place[] {
    const parent = this.selectedPlaces.find(p => p.id === parentId);
    if (!parent) return [];
    
    // Jeśli to kraj, zwróć tylko miejsca bezpośrednio w kraju (nie w mieście)
    if (parent.placeType === 'country') {
      return this.selectedPlaces.filter(p => 
        p.parentId === parentId && 
        p.variantName === variantName &&
        p.placeType !== 'city' // Wyklucz miasta
      );
    }
    
    // Jeśli to miasto, zwróć miejsca w wariancie
    return this.selectedPlaces.filter(p => 
      p.parentId === parentId && 
      p.variantName === variantName
    );
  }

  getPlacesWithoutVariant(parentId: number): Place[] {
    const parent = this.selectedPlaces.find(p => p.id === parentId);
    if (!parent) return [];
    
    // Jeśli to kraj, zwróć tylko miejsca bezpośrednio w kraju (nie w mieście)
    if (parent.placeType === 'country') {
      return this.selectedPlaces.filter(p => 
        p.parentId === parentId && 
        !p.variantName &&
        p.placeType !== 'city' // Wyklucz miasta
      );
    }
    
    // Jeśli to miasto, zwróć miejsca bez wariantu
    return this.selectedPlaces.filter(p => 
      p.parentId === parentId && 
      !p.variantName
    );
  }

  getVariantsForParent(parentId: number): string[] {
    const parent = this.selectedPlaces.find(p => p.id === parentId);
    return parent?.variants || [];
  }

  // Mapa - miejsca do wyświetlenia
  get placesForMap(): MapPlace[] {
    return this.selectedPlaces
      .filter(place => {
        // Filtruj miejsca które mają adres LUB współrzędne (miasta mogą nie mieć adresu, ale mają współrzędne)
        return (place.address && place.address.trim() !== '') || (place.lat && place.lng);
      })
      .map(place => ({
        id: place.id,
        name: place.name,
        address: place.address || '',
        lat: place.lat,
        lng: place.lng,
        placeType: place.placeType
      }));
  }

  /**
   * Obsługa wyboru miejsca z wyszukiwania na mapie (Google Places API)
   */
  onPlaceSelectedFromMap(placeResult: PlaceResult): void {
    // Sprawdź czy miejsce już istnieje
    const existingPlace = this.selectedPlaces.find(p => 
      p.name === placeResult.name && p.address === placeResult.address
    );

    if (existingPlace) {
      this.errorMessage = 'To miejsce jest już dodane do planu';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }

    // Określ kategorię miejsca na podstawie typów z Google Places
    let category: PlaceCategory = 'attraction';
    let placeType: PlaceType = 'attraction';

    if (placeResult.types) {
      // Mapowanie typów Google Places na kategorie aplikacji
      if (placeResult.types.some(t => t.includes('restaurant') || t.includes('food') || t.includes('meal'))) {
        category = 'restaurant';
        placeType = 'food';
      } else if (placeResult.types.some(t => t.includes('lodging') || t.includes('hotel'))) {
        category = 'hotel';
        placeType = 'accommodation';
      } else if (placeResult.types.some(t => t.includes('country'))) {
        category = 'attraction';
        placeType = 'country';
      } else if (placeResult.types.some(t => t.includes('locality') || t.includes('administrative_area_level_1'))) {
        category = 'attraction';
        placeType = 'city';
      } else if (placeResult.types.some(t => t.includes('shopping') || t.includes('store'))) {
        category = 'shopping';
        placeType = 'attraction';
      } else {
        category = 'attraction';
        placeType = 'attraction';
      }
    }

    // Utwórz nowe miejsce
    const newPlace: Place = {
      id: Date.now(), // Tymczasowe ID - w produkcji powinno być z API
      name: placeResult.name,
      address: placeResult.formattedAddress || placeResult.address,
      category: category,
      rating: placeResult.rating || 0,
      reviews: 0,
      imageUrl: placeResult.imageUrl, // Zdjęcie z Google Places
      lat: placeResult.lat, // Współrzędne geograficzne
      lng: placeResult.lng,
      order: this.selectedPlaces.length + 1,
      priority: 'medium',
      tags: [],
      notes: '',
      links: [],
      isExpanded: false,
      placeType: placeType,
      parentId: undefined,
      children: []
    };

    // Dodaj miejsce do listy
    this.selectedPlaces.push(newPlace);
    this.updateOrders();
    
    // Wyczyść pole wyszukiwania i podgląd
    this.mapSearchValue = '';
    
    // Wyczyść podgląd w komponencie autocomplete (jeśli używa podglądu)
    // To zostanie obsłużone przez clear() w komponencie
    
    this.successMessage = `Miejsce "${placeResult.name}" zostało dodane do planu`;
    setTimeout(() => this.successMessage = null, 3000);
    
    // Debug: sprawdź czy miejsce zostało dodane
    console.log('Dodano miejsce:', newPlace);
    console.log('Liczba miejsc w selectedPlaces:', this.selectedPlaces.length);
    console.log('Liczba miejsc w placesForMap:', this.placesForMap.length);
  }

  /**
   * Obsługa zmiany wartości wyszukiwania na mapie
   */
  onMapSearchValueChange(value: string): void {
    this.mapSearchValue = value;
  }

  /**
   * Obsługa podglądu miejsca przed dodaniem
   */
  onPlacePreviewFromMap(placeResult: PlaceResult): void {
    // Można tutaj dodać dodatkową logikę, np. wyświetlenie na mapie
    console.log('Podgląd miejsca:', placeResult);
  }

  /**
   * Obsługa błędów wyszukiwania
   */
  onSearchError(errorMessage: string): void {
    this.errorMessage = errorMessage;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
