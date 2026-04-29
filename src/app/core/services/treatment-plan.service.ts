import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { TreatmentPlanResponse, CreateTreatmentPlanRequest, UpdateTreatmentPlanRequest, TreatmentPlanStatus, AddPlanItemRequest, TreatmentPlanItemResponse } from '../models/clinical.models';

@Injectable({ providedIn: 'root' })
export class TreatmentPlanService {
    private readonly API = `${environment.apiUrl}/treatment-plans`;

    constructor(private http: HttpClient) {}

    getAll(idCompany: number, idPatient?: number, status?: TreatmentPlanStatus): Observable<ApiResponse<TreatmentPlanResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (idPatient) params = params.set('idPatient', idPatient);
        if (status) params = params.set('status', status);
        return this.http.get<ApiResponse<TreatmentPlanResponse[]>>(this.API, { params });
    }

    getById(id: number): Observable<ApiResponse<TreatmentPlanResponse>> {
        return this.http.get<ApiResponse<TreatmentPlanResponse>>(`${this.API}/${id}`);
    }

    create(request: CreateTreatmentPlanRequest): Observable<ApiResponse<TreatmentPlanResponse>> {
        return this.http.post<ApiResponse<TreatmentPlanResponse>>(this.API, request);
    }

    update(id: number, request: UpdateTreatmentPlanRequest): Observable<ApiResponse<TreatmentPlanResponse>> {
        return this.http.put<ApiResponse<TreatmentPlanResponse>>(`${this.API}/${id}`, request);
    }

    changeStatus(id: number, status: TreatmentPlanStatus): Observable<ApiResponse<TreatmentPlanResponse>> {
        return this.http.patch<ApiResponse<TreatmentPlanResponse>>(`${this.API}/${id}/status`, { status });
    }

    // ── Items ─────────────────────────────────────────────────────────────────

    addItem(idPlan: number, request: AddPlanItemRequest): Observable<ApiResponse<TreatmentPlanItemResponse>> {
        return this.http.post<ApiResponse<TreatmentPlanItemResponse>>(`${this.API}/${idPlan}/items`, request);
    }

    removeItem(idPlan: number, idItem: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/${idPlan}/items/${idItem}`);
    }

    updateItemStatus(idPlan: number, idItem: number, status: string): Observable<ApiResponse<TreatmentPlanItemResponse>> {
        return this.http.patch<ApiResponse<TreatmentPlanItemResponse>>(`${this.API}/${idPlan}/items/${idItem}/status`, { status });
    }
}
