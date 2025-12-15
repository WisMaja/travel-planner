import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlacesAutocompleteComponent, PlaceResult } from '../../maps/places-autocomplete/places-autocomplete';
import { GoogleMapComponent, MapPlace } from '../../maps/google-map/google-map';
import { FormIcon } from '../../ui/form-icon/form-icon';
import { Button } from '../../ui/buttons/button/button';

@Component({
  selector: 'app-add-place-modal',
  standalone: true,
  imports: [CommonModule, PlacesAutocompleteComponent, GoogleMapComponent, FormIcon, Button],
  templateUrl: './add-place-modal.html',
  styleUrl: './add-place-modal.scss'
})
export class AddPlaceModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() placeAdded = new EventEmitter<PlaceResult>();

  @ViewChild(PlacesAutocompleteComponent) placesAutocomplete!: PlacesAutocompleteComponent;

  searchQuery: string = '';
  searchResults: PlaceResult[] = [];
  selectedPlace: PlaceResult | null = null;
  mapPlaces: MapPlace[] = [];
  private autocompleteInitialized: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.updateBodyScroll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      this.updateBodyScroll();
      if (!this.isOpen) {
        this.clearSearch();
        this.autocompleteInitialized = false;
      } else {
        // Reset flag i zainicjalizuj autocomplete gdy modal się otwiera
        this.autocompleteInitialized = false;
        // Użyj setTimeout aby upewnić się, że DOM jest gotowy i komponent jest dostępny
        // Zwiększono timeout do 300ms aby dać więcej czasu na renderowanie
        setTimeout(() => {
          if (this.placesAutocomplete && !this.autocompleteInitialized) {
            try {
              this.placesAutocomplete.reinitialize();
              this.autocompleteInitialized = true;
            } catch (error) {
              console.error('Błąd podczas inicjalizacji autocomplete:', error);
              // Spróbuj ponownie po kolejnym czasie
              setTimeout(() => {
                if (this.placesAutocomplete && !this.autocompleteInitialized) {
                  this.placesAutocomplete.reinitialize();
                  this.autocompleteInitialized = true;
                }
              }, 300);
            }
          }
        }, 300);
      }
    }
  }

  ngOnDestroy(): void {
    // Przywróć scroll body
    document.body.style.overflow = '';
  }

  private updateBodyScroll(): void {
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  onClose(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.close.emit();
    this.clearSearch();
  }

  onBackdropClick(event: MouseEvent): void {
    // Zamknij tylko jeśli kliknięto w backdrop, nie w zawartość modala
    if ((event.target as HTMLElement).classList.contains('add-place-modal__overlay')) {
      this.onClose();
    }
  }

  onPlacePreview(place: PlaceResult): void {
    this.selectedPlace = place;
    this.updateMapPlace(place);
  }

  onPlaceSelected(place: PlaceResult): void {
    // Dodaj miejsce do listy wyników jeśli jeszcze nie ma
    if (!this.searchResults.find(p => p.placeId === place.placeId)) {
      this.searchResults.push(place);
    }
    this.selectedPlace = place;
    this.updateMapPlace(place);
  }

  onSearchValueChange(value: string): void {
    this.searchQuery = value;
  }

  onAddPlace(place: PlaceResult): void {
    this.placeAdded.emit(place);
    // Opcjonalnie: zamknij modal po dodaniu
    // this.onClose();
  }

  onRemovePlace(placeId: string): void {
    this.searchResults = this.searchResults.filter(p => p.placeId !== placeId);
    if (this.selectedPlace?.placeId === placeId) {
      this.selectedPlace = null;
      this.mapPlaces = [];
    } else {
      this.updateMapPlaces();
    }
  }

  private updateMapPlace(place: PlaceResult): void {
    if (place.lat && place.lng) {
      this.mapPlaces = [{
        id: parseInt(place.placeId.replace(/\D/g, '')) || Date.now(),
        name: place.name,
        address: place.address || place.formattedAddress || '',
        lat: place.lat,
        lng: place.lng,
        placeType: this.getPlaceTypeFromTypes(place.types || [])
      }];
    }
  }

  private updateMapPlaces(): void {
    this.mapPlaces = this.searchResults
      .filter(p => p.lat && p.lng)
      .map(p => ({
        id: parseInt(p.placeId.replace(/\D/g, '')) || Date.now(),
        name: p.name,
        address: p.address || p.formattedAddress || '',
        lat: p.lat!,
        lng: p.lng!,
        placeType: this.getPlaceTypeFromTypes(p.types || [])
      }));
  }

  private getPlaceTypeFromTypes(types: string[]): 'country' | 'city' | 'accommodation' | 'attraction' | 'food' {
    const normalized = types.map(t => t.toLowerCase());
    if (normalized.some(t => t.includes('country'))) return 'country';
    if (normalized.some(t => t.includes('locality') || t.includes('administrative_area'))) return 'city';
    if (normalized.some(t => t.includes('lodging') || t.includes('hotel'))) return 'accommodation';
    if (normalized.some(t => t.includes('restaurant') || t.includes('food') || t.includes('meal'))) return 'food';
    return 'attraction';
  }

  private clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedPlace = null;
    this.mapPlaces = [];
  }

  get mapCenter(): { lat: number; lng: number } {
    if (this.selectedPlace?.lat && this.selectedPlace?.lng) {
      return { lat: this.selectedPlace.lat, lng: this.selectedPlace.lng };
    }
    if (this.searchResults.length > 0) {
      const firstWithCoords = this.searchResults.find(p => p.lat && p.lng);
      if (firstWithCoords) {
        return { lat: firstWithCoords.lat!, lng: firstWithCoords.lng! };
      }
    }
    return { lat: 52.2297, lng: 21.0122 }; // Domyślnie Warszawa
  }
}
