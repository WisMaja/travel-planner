import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapComponent, MapPlace, MapRoute } from '../components/maps/google-map/google-map';
import { PlacesAutocompleteComponent, PlaceResult } from '../components/maps/places-autocomplete/places-autocomplete';

@Component({
  selector: 'app-map-test',
  standalone: true,
  imports: [CommonModule, GoogleMapComponent, PlacesAutocompleteComponent],
  templateUrl: './map-test.html',
  styleUrl: './map-test.scss'
})
export class MapTest {
  mapSearchValue: string = '';
  // Przykładowe miejsca
  placesForMap: MapPlace[] = [
    {
      id: 1,
      name: 'Warszawa',
      address: 'Warszawa, Polska',
      lat: 52.2297,
      lng: 21.0122,
      placeType: 'city'
    },
    {
      id: 2,
      name: 'Kraków',
      address: 'Kraków, Polska',
      lat: 50.0647,
      lng: 19.9450,
      placeType: 'city'
    },
    {
      id: 3,
      name: 'Gdańsk',
      address: 'Gdańsk, Polska',
      lat: 54.3520,
      lng: 18.6466,
      placeType: 'city'
    },
    {
      id: 4,
      name: 'Zamek Królewski',
      address: 'Plac Zamkowy 4, Warszawa',
      lat: 52.2478,
      lng: 21.0144,
      placeType: 'attraction'
    },
    {
      id: 5,
      name: 'Hotel Bristol',
      address: 'ul. Krakowskie Przedmieście 42/44, Warszawa',
      lat: 52.2396,
      lng: 21.0128,
      placeType: 'accommodation'
    },
    {
      id: 6,
      name: 'Wawel',
      address: 'Wawel 5, Kraków',
      lat: 50.0547,
      lng: 19.9354,
      placeType: 'attraction'
    }
  ];

  // Przykładowe trasy
  routesForMap: MapRoute[] = [
    {
      id: 1,
      fromPlaceId: 1, // Warszawa
      toPlaceId: 2,   // Kraków
      travelMode: 'DRIVING'
    },
    {
      id: 2,
      fromPlaceId: 2, // Kraków
      toPlaceId: 3,   // Gdańsk
      travelMode: 'DRIVING'
    },
    {
      id: 3,
      fromPlaceId: 1, // Warszawa
      toPlaceId: 4,   // Zamek Królewski
      travelMode: 'WALKING'
    },
    {
      id: 4,
      fromPlaceId: 1, // Warszawa
      toPlaceId: 5,   // Hotel Bristol
      travelMode: 'WALKING'
    },
    {
      id: 5,
      fromPlaceId: 2, // Kraków
      toPlaceId: 6,   // Wawel
      travelMode: 'WALKING'
    }
  ];

  // Metody do obsługi wyszukiwania miejsc
  onPlaceSelected(place: PlaceResult): void {
    console.log('Miejsce wybrane:', place);
    
    // Dodaj miejsce do mapy
    if (place.lat && place.lng) {
      const newPlace: MapPlace = {
        id: Date.now(),
        name: place.name,
        address: place.formattedAddress || place.address,
        lat: place.lat,
        lng: place.lng,
        placeType: this.determinePlaceType(place.types || [])
      };
      
      // Sprawdź czy miejsce już istnieje (po współrzędnych)
      const exists = this.placesForMap.some(p => 
        p.lat === newPlace.lat && p.lng === newPlace.lng
      );
      
      if (!exists) {
        this.placesForMap = [...this.placesForMap, newPlace];
      }
    }
  }

  onPlacePreview(place: PlaceResult): void {
    console.log('Podgląd miejsca:', place);
  }

  onMapSearchValueChange(value: string): void {
    this.mapSearchValue = value;
  }

  onSearchError(error: string): void {
    console.error('Błąd wyszukiwania:', error);
  }

  // Określa typ miejsca na podstawie typów z Google Places API
  private determinePlaceType(types: string[]): 'country' | 'city' | 'accommodation' | 'attraction' | 'food' {
    if (types.includes('country')) return 'country';
    if (types.includes('locality') || types.includes('administrative_area_level_1')) return 'city';
    if (types.includes('lodging') || types.includes('hotel')) return 'accommodation';
    if (types.includes('restaurant') || types.includes('food') || types.includes('cafe')) return 'food';
    if (types.includes('tourist_attraction') || types.includes('point_of_interest')) return 'attraction';
    return 'attraction'; // domyślnie
  }
}

