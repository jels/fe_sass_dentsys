import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { CreateDentistRequest, DentistResponse, UpdateDentistRequest } from '../models/catalogs.models';

@Injectable({ providedIn: 'root' })
export class DentistService {
    private readonly API = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) {}

    getAll(idCompany: number, idBranch?: number): Observable<ApiResponse<DentistResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (idBranch) params = params.set('idBranch', idBranch);
        return this.http.get<ApiResponse<DentistResponse[]>>(this.API, { params });
    }

    getById(id: number): Observable<ApiResponse<DentistResponse>> {
        return this.http.get<ApiResponse<DentistResponse>>(`${this.API}/${id}`);
    }

    create(request: CreateDentistRequest): Observable<ApiResponse<DentistResponse>> {
        return this.http.post<ApiResponse<DentistResponse>>(this.API, request);
    }

    update(id: number, request: UpdateDentistRequest): Observable<ApiResponse<DentistResponse>> {
        return this.http.put<ApiResponse<DentistResponse>>(`${this.API}/${id}`, request);
    }

    toggleStatus(id: number): Observable<ApiResponse<DentistResponse>> {
        return this.http.patch<ApiResponse<DentistResponse>>(`${this.API}/${id}/toggle-status`, {});
    }
}
