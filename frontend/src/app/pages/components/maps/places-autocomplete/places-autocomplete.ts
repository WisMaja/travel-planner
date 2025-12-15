import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsLoaderService } from '../../../../services/google-maps-loader.service';
import { FormIcon } from '../../ui/form-icon/form-icon';

declare var google: any;

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  types?: string[];
  formattedAddress?: string;
  rating?: number;
  photos?: any[];
  imageUrl?: string;
  userRatingsTotal?: number;
  priceLevel?: number;
  openingHours?: any;
}

@Component({
  selector: 'app-places-autocomplete',
  standalone: true,
  imports: [CommonModule, FormIcon],
  templateUrl: './places-autocomplete.html',
  styleUrl: './places-autocomplete.scss'
})
export class PlacesAutocompleteComponent implements AfterViewInit, OnDestroy {
  @Input() placeholder: string = 'Szukaj miejsc...';
  @Input() value: string = '';
  @Input() types: string[] = []; // Np. ['establishment'], ['geocode'] - filtrowanie typów miejsc
  @Input() bounds?: any; // google.maps.LatLngBounds - ograniczenie obszaru wyszukiwania
  @Input() showPreview: boolean = true; // Pokazuj podgląd miejsca przed dodaniem
  @Input() minQueryLength: number = 3; // Minimalna długość zapytania
  @Input() debounceTime: number = 300; // Czas opóźnienia dla debounce
  
  @Output() placeSelected = new EventEmitter<PlaceResult>();
  @Output() valueChange = new EventEmitter<string>();
  @Output() placePreview = new EventEmitter<PlaceResult>(); // Emituje podgląd miejsca
  @Output() error = new EventEmitter<string>(); // Emituje błędy

  @ViewChild('autocompleteInput', { static: false }) autocompleteInput!: ElementRef<HTMLInputElement>;

  autocomplete: any;
  isLoaded: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  previewPlace: PlaceResult | null = null;
  debounceTimer: any;

  constructor(private googleMapsLoader: GoogleMapsLoaderService) {}

  ngAfterViewInit(): void {
    this.initializeAutocomplete();
  }

  ngOnDestroy(): void {
    // Cleanup jeśli potrzebne
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  /**
   * Inicjalizuje Google Places Autocomplete
   * Zgodne z dokumentacją: https://developers.google.com/maps/documentation/javascript/places-autocomplete
   */
  initializeAutocomplete(): void {
    this.googleMapsLoader.loadGoogleMaps()
      .then(() => {
        if (!this.autocompleteInput?.nativeElement) {
          console.error('Autocomplete input element not found');
          return;
        }

        // Opcje dla Autocomplete zgodnie z dokumentacją Google Places API
        const options: any = {
          fields: [
            'place_id', 
            'name', 
            'formatted_address', 
            'geometry', 
            'types', 
            'rating', 
            'photos',
            'user_ratings_total',
            'price_level',
            'opening_hours',
            'icon'
          ]
        };

        // Dodaj typy jeśli są podane
        if (this.types && this.types.length > 0) {
          options.types = this.types;
        }

        // Dodaj bounds jeśli są podane
        if (this.bounds) {
          options.bounds = this.bounds;
        }

        // Utwórz Autocomplete zgodnie z dokumentacją
        // https://developers.google.com/maps/documentation/javascript/places-autocomplete
        this.autocomplete = new google.maps.places.Autocomplete(
          this.autocompleteInput.nativeElement,
          options
        );

        // Nasłuchuj zdarzenia place_changed
        this.autocomplete.addListener('place_changed', () => {
          this.onPlaceChanged();
        });

        // Nasłuchuj zmian w inpucie dla debounce
        // Używamy addEventListener zamiast (input) w template, żeby mieć pewność, że działa
        this.autocompleteInput.nativeElement.addEventListener('input', (e: Event) => {
          this.onInputChange(e);
        });

        // Upewnij się, że input nie jest zablokowany
        this.autocompleteInput.nativeElement.removeAttribute('readonly');
        this.autocompleteInput.nativeElement.removeAttribute('disabled');

        this.isLoaded = true;
      })
      .catch((error: any) => {
        console.error('Błąd ładowania Google Maps API:', error);
      });
  }

  /**
   * Obsługa wyboru miejsca z autouzupełniania
   */
  onPlaceChanged(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const place = this.autocomplete.getPlace();

      if (!place || !place.place_id) {
        this.isLoading = false;
        return;
      }

      // Przygotuj wynik zgodny z interfejsem PlaceResult
      const result: PlaceResult = {
        placeId: place.place_id,
        name: place.name || '',
        address: place.formatted_address || '',
        formattedAddress: place.formatted_address || '',
        types: place.types || [],
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        priceLevel: place.price_level,
        openingHours: place.opening_hours
      };

      // Dodaj współrzędne jeśli są dostępne
      if (place.geometry && place.geometry.location) {
        result.lat = place.geometry.location.lat();
        result.lng = place.geometry.location.lng();
      }

      // Pobierz zdjęcie jeśli dostępne
      if (place.photos && place.photos.length > 0) {
        result.imageUrl = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 });
      }

      // Jeśli włączony podgląd, emituj podgląd zamiast bezpośredniego wyboru
      if (this.showPreview) {
        this.previewPlace = result;
        this.placePreview.emit(result);
      } else {
        // Emituj bezpośredni wybór
        this.placeSelected.emit(result);
      }

      this.valueChange.emit(this.autocompleteInput.nativeElement.value);
    } catch (error: any) {
      this.errorMessage = 'Wystąpił błąd podczas pobierania informacji o miejscu.';
      this.error.emit(this.errorMessage);
      console.error('Błąd podczas przetwarzania miejsca:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Obsługa zmiany wartości w inpucie (dla two-way binding)
   */
  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Aktualizuj wartość lokalnie
    this.value = value;

    // Walidacja minimalnej długości
    if (value.length > 0 && value.length < this.minQueryLength) {
      this.errorMessage = `Wpisz co najmniej ${this.minQueryLength} znaki`;
      this.valueChange.emit(value);
      return;
    }

    // Wyczyść błąd jeśli długość jest OK
    if (value.length >= this.minQueryLength) {
      this.errorMessage = '';
    }

    // Debounce dla valueChange
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.valueChange.emit(value);
    }, this.debounceTime);
  }

  /**
   * Ustawia bounds dla autouzupełniania (ograniczenie obszaru wyszukiwania)
   */
  setBounds(bounds: any): void { // google.maps.LatLngBounds
    this.bounds = bounds;
    if (this.autocomplete) {
      this.autocomplete.setBounds(bounds);
    }
  }

  /**
   * Czyści wartość inputa
   */
  clear(): void {
    if (this.autocompleteInput?.nativeElement) {
      this.autocompleteInput.nativeElement.value = '';
      this.valueChange.emit('');
      this.errorMessage = '';
      this.previewPlace = null;
      this.isLoading = false;
    }
  }

  /**
   * Potwierdza wybór miejsca z podglądu
   */
  confirmPlaceSelection(): void {
    if (this.previewPlace) {
      this.placeSelected.emit(this.previewPlace);
      this.previewPlace = null;
      this.clear();
    }
  }

  /**
   * Anuluje podgląd miejsca
   */
  cancelPreview(): void {
    this.previewPlace = null;
    this.clear();
  }

  /**
   * Ponownie inicjalizuje autocomplete (użyteczne gdy komponent jest ukryty/pokazywany)
   */
  reinitialize(): void {
    // Wyczyść istniejące autocomplete jeśli istnieje
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
      this.autocomplete = null;
    }

    // Wyczyść timer jeśli istnieje
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Zresetuj flagi
    this.isLoaded = false;
    this.errorMessage = '';
    this.previewPlace = null;
    this.isLoading = false;

    // Ponownie zainicjalizuj
    this.initializeAutocomplete();
  }
}

