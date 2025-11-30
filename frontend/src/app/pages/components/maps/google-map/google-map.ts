import { Component, Input, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsLoaderService } from '../../../../services/google-maps-loader.service';

declare var google: any;

export interface MapPlace {
  id: number;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  placeType?: 'country' | 'city' | 'accommodation' | 'attraction' | 'food';
  [key: string]: any; // Pozwala na dodatkowe właściwości
}

export interface MapRoute {
  id: number;
  fromPlaceId: number;
  toPlaceId: number;
  waypoints?: number[]; // Punkty pośrednie (ID miejsc)
  travelMode?: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  polyline?: any; // Polyline obiekt z Google Maps API (dla ręcznych tras)
}

export type MapDisplayMode = 'compact' | 'sidebar' | 'full';

@Component({
  selector: 'app-google-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-map.html',
  styleUrl: './google-map.scss'
})
export class GoogleMapComponent implements AfterViewInit, OnDestroy {
  @Input() places: MapPlace[] = [];
  @Input() routes: MapRoute[] = []; // Trasy do wyświetlenia
  @Input() center: { lat: number; lng: number } = { lat: 52.2297, lng: 21.0122 }; // Warszawa
  @Input() zoom: number = 10;
  @Input() height: string = '100%';
  @Input() width: string = '100%';
  @Input() showControls: boolean = true;
  @Input() autoFitBounds: boolean = true;
  @Input() displayMode: MapDisplayMode = 'full';
  @Input() showRoutes: boolean = true; // Czy pokazywać trasy

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  map: any;
  markers: any[] = [];
  infoWindows: any[] = [];
  geocoder: any;
  directionsService: any;
  directionsRenderers: any[] = []; // Może być wiele tras
  isLoading: boolean = false;

  constructor(private googleMapsLoader: GoogleMapsLoaderService) {}

  ngAfterViewInit(): void {
    this.loadMap();
  }

  ngOnDestroy(): void {
    // Usuń wszystkie markery
    this.markers.forEach(marker => marker.setMap(null));
    this.infoWindows.forEach(infoWindow => infoWindow.close());
    // Usuń wszystkie renderery tras
    this.directionsRenderers.forEach(renderer => renderer.setMap(null));
    this.directionsRenderers = [];
  }

  loadMap(): void {
    this.isLoading = true;
    
    this.googleMapsLoader.loadGoogleMaps()
      .then(() => {
        // Poczekaj na renderowanie kontenera
        setTimeout(() => {
          this.initMap();
        }, 100);
      })
      .catch((error: any) => {
        console.error('Błąd ładowania Google Maps:', error);
        this.isLoading = false;
      });
  }

  initMap(): void {
    if (!this.mapContainer?.nativeElement) {
      this.isLoading = false;
      return;
    }

    // Inicjalizuj geocoder
    this.geocoder = new google.maps.Geocoder();

    // Inicjalizuj DirectionsService zgodnie z dokumentacją Google Maps API
    // https://developers.google.com/maps/documentation/javascript/directions
    this.directionsService = new google.maps.DirectionsService();

    // Inicjalizuj mapę
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      mapTypeControl: this.showControls,
      streetViewControl: this.showControls,
      fullscreenControl: this.showControls,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Dodaj markery dla miejsc
    if (this.places && this.places.length > 0) {
      this.addMarkers();
    }

    // Dodaj trasy jeśli są dostępne
    if (this.showRoutes && this.routes && this.routes.length > 0) {
      setTimeout(() => {
        this.addRoutes();
      }, 500); // Czekaj na geokodowanie markerów
    }

    this.isLoading = false;
  }

  addMarkers(): void {
    // Usuń istniejące markery
    this.markers.forEach(marker => marker.setMap(null));
    this.infoWindows.forEach(infoWindow => infoWindow.close());
    this.markers = [];
    this.infoWindows = [];

    // Pobierz tylko miejsca z adresami lub współrzędnymi
    const placesToShow = this.places.filter(place => 
      (place.address && place.address.trim() !== '') || 
      (place.lat && place.lng)
    );

    if (placesToShow.length === 0) return;

    // Dodaj markery
    placesToShow.forEach((place, index) => {
      if (place.lat && place.lng) {
        // Miejsce ma współrzędne - użyj ich bezpośrednio
        this.createMarker(place, { lat: place.lat, lng: place.lng }, index);
      } else if (place.address) {
        // Geokoduj adres
        this.geocodeAddress(place, index);
      }
    });

    // Jeśli są markery i autoFitBounds jest włączone, dostosuj widok
    if (placesToShow.length > 0 && this.autoFitBounds) {
      setTimeout(() => {
        this.fitMapToMarkers();
      }, 2000); // Czekaj na geokodowanie
    }
  }

  geocodeAddress(place: MapPlace, index: number): void {
    // Użycie Geocoder zgodnie z dokumentacją Google Maps JavaScript API
    // https://developers.google.com/maps/documentation/javascript/geocoding
    this.geocoder.geocode({ address: place.address }, (results: any, status: any) => {
      // Sprawdzenie statusu zgodnie z dokumentacją Google Maps Geocoding API
      // Status może być: 'OK', 'ZERO_RESULTS', 'OVER_QUERY_LIMIT', 'REQUEST_DENIED', 'INVALID_REQUEST'
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        this.createMarker(place, { lat: location.lat(), lng: location.lng() }, index);
      } else {
        console.warn('Geocoding failed for:', place.address, 'Status:', status);
      }
    });
  }

  createMarker(place: MapPlace, position: { lat: number; lng: number }, index: number): void {
    // Wybierz ikonę w zależności od typu miejsca
    // Używamy HTTPS zgodnie z najlepszymi praktykami bezpieczeństwa
    let iconUrl = '';
    if (place.placeType === 'accommodation') {
      iconUrl = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    } else if (place.placeType === 'attraction') {
      iconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    } else if (place.placeType === 'food') {
      iconUrl = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
    } else if (place.placeType === 'city') {
      iconUrl = 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    }

    const marker = new google.maps.Marker({
      position: position,
      map: this.map,
      title: place.name,
      icon: iconUrl || undefined,
      animation: google.maps.Animation.DROP
    });

    // Info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #52679C;">
            ${place.name}
          </h3>
          <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
            <strong>Adres:</strong> ${place.address || 'Brak adresu'}
          </p>
          ${place.placeType ? `<p style="margin: 0; color: #666; font-size: 12px;">
            <strong>Typ:</strong> ${this.getPlaceTypeLabel(place.placeType)}
          </p>` : ''}
        </div>
      `
    });

    marker.addListener('click', () => {
      // Zamknij wszystkie inne info windows
      this.infoWindows.forEach(iw => iw.close());
      infoWindow.open(this.map, marker);
    });

    this.markers.push(marker);
    this.infoWindows.push(infoWindow);
  }

  fitMapToMarkers(): void {
    if (this.markers.length === 0 || !this.map) return;

    const bounds = new google.maps.LatLngBounds();
    this.markers.forEach(marker => {
      bounds.extend(marker.getPosition());
    });

    // Jeśli jest tylko jeden marker, ustaw zoom
    if (this.markers.length === 1) {
      this.map.setCenter(this.markers[0].getPosition());
      this.map.setZoom(15);
    } else {
      this.map.fitBounds(bounds);
      // Dodaj padding
      this.map.setOptions({ padding: { top: 50, right: 50, bottom: 50, left: 50 } });
    }
  }

  getPlaceTypeLabel(placeType: string): string {
    const labels: Record<string, string> = {
      'country': 'Kraj',
      'city': 'Miasto',
      'accommodation': 'Nocleg',
      'attraction': 'Atrakcja',
      'food': 'Jedzenie'
    };
    return labels[placeType] || placeType;
  }

  // Metoda do aktualizacji miejsc (można wywołać z zewnątrz)
  updatePlaces(newPlaces: MapPlace[]): void {
    this.places = newPlaces;
    if (this.map) {
      this.addMarkers();
    } else {
      this.loadMap();
    }
  }

  // Metoda do ustawienia centrum mapy
  setCenter(lat: number, lng: number, zoom?: number): void {
    if (this.map) {
      this.map.setCenter({ lat, lng });
      if (zoom) {
        this.map.setZoom(zoom);
      }
    }
  }

  // ========== METODY DO TRAS ==========

  /**
   * Dodaje trasy na mapę używając DirectionsService
   * Zgodne z dokumentacją: https://developers.google.com/maps/documentation/javascript/directions
   */
  addRoutes(): void {
    if (!this.map || !this.directionsService || !this.routes || this.routes.length === 0) {
      return;
    }

    // Usuń istniejące trasy
    this.removeRoutes();

    // Dodaj każdą trasę
    this.routes.forEach(route => {
      this.addRoute(route);
    });
  }

  /**
   * Dodaje pojedynczą trasę na mapę
   */
  addRoute(route: MapRoute): void {
    if (!this.map || !this.directionsService) return;

    // Znajdź miejsca na trasie
    const fromPlace = this.places.find(p => p.id === route.fromPlaceId);
    const toPlace = this.places.find(p => p.id === route.toPlaceId);

    if (!fromPlace || !toPlace) {
      console.warn('Nie znaleziono miejsc dla trasy:', route);
      return;
    }

    // Przygotuj request zgodnie z dokumentacją Google Maps Directions API
    const request: any = {
      origin: fromPlace.lat && fromPlace.lng 
        ? { lat: fromPlace.lat, lng: fromPlace.lng }
        : fromPlace.address,
      destination: toPlace.lat && toPlace.lng
        ? { lat: toPlace.lat, lng: toPlace.lng }
        : toPlace.address,
      travelMode: route.travelMode ? google.maps.TravelMode[route.travelMode] : google.maps.TravelMode.DRIVING,
    };

    // Dodaj punkty pośrednie (waypoints) jeśli są
    if (route.waypoints && route.waypoints.length > 0) {
      const waypoints = route.waypoints
        .map(placeId => this.places.find(p => p.id === placeId))
        .filter(p => p !== undefined)
        .map(place => {
          if (place!.lat && place!.lng) {
            return {
              location: { lat: place!.lat, lng: place!.lng },
              stopover: true
            };
          } else {
            return {
              location: place!.address,
              stopover: true
            };
          }
        });

      if (waypoints.length > 0) {
        request.waypoints = waypoints;
      }
    }

    // Wywołaj DirectionsService zgodnie z dokumentacją
    this.directionsService.route(request, (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        // Utwórz DirectionsRenderer dla tej trasy
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: this.map,
          directions: result,
          suppressMarkers: false, // Pokaż markery na trasie
          preserveViewport: false // Automatycznie dopasuj widok
        });

        this.directionsRenderers.push(directionsRenderer);
      } else {
        console.warn('Błąd podczas wyznaczania trasy:', status);
      }
    });
  }

  /**
   * Usuwa wszystkie trasy z mapy
   */
  removeRoutes(): void {
    this.directionsRenderers.forEach(renderer => {
      renderer.setMap(null);
    });
    this.directionsRenderers = [];
  }

  /**
   * Aktualizuje trasy (usuwa stare i dodaje nowe)
   */
  updateRoutes(newRoutes: MapRoute[]): void {
    this.routes = newRoutes;
    if (this.map && this.directionsService) {
      this.addRoutes();
    }
  }
}

