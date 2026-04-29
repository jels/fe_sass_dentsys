import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { CreateStampRequest, StampResponse, UpdateStampRequest } from '../models/catalogs.models';

@Injectable({ providedIn: 'root' })
export class StampService {
    private readonly API = `${environment.apiUrl}/stamps`;

    constructor(private http: HttpClient) {}

    getAll(idCompany: number, onlyActive?: boolean): Observable<ApiResponse<StampResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (onlyActive !== undefined) params = params.set('onlyActive', onlyActive);
        return this.http.get<ApiResponse<StampResponse[]>>(this.API, { params });
    }

    getById(id: number): Observable<ApiResponse<StampResponse>> {
        return this.http.get<ApiResponse<StampResponse>>(`${this.API}/${id}`);
    }

    create(request: CreateStampRequest): Observable<ApiResponse<StampResponse>> {
        return this.http.post<ApiResponse<StampResponse>>(this.API, request);
    }

    update(id: number, request: UpdateStampRequest): Observable<ApiResponse<StampResponse>> {
        return this.http.put<ApiResponse<StampResponse>>(`${this.API}/${id}`, request);
    }

    toggleStatus(id: number): Observable<ApiResponse<StampResponse>> {
        return this.http.patch<ApiResponse<StampResponse>>(`${this.API}/${id}/toggle-status`, {});
    }
}
