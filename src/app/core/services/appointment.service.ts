import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppointmentResponse, CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentFilters, AppointmentStatus } from '../models/clinical.models';
import { ApiResponse } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
    private readonly API = `${environment.apiUrl}/appointments`;

    constructor(private http: HttpClient) {}

    getAll(idCompany: number, filters: AppointmentFilters = {}): Observable<ApiResponse<AppointmentResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
        if (filters.idDoctor) params = params.set('idDoctor', filters.idDoctor);
        if (filters.idPatient) params = params.set('idPatient', filters.idPatient);
        if (filters.status) params = params.set('status', filters.status);
        if (filters.idBranch) params = params.set('idBranch', filters.idBranch);
        return this.http.get<ApiResponse<AppointmentResponse[]>>(this.API, { params });
    }

    getById(id: number): Observable<ApiResponse<AppointmentResponse>> {
        return this.http.get<ApiResponse<AppointmentResponse>>(`${this.API}/${id}`);
    }

    create(request: CreateAppointmentRequest): Observable<ApiResponse<AppointmentResponse>> {
        return this.http.post<ApiResponse<AppointmentResponse>>(this.API, request);
    }

    update(id: number, request: UpdateAppointmentRequest): Observable<ApiResponse<AppointmentResponse>> {
        return this.http.put<ApiResponse<AppointmentResponse>>(`${this.API}/${id}`, request);
    }

    changeStatus(id: number, status: AppointmentStatus): Observable<ApiResponse<AppointmentResponse>> {
        return this.http.patch<ApiResponse<AppointmentResponse>>(`${this.API}/${id}/status`, { status });
    }

    cancel(id: number, reason?: string): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(`${this.API}/${id}/cancel`, { reason });
    }
}
