import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { FormIcon } from '../components/ui/form-icon/form-icon';
import { Button } from '../components/ui/buttons/button/button';
import { TopBarPlan } from '../components/plan/top-bar-plan/top-bar-plan';
import { SearchBar } from '../components/home/search-bar/search-bar';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';

type TransportMode = 'car' | 'train' | 'plane' | 'bus' | 'walk' | 'bike' | 'other';

interface Place {
  id: number;
  name: string;
  address: string;
  imageUrl?: string;
}

interface Route {
  id: number;
  fromPlaceId: number;
  toPlaceId: number;
  waypoints?: number[]; // Punkty pośrednie (ID miejsc)
  fromPlace?: Place;
  toPlace?: Place;
  transportMode: TransportMode;
  duration: string; // Format: "2h 30min" lub "45min"
  distance?: string; // Format: "150 km"
  cost?: number;
  currency?: string;
  notes?: string;
  order?: number;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-plan-routes-edit',
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    FormsModule, 
    ...SharedImports, 
    FormIcon, 
    Button, 
    TopBarPlan, 
    SearchBar, 
    GoogleMapComponent
  ],
  templateUrl: './plan-routes-edit.html',
  styleUrl: './plan-routes-edit.scss',
})
export class PlanRoutesEdit {
  searchQuery: string = '';
  showAddRouteModal: boolean = false;
  editingRouteId: number | null = null;
  routeToDelete: number | null = null;
  showDeleteConfirm: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Formularz dla nowej/edytowanej trasy
  routeForm: FormGroup;
  
  // Tymczasowe waypoints dla formularza
  routeWaypoints: number[] = [];

  // Field errors for real-time validation
  fieldErrors: { [key: string]: string } = {};

  transportModes: { id: TransportMode; name: string; icon: string }[] = [
    { id: 'car', name: 'Samochód', icon: '🚗' },
    { id: 'train', name: 'Pociąg', icon: '🚂' },
    { id: 'plane', name: 'Samolot', icon: '✈️' },
    { id: 'bus', name: 'Autobus', icon: '🚌' },
    { id: 'walk', name: 'Pieszo', icon: '🚶' },
    { id: 'bike', name: 'Rower', icon: '🚲' },
    { id: 'other', name: 'Inne', icon: '🚕' }
  ];

  currencies: string[] = ['PLN', 'EUR', 'USD', 'GBP'];

  // Przykładowe miejsca (w rzeczywistości powinny pochodzić z planu miejsc)
  availablePlaces: Place[] = [
    { id: 100, name: 'Polska', address: 'Europa Środkowa' },
    { id: 101, name: 'Warszawa', address: 'Mazowsze, Polska' },
    { id: 102, name: 'Hotel Bristol', address: 'ul. Krakowskie Przedmieście 42/44, Warszawa' },
    { id: 103, name: 'Zamek Królewski', address: 'Plac Zamkowy 4, Warszawa' },
    { id: 104, name: 'Restauracja U Fukiera', address: 'Rynek Starego Miasta 27, Warszawa' },
    { id: 105, name: 'Kraków', address: 'Małopolska, Polska' },
    { id: 106, name: 'Hotel Stary', address: 'ul. Szczepańska 5, Kraków' },
    { id: 107, name: 'Wawel', address: 'Wawel 5, Kraków' },
    { id: 200, name: 'Włochy', address: 'Europa Południowa' },
    { id: 201, name: 'Rzym', address: 'Lazio, Włochy' },
    { id: 202, name: 'Hotel de Russie', address: 'Via del Babuino 9, Rzym' },
    { id: 203, name: 'Koloseum', address: 'Piazza del Colosseo, Rzym' },
    { id: 205, name: 'Wenecja', address: 'Veneto, Włochy' },
    { id: 206, name: 'Hotel Danieli', address: 'Riva degli Schiavoni 4196, Wenecja' }
  ];

  // Przykładowe trasy
  routes: Route[] = [
    {
      id: 1,
      fromPlaceId: 101,
      toPlaceId: 105,
      waypoints: [102, 103], // Przykład: Warszawa -> Hotel Bristol -> Zamek Królewski -> Kraków
      transportMode: 'train',
      duration: '2h 30min',
      distance: '295 km',
      cost: 89,
      currency: 'PLN',
      notes: 'PKP Intercity, rezerwacja miejsca',
      order: 1,
      isExpanded: false
    },
    {
      id: 2,
      fromPlaceId: 102,
      toPlaceId: 103,
      transportMode: 'walk',
      duration: '15min',
      distance: '0.8 km',
      order: 2,
      isExpanded: false
    },
    {
      id: 3,
      fromPlaceId: 200,
      toPlaceId: 201,
      transportMode: 'plane',
      duration: '1h 45min',
      distance: '1300 km',
      cost: 450,
      currency: 'EUR',
      notes: 'Lot bezpośredni z Warszawy',
      order: 3,
      isExpanded: false
    },
    {
      id: 4,
      fromPlaceId: 201,
      toPlaceId: 205,
      transportMode: 'train',
      duration: '3h 20min',
      distance: '525 km',
      cost: 35,
      currency: 'EUR',
      notes: 'Frecciarossa, szybki pociąg',
      order: 4,
      isExpanded: false
    }
  ];

  constructor(private fb: FormBuilder) {
    this.routeForm = this.fb.group({
      fromPlaceId: [''],
      toPlaceId: [''],
      transportMode: ['car'],
      duration: [''],
      distance: [''],
      cost: [''],
      currency: ['PLN'],
      notes: ['']
    });

    // Real-time validation
    this.routeForm.valueChanges.subscribe(() => {
      this.validateForm();
    });
  }

  validateForm(): void {
    this.fieldErrors = {};
    const formValue = this.routeForm.value;

    if (!formValue.fromPlaceId) {
      this.fieldErrors['fromPlaceId'] = 'Wybierz miejsce startowe';
    }

    if (!formValue.toPlaceId) {
      this.fieldErrors['toPlaceId'] = 'Wybierz miejsce docelowe';
    }

    if (formValue.fromPlaceId && formValue.toPlaceId && formValue.fromPlaceId === formValue.toPlaceId) {
      this.fieldErrors['toPlaceId'] = 'Miejsce docelowe musi być inne niż startowe';
    }

    if (!formValue.transportMode) {
      this.fieldErrors['transportMode'] = 'Wybierz środek transportu';
    }

    if (!formValue.duration || formValue.duration.trim() === '') {
      this.fieldErrors['duration'] = 'Podaj czas podróży';
    } else if (!/^(\d+h\s?)?(\d+min)?$/.test(formValue.duration.trim())) {
      this.fieldErrors['duration'] = 'Format: np. "2h 30min" lub "45min"';
    }

    // Check waypoints for duplicates
    const allPlaceIds = [formValue.fromPlaceId, formValue.toPlaceId, ...this.routeWaypoints.filter(id => id !== 0)];
    const uniquePlaceIds = [...new Set(allPlaceIds)];
    if (allPlaceIds.length !== uniquePlaceIds.length) {
      this.fieldErrors['waypoints'] = 'Nie można użyć tego samego miejsca wielokrotnie';
    }

    // Check if all waypoints are selected
    if (this.routeWaypoints.some(id => id === 0)) {
      this.fieldErrors['waypoints'] = 'Wszystkie punkty pośrednie muszą być wybrane';
    }
  }

  getFieldError(fieldName: string): string | null {
    return this.fieldErrors[fieldName] || null;
  }

  isFieldInvalid(fieldName: string): boolean {
    return !!this.fieldErrors[fieldName];
  }

  get filteredPlaces() {
    if (!this.searchQuery.trim()) {
      return this.availablePlaces;
    }
    const query = this.searchQuery.toLowerCase();
    return this.availablePlaces.filter(place =>
      place.name.toLowerCase().includes(query) ||
      place.address.toLowerCase().includes(query)
    );
  }

  get filteredRoutes() {
    if (!this.searchQuery.trim()) {
      return this.routes.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    const query = this.searchQuery.toLowerCase();
    return this.routes
      .filter(route => {
        const fromPlace = this.getPlaceById(route.fromPlaceId);
        const toPlace = this.getPlaceById(route.toPlaceId);
        const fromName = fromPlace?.name.toLowerCase() || '';
        const fromAddr = fromPlace?.address.toLowerCase() || '';
        const toName = toPlace?.name.toLowerCase() || '';
        const toAddr = toPlace?.address.toLowerCase() || '';
        const transportMode = this.getTransportModeName(route.transportMode).toLowerCase();
        const notes = (route.notes || '').toLowerCase();
        
        return fromName.includes(query) || fromAddr.includes(query) ||
               toName.includes(query) || toAddr.includes(query) ||
               transportMode.includes(query) || notes.includes(query);
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getPlaceById(placeId: number): Place | undefined {
    return this.availablePlaces.find(p => p.id === placeId);
  }

  getTransportModeName(mode: TransportMode): string {
    return this.transportModes.find(m => m.id === mode)?.name || mode;
  }

  getTransportModeIcon(mode: TransportMode): string {
    return this.transportModes.find(m => m.id === mode)?.icon || '🚕';
  }

  openAddRouteModal(): void {
    this.editingRouteId = null;
    this.routeWaypoints = [];
    this.fieldErrors = {};
    this.routeForm.reset({
      fromPlaceId: '',
      toPlaceId: '',
      transportMode: 'car',
      duration: '',
      distance: '',
      cost: '',
      currency: 'PLN',
      notes: ''
    });
    this.showAddRouteModal = true;
  }

  openEditRouteModal(route: Route): void {
    this.editingRouteId = route.id;
    this.routeWaypoints = [...(route.waypoints || [])];
    this.fieldErrors = {};
    this.routeForm.patchValue({
      fromPlaceId: route.fromPlaceId,
      toPlaceId: route.toPlaceId,
      transportMode: route.transportMode,
      duration: route.duration,
      distance: route.distance || '',
      cost: route.cost || '',
      currency: route.currency || 'PLN',
      notes: route.notes || ''
    });
    this.showAddRouteModal = true;
  }

  closeRouteModal(): void {
    this.showAddRouteModal = false;
    this.editingRouteId = null;
    this.routeWaypoints = [];
    this.fieldErrors = {};
    this.routeForm.reset();
  }

  saveRoute(): void {
    this.validateForm();
    
    if (Object.keys(this.fieldErrors).length > 0) {
      this.errorMessage = 'Popraw błędy w formularzu';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }

    const formValue = this.routeForm.value;

    if (this.editingRouteId) {
      // Edycja istniejącej trasy
      const route = this.routes.find(r => r.id === this.editingRouteId);
      if (route) {
        route.fromPlaceId = formValue.fromPlaceId;
        route.toPlaceId = formValue.toPlaceId;
        route.waypoints = this.routeWaypoints.length > 0 ? [...this.routeWaypoints] : undefined;
        route.transportMode = formValue.transportMode;
        route.duration = formValue.duration;
        route.distance = formValue.distance || undefined;
        route.cost = formValue.cost ? parseFloat(formValue.cost) : undefined;
        route.currency = formValue.currency;
        route.notes = formValue.notes || undefined;
      }
      this.successMessage = 'Trasa została zaktualizowana';
    } else {
      // Dodanie nowej trasy
      const newRoute: Route = {
        id: Date.now(),
        fromPlaceId: formValue.fromPlaceId,
        toPlaceId: formValue.toPlaceId,
        waypoints: this.routeWaypoints.length > 0 ? [...this.routeWaypoints] : undefined,
        transportMode: formValue.transportMode,
        duration: formValue.duration,
        distance: formValue.distance || undefined,
        cost: formValue.cost ? parseFloat(formValue.cost) : undefined,
        currency: formValue.currency,
        notes: formValue.notes || undefined,
        order: this.routes.length + 1,
        isExpanded: false
      };
      this.routes.push(newRoute);
      this.successMessage = 'Trasa została dodana';
    }

    setTimeout(() => this.successMessage = null, 3000);
    this.closeRouteModal();
  }

  onRemoveRoute(routeId: number): void {
    const route = this.routes.find(r => r.id === routeId);
    if (route) {
      this.routeToDelete = routeId;
      this.showDeleteConfirm = true;
    }
  }

  confirmDelete(): void {
    if (this.routeToDelete !== null) {
      this.routes = this.routes.filter(r => r.id !== this.routeToDelete);
      this.updateOrders();
      this.successMessage = 'Trasa została usunięta';
      setTimeout(() => this.successMessage = null, 3000);
      this.cancelDelete();
    }
  }

  cancelDelete(): void {
    this.routeToDelete = null;
    this.showDeleteConfirm = false;
  }

  updateOrders(): void {
    this.routes.forEach((route, index) => {
      route.order = index + 1;
    });
  }

  onMoveUp(routeId: number): void {
    const index = this.routes.findIndex(r => r.id === routeId);
    if (index > 0) {
      [this.routes[index], this.routes[index - 1]] = [this.routes[index - 1], this.routes[index]];
      this.updateOrders();
    }
  }

  onMoveDown(routeId: number): void {
    const index = this.routes.findIndex(r => r.id === routeId);
    if (index < this.routes.length - 1) {
      [this.routes[index], this.routes[index + 1]] = [this.routes[index + 1], this.routes[index]];
      this.updateOrders();
    }
  }

  canMoveUp(routeId: number): boolean {
    const index = this.routes.findIndex(r => r.id === routeId);
    return index > 0;
  }

  canMoveDown(routeId: number): boolean {
    const index = this.routes.findIndex(r => r.id === routeId);
    return index < this.routes.length - 1;
  }

  toggleExpand(routeId: number): void {
    const route = this.routes.find(r => r.id === routeId);
    if (route) {
      route.isExpanded = !route.isExpanded;
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  dismissMessage(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  onSave(): void {
    console.log('Saving routes:', this.routes);
    this.successMessage = 'Trasy zostały zapisane pomyślnie';
    setTimeout(() => this.successMessage = null, 3000);
  }

  // Funkcje do zarządzania waypoints
  addWaypoint(): void {
    this.routeWaypoints.push(0); // 0 oznacza "nie wybrano"
    this.validateForm();
  }

  removeWaypoint(index: number): void {
    this.routeWaypoints.splice(index, 1);
    this.validateForm();
  }

  onWaypointChange(index: number, placeId: number): void {
    this.routeWaypoints[index] = placeId;
    this.validateForm();
  }

  getWaypointPlaceId(index: number): number {
    return this.routeWaypoints[index] || 0;
  }

  getAvailablePlacesForWaypoint(excludeIds: number[]): Place[] {
    const filtered = this.availablePlaces.filter(place => !excludeIds.includes(place.id));
    
    // Filtrowanie po wyszukiwaniu
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      return filtered.filter(place =>
        place.name.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  getAvailablePlacesForWaypointAtIndex(index: number): Place[] {
    const fromId = this.routeForm.get('fromPlaceId')?.value || 0;
    const toId = this.routeForm.get('toPlaceId')?.value || 0;
    const otherWaypoints = this.routeWaypoints
      .map((id, idx) => idx !== index ? id : 0)
      .filter(id => id !== 0);
    
    const excludeIds = [fromId, toId, ...otherWaypoints];
    return this.getAvailablePlacesForWaypoint(excludeIds);
  }

  getAllRoutePlaceIds(route: Route): number[] {
    const ids = [route.fromPlaceId];
    if (route.waypoints && route.waypoints.length > 0) {
      ids.push(...route.waypoints);
    }
    ids.push(route.toPlaceId);
    return ids;
  }

  // Pobiera wszystkie miejsca w trasie w kolejności (alias dla getAllRoutePlaceIds)
  getRoutePlaces(route: Route): number[] {
    return this.getAllRoutePlaceIds(route);
  }

  // Pobiera segment dla danego odcinka (from -> to)
  // Na razie zwraca undefined, bo Route nie ma jeszcze segments - można dodać później
  getSegmentForPath(route: Route, fromPlaceId: number, toPlaceId: number): any {
    // TODO: Gdy Route będzie miał segments, zwróć odpowiedni segment
    return undefined;
  }

  moveWaypointUp(index: number): void {
    if (index > 0) {
      [this.routeWaypoints[index], this.routeWaypoints[index - 1]] = 
        [this.routeWaypoints[index - 1], this.routeWaypoints[index]];
    }
  }

  moveWaypointDown(index: number): void {
    if (index < this.routeWaypoints.length - 1) {
      [this.routeWaypoints[index], this.routeWaypoints[index + 1]] = 
        [this.routeWaypoints[index + 1], this.routeWaypoints[index]];
    }
  }

  canMoveWaypointUp(index: number): boolean {
    return index > 0;
  }

  canMoveWaypointDown(index: number): boolean {
    return index < this.routeWaypoints.length - 1;
  }

  // Mapa sidebar

  // Miejsca dla mapy
  get placesForMap(): MapPlace[] {
    const allPlaceIds = new Set<number>();
    
    this.routes.forEach(route => {
      allPlaceIds.add(route.fromPlaceId);
      allPlaceIds.add(route.toPlaceId);
      if (route.waypoints) {
        route.waypoints.forEach(wpId => allPlaceIds.add(wpId));
      }
    });

    return Array.from(allPlaceIds)
      .map(id => this.getPlaceById(id))
      .filter(p => p !== undefined)
      .map(p => ({
        id: p!.id,
        name: p!.name,
        address: p!.address
      }));
  }
}
