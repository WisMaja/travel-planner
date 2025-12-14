import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = environment.apiUrl?.replace('/api', '') || 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  /**
   * Uploaduje plik obrazu
   * @param file Plik do przesłania
   * @returns Observable z odpowiedzią zawierającą URL przesłanego pliku
   */
  uploadFile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/api/files/upload`, formData);
  }

  /**
   * Usuwa plik
   * @param fileName Nazwa pliku do usunięcia
   */
  deleteFile(fileName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/files/delete/${fileName}`);
  }

  /**
   * Sprawdza czy URL jest lokalnym plikiem (z uploads)
   */
  isLocalFile(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.startsWith('/uploads/') || url.includes('/uploads/');
  }

  /**
   * Pobiera nazwę pliku z URL
   */
  getFileNameFromUrl(url: string): string | null {
    if (!this.isLocalFile(url)) return null;
    const parts = url.split('/');
    return parts[parts.length - 1] || null;
  }
}


