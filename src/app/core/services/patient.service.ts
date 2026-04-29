import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePatientRequest, PatientFilters, PatientResponse, UpdatePatientRequest } from '../models/clinical.models';
import { ApiResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PatientService {
    private readonly API = `${environment.apiUrl}/patients`;

    constructor(private http: HttpClient) {}

    getAll(idCompany: number, filters: PatientFilters = {}): Observable<ApiResponse<PatientResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (filters.search) params = params.set('search', filters.search);
        if (filters.gender) params = params.set('gender', filters.gender);
        if (filters.active !== undefined) params = params.set('active', filters.active);
        return this.http.get<ApiResponse<PatientResponse[]>>(this.API, { params });
    }

    getById(id: number): Observable<ApiResponse<PatientResponse>> {
        return this.http.get<ApiResponse<PatientResponse>>(`${this.API}/${id}`);
    }

    create(request: CreatePatientRequest): Observable<ApiResponse<PatientResponse>> {
        return this.http.post<ApiResponse<PatientResponse>>(this.API, request);
    }

    update(id: number, request: UpdatePatientRequest): Observable<ApiResponse<PatientResponse>> {
        return this.http.put<ApiResponse<PatientResponse>>(`${this.API}/${id}`, request);
    }

    toggleStatus(id: number): Observable<ApiResponse<PatientResponse>> {
        return this.http.patch<ApiResponse<PatientResponse>>(`${this.API}/${id}/toggle-status`, {});
    }
}
