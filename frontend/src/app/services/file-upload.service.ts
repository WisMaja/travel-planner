import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  deleteFile(fileName: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${encodeURIComponent(fileName)}`);
  }

  isLocalFile(url?: string | null): boolean {
    if (!url) return false;
    return url.startsWith('/uploads/') || url.includes('/uploads/');
  }
}
