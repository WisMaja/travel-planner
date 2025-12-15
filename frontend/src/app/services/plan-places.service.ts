import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PlanPlaceDto {
  plansPlacesId: string;
  plansId: string;
  placesId: string;
  name?: string | null;
  kind?: string | null;
  level: number;
  parentId?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  deletedAtUtc?: string | null;
  place?: {
    placesId: string;
    name?: string | null;
    address?: string | null;
    imageUrl?: string | null;
    lat?: number | null;
    lng?: number | null;
  };
  children?: PlanPlaceDto[];
}

@Injectable({
  providedIn: 'root'
})
export class PlanPlacesService {
  private apiUrl = `${environment.apiUrl}/plans`;

  constructor(private http: HttpClient) {}

  getPlanPlaces(planId: string): Observable<PlanPlaceDto[]> {
    return this.http.get<PlanPlaceDto[]>(`${this.apiUrl}/${planId}/places`);
  }

  getPlanPlace(planId: string, plansPlacesId: string): Observable<PlanPlaceDto> {
    return this.http.get<PlanPlaceDto>(`${this.apiUrl}/${planId}/places/${plansPlacesId}`);
  }

  createPlanPlace(planId: string, body: Partial<PlanPlaceDto>) {
    return this.http.post<PlanPlaceDto>(`${this.apiUrl}/${planId}/places`, body);
  }

  updatePlanPlace(planId: string, plansPlacesId: string, body: Partial<PlanPlaceDto>) {
    return this.http.put<PlanPlaceDto>(`${this.apiUrl}/${planId}/places/${plansPlacesId}`, body);
  }

  deletePlanPlace(planId: string, plansPlacesId: string) {
    return this.http.delete<void>(`${this.apiUrl}/${planId}/places/${plansPlacesId}`);
  }
}
