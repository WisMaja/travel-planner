import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Plan {
  plansId: string;
  ownerId: string;
  title: string | null;
  statusId: number;
  statusName: string | null;
  isPublic: boolean;
  coverImageUrl: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  deletedAtUtc: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  private apiUrl = `${environment.apiUrl}/plans`;

  constructor(private http: HttpClient) {}

  /**
   * Pobiera wszystkie plany aktualnie zalogowanego użytkownika
   */
  getMyPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/me`);
  }

  /**
   * Pobiera plan po ID
   */
  getPlanById(planId: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/${planId}`);
  }

  /**
   * Tworzy nowy pusty plan dla zalogowanego użytkownika
   */
  createEmptyPlan(): Observable<Plan> {
    return this.http.post<Plan>(`${this.apiUrl}/create-empty`, {});
  }
}

