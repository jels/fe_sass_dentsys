import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { CreateTreatmentRequest, TreatmentResponse, UpdateTreatmentRequest } from '../models/catalogs.models';

@Injectable({ providedIn: 'root' })
export class TreatmentService {
    private readonly API = `${environment.apiUrl}/treatments`;

    constructor(private http: HttpClient) {}

    getAll(idCompany: number, category?: string): Observable<ApiResponse<TreatmentResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (category) params = params.set('category', category);
        return this.http.get<ApiResponse<TreatmentResponse[]>>(this.API, { params });
    }

    getById(id: number): Observable<ApiResponse<TreatmentResponse>> {
        return this.http.get<ApiResponse<TreatmentResponse>>(`${this.API}/${id}`);
    }

    create(request: CreateTreatmentRequest): Observable<ApiResponse<TreatmentResponse>> {
        return this.http.post<ApiResponse<TreatmentResponse>>(this.API, request);
    }

    update(id: number, request: UpdateTreatmentRequest): Observable<ApiResponse<TreatmentResponse>> {
        return this.http.put<ApiResponse<TreatmentResponse>>(`${this.API}/${id}`, request);
    }

    toggleStatus(id: number): Observable<ApiResponse<TreatmentResponse>> {
        return this.http.patch<ApiResponse<TreatmentResponse>>(`${this.API}/${id}/toggle-status`, {});
    }
}
