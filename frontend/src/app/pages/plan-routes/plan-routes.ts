import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SharedImports } from '../../shared/shared-imports/shared-imports';
import { Button } from '../components/ui/buttons/button/button';
import { FormIcon } from '../components/ui/form-icon/form-icon';
import { TopBarPlan } from '../components/plan/top-bar-plan/top-bar-plan';
import { GoogleMapComponent, MapPlace } from '../components/maps/google-map/google-map';

type TransportMode = 'car' | 'train' | 'plane' | 'bus' | 'walk' | 'bike' | 'other';

interface Place {
  id: number;
  name: string;
  address: string;
}

interface RouteSegment {
  fromPlaceId: number;
  toPlaceId: number;
  transportMode: TransportMode;
  duration?: string;
  distance?: string;
  cost?: number;
  currency?: string;
}

interface Route {
  id: number;
  fromPlaceId: number;
  toPlaceId: number;
  waypoints?: number[];
  segments: RouteSegment[]; // Każdy segment ma swój tryb transportu
  duration?: string; // Całkowity czas (opcjonalny)
  distance?: string; // Całkowity dystans (opcjonalny)
  cost?: number; // Całkowity koszt (opcjonalny)
  currency?: string;
  notes?: string;
  order?: number;
}

@Component({
  selector: 'app-plan-routes',
  imports: [CommonModule, RouterModule, SharedImports, Button, FormIcon, TopBarPlan, GoogleMapComponent],
  templateUrl: './plan-routes.html',
  styleUrl: './plan-routes.scss',
})
export class PlanRoutes implements OnInit {
  planId: string | null = null;

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
      this.router.navigate(['/plan/routes/edit'], {
        queryParams: { planId: this.planId }
      });
    } else {
      this.router.navigate(['/plan/routes/edit']);
    }
  }

  // Przykładowe miejsca - w przyszłości będą pobierane z serwisu
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

  // Przykładowe trasy - w przyszłości będą pobierane z serwisu
  routes: Route[] = [
    {
      id: 1,
      fromPlaceId: 101,
      toPlaceId: 105,
      waypoints: [102, 103],
      segments: [
        {
          fromPlaceId: 101,
          toPlaceId: 102,
          transportMode: 'walk',
          duration: '10min',
          distance: '0.5 km'
        },
        {
          fromPlaceId: 102,
          toPlaceId: 103,
          transportMode: 'walk',
          duration: '15min',
          distance: '0.8 km'
        },
        {
          fromPlaceId: 103,
          toPlaceId: 105,
          transportMode: 'train',
          duration: '2h 30min',
          distance: '295 km',
          cost: 89,
          currency: 'PLN'
        }
      ],
      duration: '2h 55min',
      distance: '296.3 km',
      cost: 89,
      currency: 'PLN',
      notes: 'PKP Intercity, rezerwacja miejsca',
      order: 1
    },
    {
      id: 2,
      fromPlaceId: 102,
      toPlaceId: 103,
      segments: [
        {
          fromPlaceId: 102,
          toPlaceId: 103,
          transportMode: 'walk',
          duration: '15min',
          distance: '0.8 km'
        }
      ],
      duration: '15min',
      distance: '0.8 km',
      order: 2
    },
    {
      id: 3,
      fromPlaceId: 200,
      toPlaceId: 201,
      segments: [
        {
          fromPlaceId: 200,
          toPlaceId: 201,
          transportMode: 'plane',
          duration: '1h 45min',
          distance: '1300 km',
          cost: 450,
          currency: 'EUR'
        }
      ],
      duration: '1h 45min',
      distance: '1300 km',
      cost: 450,
      currency: 'EUR',
      notes: 'Lot bezpośredni z Warszawy',
      order: 3
    },
    {
      id: 4,
      fromPlaceId: 201,
      toPlaceId: 205,
      waypoints: [202],
      segments: [
        {
          fromPlaceId: 201,
          toPlaceId: 202,
          transportMode: 'walk',
          duration: '20min',
          distance: '1.2 km'
        },
        {
          fromPlaceId: 202,
          toPlaceId: 205,
          transportMode: 'train',
          duration: '3h 20min',
          distance: '525 km',
          cost: 35,
          currency: 'EUR'
        }
      ],
      duration: '3h 40min',
      distance: '526.2 km',
      cost: 35,
      currency: 'EUR',
      notes: 'Pociąg regionalny',
      order: 4
    }
  ];

  getPlaceName(placeId: number): string {
    const place = this.availablePlaces.find(p => p.id === placeId);
    return place?.name || 'Nieznane miejsce';
  }

  getPlaceAddress(placeId: number): string {
    const place = this.availablePlaces.find(p => p.id === placeId);
    return place?.address || '';
  }


  getTransportName(mode: TransportMode): string {
    const names: Record<TransportMode, string> = {
      'car': 'Samochód',
      'train': 'Pociąg',
      'plane': 'Samolot',
      'bus': 'Autobus',
      'walk': 'Pieszo',
      'bike': 'Rower',
      'other': 'Inne'
    };
    return names[mode] || 'Inne';
  }

  // Pobiera wszystkie miejsca w trasie w kolejności
  getRoutePlaces(route: Route): number[] {
    const places: number[] = [route.fromPlaceId];
    if (route.waypoints) {
      places.push(...route.waypoints);
    }
    places.push(route.toPlaceId);
    return places;
  }

  // Pobiera segment dla danego odcinka (from -> to)
  getSegmentForPath(route: Route, fromPlaceId: number, toPlaceId: number): RouteSegment | undefined {
    return route.segments.find(seg => seg.fromPlaceId === fromPlaceId && seg.toPlaceId === toPlaceId);
  }

  // Mapa - miejsca do wyświetlenia
  get placesForMap(): MapPlace[] {
    const places: MapPlace[] = [];
    const placeIds = new Set<number>();

    // Dodaj wszystkie miejsca z tras
    this.routes.forEach(route => {
      if (!placeIds.has(route.fromPlaceId)) {
        placeIds.add(route.fromPlaceId);
        const place = this.availablePlaces.find(p => p.id === route.fromPlaceId);
        if (place) {
          places.push({
            id: place.id,
            name: place.name,
            address: place.address,
            placeType: 'city'
          });
        }
      }
      if (!placeIds.has(route.toPlaceId)) {
        placeIds.add(route.toPlaceId);
        const place = this.availablePlaces.find(p => p.id === route.toPlaceId);
        if (place) {
          places.push({
            id: place.id,
            name: place.name,
            address: place.address,
            placeType: 'city'
          });
        }
      }
      if (route.waypoints) {
        route.waypoints.forEach(waypointId => {
          if (!placeIds.has(waypointId)) {
            placeIds.add(waypointId);
            const place = this.availablePlaces.find(p => p.id === waypointId);
            if (place) {
              places.push({
                id: place.id,
                name: place.name,
                address: place.address,
                placeType: 'city'
              });
            }
          }
        });
      }
    });

    return places;
  }
}
