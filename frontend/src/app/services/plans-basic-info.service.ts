import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PlansBasicInfo {
  planId: string;
  title: string | null;
  coverImageUrl: string | null;
  description: string | null;
  location: string | null;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  tripTypeId: string | null; // Guid jako string
  coverImgUrl: string | null;
  budgetAmount: number | null;
  budgetCurrency: string | null;
  notes: string | null;
}

export interface UpdatePlansBasicInfo {
  title?: string | null;
  coverImageUrl?: string | null;
  description?: string | null;
  location?: string | null;
  destination?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  tripTypeId?: string | null; // Guid jako string
  coverImgUrl?: string | null;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PlansBasicInfoService {
  private apiUrl = `${environment.apiUrl}/plans`;

  constructor(private http: HttpClient) {}

  /**
   * Pobiera podstawowe informacje planu
   */
  getBasicInfo(planId: string): Observable<PlansBasicInfo> {
    return this.http.get<PlansBasicInfo>(`${this.apiUrl}/${planId}/basic-info`);
  }

  /**
   * Aktualizuje podstawowe informacje planu
   */
  updateBasicInfo(planId: string, data: UpdatePlansBasicInfo): Observable<PlansBasicInfo> {
    return this.http.put<PlansBasicInfo>(`${this.apiUrl}/${planId}/basic-info`, data);
  }
}

