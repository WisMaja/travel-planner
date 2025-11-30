import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Deklaracja globalnego obiektu google z Google Maps API
 * Źródło: https://developers.google.com/maps/documentation/javascript/reference
 */
declare var google: any;

/**
 * Serwis do ładowania Google Maps JavaScript API
 * 
 * Źródła dokumentacji:
 * - Główne API: https://developers.google.com/maps/documentation/javascript/overview
 * - Ładowanie API: https://developers.google.com/maps/documentation/javascript/load-maps-js-api
 * - Biblioteki: https://developers.google.com/maps/documentation/javascript/libraries
 * 
 * Funkcjonalności:
 * - Dynamiczne ładowanie Google Maps API tylko gdy jest potrzebne
 * - Zapobieganie wielokrotnemu ładowaniu (singleton pattern)
 * - Obsługa callback dla asynchronicznego ładowania
 * - Ładowanie dodatkowych bibliotek: places, geometry
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  /**
   * Flaga wskazująca czy Google Maps API zostało już załadowane
   * Zapobiega wielokrotnemu ładowaniu tego samego skryptu
   */
  private isLoaded = false;

  /**
   * Promise dla procesu ładowania API
   * Umożliwia wielu komponentom oczekiwanie na to samo ładowanie
   * (wzorzec singleton - wszystkie komponenty dostaną ten sam Promise)
   */
  private loadPromise: Promise<void> | null = null;

  /**
   * Nazwa globalnej funkcji callback
   * Google Maps API wywołuje tę funkcję po załadowaniu
   * Źródło: https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic-library-import
   */
  private readonly callbackName = 'initGoogleMapsLoader';

  /**
   * Ładuje Google Maps JavaScript API dynamicznie
   * 
   * Metoda implementuje wzorzec singleton - jeśli API jest już załadowane lub w trakcie ładowania,
   * zwraca istniejący Promise zamiast ładować ponownie.
   * 
   * Źródło dokumentacji:
   * https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic-library-import
   * 
   * @returns Promise<void> - rozwiązuje się gdy API jest gotowe do użycia
   */
  loadGoogleMaps(): Promise<void> {
    // Jeśli API jest już załadowane, zwróć natychmiast rozwiązany Promise
    if (this.isLoaded) {
      return Promise.resolve();
    }

    // Jeśli ładowanie już trwa, zwróć istniejący Promise (singleton pattern)
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Utwórz nowy Promise dla procesu ładowania
    this.loadPromise = new Promise<void>((resolve, reject) => {
      /**
       * Sprawdź, czy Google Maps API jest już załadowane globalnie
       * Może się zdarzyć, że inny skrypt już załadował API
       * Źródło: https://developers.google.com/maps/documentation/javascript/overview
       */
      if (typeof google !== 'undefined' && google.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      /**
       * Utwórz globalną funkcję callback zgodnie z dokumentacją Google Maps API
       * Ta funkcja zostanie wywołana przez Google Maps API po załadowaniu skryptu
       * 
       * Źródło: https://developers.google.com/maps/documentation/javascript/load-maps-js-api#callback-parameter
       */
      (window as any)[this.callbackName] = () => {
        // Sprawdź czy obiekt google.maps jest dostępny po załadowaniu
        if (typeof google !== 'undefined' && google.maps) {
          this.isLoaded = true;
          // Usuń funkcję callback z window (cleanup)
          delete (window as any)[this.callbackName];
          resolve();
        } else {
          // Jeśli API się załadowało, ale obiekt nie jest dostępny - błąd
          delete (window as any)[this.callbackName];
          reject(new Error('Google Maps API załadowane, ale obiekt google.maps nie jest dostępny.'));
        }
      };

      /**
       * Utwórz element <script> do dynamicznego ładowania Google Maps API
       * 
       * Parametry URL:
       * - key: Klucz API z environment.ts (wymagany do użycia API)
       * - libraries: Dodatkowe biblioteki do załadowania:
       *   * places: Autouzupełnianie miejsc (Places Autocomplete), wyszukiwanie miejsc
       *     Źródło: https://developers.google.com/maps/documentation/javascript/places
       *   * geometry: Operacje geometryczne (odległości, obszary, ścieżki)
       *     Źródło: https://developers.google.com/maps/documentation/javascript/geometry
       * - callback: Nazwa funkcji do wywołania po załadowaniu
       * 
       * Uwaga: Geocoding (konwersja adresów na współrzędne) jest częścią głównego API
       * i nie wymaga osobnej biblioteki.
       * 
       * Źródło: https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic-library-import
       */
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true; // Asynchroniczne ładowanie - nie blokuje renderowania strony
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places,geometry&callback=${this.callbackName}`;
      
      /**
       * Obsługa błędu ładowania skryptu
       * Może wystąpić gdy:
       * - Klucz API jest nieprawidłowy
       * - Brak połączenia z internetem
       * - Ograniczenia API (quota, domain restrictions)
       */
      script.onerror = () => {
        delete (window as any)[this.callbackName];
        reject(new Error('Nie udało się załadować Google Maps API.'));
      };

      // Dodaj skrypt do <head> dokumentu, co rozpocznie ładowanie API
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Sprawdza czy Google Maps API jest już załadowane
   * 
   * Użyteczne do warunkowego renderowania komponentów mapy
   * lub wyświetlania komunikatów o stanie ładowania
   * 
   * @returns boolean - true jeśli API jest dostępne
   */
  isGoogleMapsLoaded(): boolean {
    return this.isLoaded || (typeof google !== 'undefined' && google.maps);
  }
}

