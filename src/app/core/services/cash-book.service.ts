import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { CashBookResponse, CashConceptResponse, CashBookStatsResponse, CreateCashBookRequest, CreateCashConceptRequest, UpdateCashConceptRequest, CashMovementType } from '../models/cashbook.models';

@Injectable({ providedIn: 'root' })
export class CashBookService {
    private readonly API = `${environment.apiUrl}/cash-book`;
    private readonly CONCEPT_API = `${environment.apiUrl}/cash-concepts`;

    constructor(private http: HttpClient) {}

    // ── Movimientos ───────────────────────────────────────────────────────────

    getMovements(
        idCompany: number,
        filters: {
            dateFrom?: string;
            dateTo?: string;
            movementType?: CashMovementType;
            idCashConcept?: number;
            idBranch?: number;
            origin?: string;
        } = {}
    ): Observable<ApiResponse<CashBookResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
        if (filters.movementType) params = params.set('movementType', filters.movementType);
        if (filters.idCashConcept) params = params.set('idCashConcept', filters.idCashConcept);
        if (filters.idBranch) params = params.set('idBranch', filters.idBranch);
        if (filters.origin) params = params.set('origin', filters.origin);
        return this.http.get<ApiResponse<CashBookResponse[]>>(this.API, { params });
    }

    getStats(idCompany: number, idBranch?: number): Observable<ApiResponse<CashBookStatsResponse>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (idBranch) params = params.set('idBranch', idBranch);
        return this.http.get<ApiResponse<CashBookStatsResponse>>(`${this.API}/stats`, { params });
    }

    createManual(request: CreateCashBookRequest): Observable<ApiResponse<CashBookResponse>> {
        return this.http.post<ApiResponse<CashBookResponse>>(this.API, request);
    }

    // ── Conceptos ─────────────────────────────────────────────────────────────

    getConcepts(idCompany: number, movementType?: CashMovementType): Observable<ApiResponse<CashConceptResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (movementType) params = params.set('movementType', movementType);
        return this.http.get<ApiResponse<CashConceptResponse[]>>(this.CONCEPT_API, { params });
    }

    createConcept(request: CreateCashConceptRequest): Observable<ApiResponse<CashConceptResponse>> {
        return this.http.post<ApiResponse<CashConceptResponse>>(this.CONCEPT_API, request);
    }

    updateConcept(id: number, request: UpdateCashConceptRequest): Observable<ApiResponse<CashConceptResponse>> {
        return this.http.put<ApiResponse<CashConceptResponse>>(`${this.CONCEPT_API}/${id}`, request);
    }

    toggleConcept(id: number): Observable<ApiResponse<CashConceptResponse>> {
        return this.http.patch<ApiResponse<CashConceptResponse>>(`${this.CONCEPT_API}/${id}/toggle-status`, {});
    }
}
