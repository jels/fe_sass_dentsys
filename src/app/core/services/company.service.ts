import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { CompanyResponse, CreateCompanyRequest, UpdateCompanyRequest } from '../models/organization.models';

@Injectable({ providedIn: 'root' })
export class CompanyService {
    private readonly API = `${environment.apiUrl}/companies`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<ApiResponse<CompanyResponse[]>> {
        return this.http.get<ApiResponse<CompanyResponse[]>>(this.API);
    }

    getById(id: number): Observable<ApiResponse<CompanyResponse>> {
        return this.http.get<ApiResponse<CompanyResponse>>(`${this.API}/${id}`);
    }

    create(request: CreateCompanyRequest): Observable<ApiResponse<CompanyResponse>> {
        return this.http.post<ApiResponse<CompanyResponse>>(this.API, request);
    }

    update(id: number, request: UpdateCompanyRequest): Observable<ApiResponse<CompanyResponse>> {
        return this.http.put<ApiResponse<CompanyResponse>>(`${this.API}/${id}`, request);
    }

    toggleStatus(id: number): Observable<ApiResponse<CompanyResponse>> {
        return this.http.patch<ApiResponse<CompanyResponse>>(`${this.API}/${id}/toggle-status`, {});
    }
}
