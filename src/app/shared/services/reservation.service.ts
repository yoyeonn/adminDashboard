import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ReservationDTO } from '../models/reservation-dto';

type ApiResponse<T> = {
  ok?: boolean;
  status?: number;
  message?: string;
  data: T;
};

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private adminBaseUrl = 'http://localhost:9090/api/admin/reservations';
  private userBaseUrl = 'http://localhost:9090/api/reservations';

  constructor(private http: HttpClient) {}

  getAllAdmin(): Observable<ReservationDTO[]> {
  return this.http
    .get<ApiResponse<ReservationDTO[]>>(`${this.adminBaseUrl}/hotels`, {
      headers: this.authHeaders(),
    })
    .pipe(
      map((res) => (res.data ?? []).map((x) => ({ ...x, type: 'HOTEL' as const })))
    );
}

  getByIdAdmin(id: number): Observable<ReservationDTO> {
    return this.http
      .get<ApiResponse<ReservationDTO>>(`${this.adminBaseUrl}/hotels/${id}`, {
        headers: this.authHeaders(),
      })
      .pipe(map((res) => res.data as ReservationDTO));
  }

  // ✅ USER invoice (owner only)
  getInvoiceJson(id: number) {
    return this.http.get<any>(`${this.userBaseUrl}/${id}/invoice`, {
      headers: this.authHeaders(),
    });
  }

  // ✅ ADMIN invoice (works in admin reservation detail)
  getInvoiceJsonAdmin(id: number) {
    return this.http.get<any>(`${this.adminBaseUrl}/hotels/${id}/invoice`, {
      headers: this.authHeaders(),
    });
  }

  // ✅ USER pdf (owner only)
  downloadInvoicePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.userBaseUrl}/${id}/invoice.pdf`, {
      headers: this.authHeaders(),
      responseType: 'blob',
    });
  }

  // ✅ ADMIN pdf (works in admin reservation detail)
  downloadInvoicePdfAdmin(id: number): Observable<Blob> {
    return this.http.get(`${this.adminBaseUrl}/hotels/${id}/invoice.pdf`, {
      headers: this.authHeaders(),
      responseType: 'blob',
    });
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAllAdminDestinations(): Observable<ReservationDTO[]> {
  return this.http
    .get<ApiResponse<ReservationDTO[]>>(`${this.adminBaseUrl}/destinations`, {
      headers: this.authHeaders(),
    })
    .pipe(
      map((res) => (res.data ?? []).map((x) => ({ ...x, type: 'DESTINATION' as const })))
    );
}

getByIdAdminDestination(id: number): Observable<ReservationDTO> {
    return this.http
      .get<ApiResponse<ReservationDTO>>(`${this.adminBaseUrl}/destinations/${id}`, {
        headers: this.authHeaders(),
      })
      .pipe(map((res) => ({ ...(res.data as ReservationDTO), type: 'DESTINATION' as const })));
  }

  getAllAdminPacks(): Observable<ReservationDTO[]> {
  return this.http
    .get<ApiResponse<ReservationDTO[]>>(`${this.adminBaseUrl}/packs`, {
      headers: this.authHeaders(),
    })
    .pipe(map(res => (res.data ?? []).map(x => ({ ...x, type: 'PACK' as const }))));
}

getByIdAdminPack(id: number): Observable<any> {
  return this.http
    .get<ApiResponse<any>>(`${this.adminBaseUrl}/packs/${id}`, {
      headers: this.authHeaders(),
    })
    .pipe(map(res => res.data));
}

getInvoiceJsonAdminPack(id: number) {
  return this.http.get<any>(`${this.adminBaseUrl}/packs/${id}/invoice`, {
    headers: this.authHeaders(),
  });
}
}
