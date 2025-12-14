import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { FormIcon } from '../components/ui/form-icon/form-icon';
import { Button } from '../components/ui/buttons/button/button';
import { TopBarPlan } from '../components/plan/top-bar-plan/top-bar-plan';
import { SearchBar } from '../components/home/search-bar/search-bar';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';

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
  order?: number;
  priority?: Priority;
  tags?: string[];
  notes?: string;
  links?: PlaceLink[];
  isExpanded?: boolean;
  placeType?: PlaceType;
  parentId?: number;
  children?: Place[];
  variantName?: string;
  variants?: string[];
}

@Component({
  selector: 'app-plan-places',
  imports: [CommonModule, RouterModule, SharedImports, FormIcon, Button, TopBarPlan, SearchBar, GoogleMapComponent],
  templateUrl: './plan-places.html',
  styleUrl: './plan-places.scss',
})
export class PlanPlaces implements OnInit {
  planId: string | null = null;
  searchQuery: string = '';
  activePlaceType: PlaceType | 'all' = 'all';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.planId = params['planId'] || null;
    });
  }

  navigateToEdit(): void {
    if (this.planId) {
      this.router.navigate(['/plan/places/edit'], {
        queryParams: { planId: this.planId }
      });
    } else {
      this.router.navigate(['/plan/places/edit']);
    }
  }
  
  placeTypes: { id: PlaceType | 'all'; name: string }[] = [
    { id: 'all', name: 'Wszystkie' },
    { id: 'country', name: 'Kraje' },
    { id: 'city', name: 'Miasta' },
    { id: 'accommodation', name: 'Noclegi' },
    { id: 'attraction', name: 'Atrakcje' },
    { id: 'food', name: 'Jedzenie' }
  ];

  // Same data as plan-places-edit
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

  get placesForMap(): MapPlace[] {
    // Konwertuj miejsca do formatu MapPlace
    return this.selectedPlaces
      .filter(place => 
        place.address && 
        place.placeType !== 'country' && 
        place.address !== 'Europa Środkowa' && 
        place.address !== 'Europa Południowa' &&
        place.address !== 'Mazowsze, Polska' &&
        place.address !== 'Małopolska, Polska' &&
        place.address !== 'Lazio, Włochy' &&
        place.address !== 'Veneto, Włochy'
      )
      .map(place => ({
        id: place.id,
        name: place.name,
        address: place.address,
        placeType: place.placeType
      }));
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  onFilterByPlaceType(placeType: PlaceType | 'all'): void {
    this.activePlaceType = placeType;
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
    
    // Znajdź miejsca bez przypisania (bez kraju i bez miasta)
    const unassignedPlaces = allPlaces.filter(place => 
      place.placeType !== 'country' && 
      place.placeType !== 'city' && 
      !place.parentId
    ).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Jeśli są miejsca bez przypisania, dodaj je jako specjalny "kraj"
    if (unassignedPlaces.length > 0) {
      const unassignedCountry: Place = {
        id: -1,
        name: 'Miejsca bez przypisania',
        address: 'Miejsca nieprzypisane do kraju ani miasta',
        category: 'attraction',
        rating: 0,
        reviews: 0,
        order: countries.length + 1,
        priority: 'medium',
        tags: [],
        notes: '',
        links: [],
        isExpanded: false,
        placeType: 'country',
        parentId: undefined,
        children: []
      };
      (unassignedCountry as any).directPlaces = unassignedPlaces;
      (unassignedCountry as any).isUnassigned = true;
      countries.push(unassignedCountry);
    }
    
    // Zwróć kraje + specjalny kontener dla miejsc bez przypisania
    return countries;
  }

  toggleExpand(placeId: number): void {
    const place = this.selectedPlaces.find(p => p.id === placeId);
    if (place) {
      place.isExpanded = !place.isExpanded;
    }
  }

  getPriorityLabel(priority?: Priority): string {
    const priorities = [
      { id: 'low' as Priority, name: 'Niski' },
      { id: 'medium' as Priority, name: 'Średni' },
      { id: 'high' as Priority, name: 'Wysoki' }
    ];
    const p = priorities.find(pr => pr.id === priority);
    return p ? p.name : 'Średni';
  }

  getDirectPlacesForCountry(place: Place): Place[] {
    return (place as any)?.directPlaces || [];
  }

  isUnassignedPlace(place: Place): boolean {
    return (place as any).isUnassigned === true;
  }

  getPlacesWithoutVariant(parentId: number): Place[] {
    const parent = this.selectedPlaces.find(p => p.id === parentId);
    if (!parent) return [];
    
    // Jeśli to kraj, zwróć tylko miejsca bezpośrednio w kraju (nie w mieście)
    if (parent.placeType === 'country') {
      return this.selectedPlaces.filter(p => 
        p.parentId === parentId && 
        !p.variantName &&
        p.placeType !== 'city'
      );
    }
    
    // Jeśli to miasto, zwróć miejsca bez wariantu
    return this.selectedPlaces.filter(p => 
      p.parentId === parentId && 
      !p.variantName
    );
  }

  getPlacesForVariant(parentId: number, variantName: string): Place[] {
    const parent = this.selectedPlaces.find(p => p.id === parentId);
    if (!parent) return [];
    
    // Jeśli to kraj, zwróć tylko miejsca bezpośrednio w kraju (nie w mieście)
    if (parent.placeType === 'country') {
      return this.selectedPlaces.filter(p => 
        p.parentId === parentId && 
        p.variantName === variantName &&
        p.placeType !== 'city'
      );
    }
    
    // Jeśli to miasto, zwróć miejsca w wariancie
    return this.selectedPlaces.filter(p => 
      p.parentId === parentId && 
      p.variantName === variantName
    );
  }

  getVariantsForParent(parentId: number): string[] {
    const parent = this.selectedPlaces.find(p => p.id === parentId);
    return parent?.variants || [];
  }
}
