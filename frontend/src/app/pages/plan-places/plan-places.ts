import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { FormIcon } from '../components/ui/form-icon/form-icon';
import { Button } from '../components/ui/buttons/button/button';
import { TopBarPlan } from '../components/plan/top-bar-plan/top-bar-plan';
import { SearchBar } from '../components/home/search-bar/search-bar';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';
import { PlanPlaceDto, PlanPlacesService } from '../../services/plan-places.service';

type PlaceCategory = 'all' | 'restaurant' | 'hotel' | 'attraction' | 'shopping' | 'transport';
type PlaceType = 'country' | 'city' | 'accommodation' | 'attraction' | 'food';
type Priority = 'low' | 'medium' | 'high';

interface PlaceLink {
  name: string;
  url: string;
}

interface Place {
  id: number;
  guid: string;
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
  isLoading: boolean = false;
  loadError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planPlacesService: PlanPlacesService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.planId = params['planId'] || null;
      if (this.planId) {
        this.fetchPlanPlaces(this.planId);
      }
    });
  }

  fetchPlanPlaces(planId: string): void {
    this.isLoading = true;
    this.loadError = null;
    this.planPlacesService.getPlanPlaces(planId).subscribe({
      next: (data) => {
        this.selectedPlaces = this.mapPlanPlacesToUi(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Nie udało się pobrać miejsc', err);
        this.loadError = 'Nie udało się pobrać miejsc planu.';
        this.isLoading = false;
      }
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

  selectedPlaces: Place[] = [];

  private toPlaceType(kind?: string | null): PlaceType {
    const normalized = (kind || '').toLowerCase();
    if (normalized === 'country') return 'country';
    if (normalized === 'city') return 'city';
    if (normalized === 'hotel' || normalized === 'accommodation' || normalized === 'nocleg') return 'accommodation';
    if (normalized === 'restaurant' || normalized === 'food' || normalized === 'jedzenie') return 'food';
    if (normalized === 'attraction' || normalized === 'atrakcja') return 'attraction';
    return 'attraction';
  }

  private mapPlanPlacesToUi(data: PlanPlaceDto[]): Place[] {
    // nadaj lokalne numery ID aby utrzymać relacje parentId dla UI i mapy
    const idMap = new Map<string, number>();
    data.forEach((item, index) => idMap.set(item.plansPlacesId, index + 1));

    const mapped: Place[] = data.map((item, index) => {
      const parentNumeric = item.parentId ? idMap.get(item.parentId) : undefined;
      return {
        id: index + 1,
        guid: item.plansPlacesId,
        name: item.name || item.place?.name || 'Miejsce',
        address: item.place?.address || '',
        category: 'attraction',
        rating: 0,
        reviews: 0,
        order: item.level,
        priority: undefined,
        tags: [],
        notes: undefined,
        links: [],
        isExpanded: false,
        placeType: this.toPlaceType(item.kind),
        parentId: parentNumeric,
        children: [],
        variants: []
      };
    });

    // zbuduj drzewo dzieci
    mapped.forEach(place => {
      if (place.parentId) {
        const parent = mapped.find(p => p.id === place.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(place);
        }
      }
    });

    return mapped;
  }

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
        // zapasowy typ gdyby backend nie podał kind
        placeType: place.placeType ?? 'attraction'
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
        guid: 'unassigned',
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
