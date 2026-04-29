import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { PerformedTreatmentResponse, CreatePerformedTreatmentRequest, UpdatePerformedTreatmentRequest, PerformedTreatmentStatus } from '../models/clinical.models';

@Injectable({ providedIn: 'root' })
export class PerformedTreatmentService {
    private readonly API = `${environment.apiUrl}/performed-treatments`;

    constructor(private http: HttpClient) {}

    getAll(idCompany: number, filters: { idPatient?: number; idDoctor?: number; dateFrom?: string; dateTo?: string; status?: PerformedTreatmentStatus } = {}): Observable<ApiResponse<PerformedTreatmentResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (filters.idPatient) params = params.set('idPatient', filters.idPatient);
        if (filters.idDoctor) params = params.set('idDoctor', filters.idDoctor);
        if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
        if (filters.status) params = params.set('status', filters.status);
        return this.http.get<ApiResponse<PerformedTreatmentResponse[]>>(this.API, { params });
    }

    getById(id: number): Observable<ApiResponse<PerformedTreatmentResponse>> {
        return this.http.get<ApiResponse<PerformedTreatmentResponse>>(`${this.API}/${id}`);
    }

    create(request: CreatePerformedTreatmentRequest): Observable<ApiResponse<PerformedTreatmentResponse>> {
        return this.http.post<ApiResponse<PerformedTreatmentResponse>>(this.API, request);
    }

    update(id: number, request: UpdatePerformedTreatmentRequest): Observable<ApiResponse<PerformedTreatmentResponse>> {
        return this.http.put<ApiResponse<PerformedTreatmentResponse>>(`${this.API}/${id}`, request);
    }

    cancel(id: number): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(`${this.API}/${id}/cancel`, {});
    }
}
