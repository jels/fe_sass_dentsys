import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { BranchResponse, CreateBranchRequest, UpdateBranchRequest } from '../models/organization.models';

@Injectable({ providedIn: 'root' })
export class BranchService {
    private readonly API = `${environment.apiUrl}/branches`;

    constructor(private http: HttpClient) {}

    getAll(idCompany: number): Observable<ApiResponse<BranchResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<BranchResponse[]>>(this.API, { params });
    }

    getById(id: number): Observable<ApiResponse<BranchResponse>> {
        return this.http.get<ApiResponse<BranchResponse>>(`${this.API}/${id}`);
    }

    create(request: CreateBranchRequest): Observable<ApiResponse<BranchResponse>> {
        return this.http.post<ApiResponse<BranchResponse>>(this.API, request);
    }

    update(id: number, request: UpdateBranchRequest): Observable<ApiResponse<BranchResponse>> {
        return this.http.put<ApiResponse<BranchResponse>>(`${this.API}/${id}`, request);
    }

    toggleStatus(id: number): Observable<ApiResponse<BranchResponse>> {
        return this.http.patch<ApiResponse<BranchResponse>>(`${this.API}/${id}/toggle-status`, {});
    }
}
