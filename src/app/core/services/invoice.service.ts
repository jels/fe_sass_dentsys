import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { InvoiceResponse, InvoiceStampResponse, CreateInvoiceRequest, VoidInvoiceRequest, InvoiceStatus } from '../models/billing.models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
    private readonly API = `${environment.apiUrl}/invoices`;
    private readonly STAMP_API = `${environment.apiUrl}/invoice-stamps`;

    constructor(private http: HttpClient) {}

    // ── Facturas ──────────────────────────────────────────────────────────────

    getAll(idCompany: number, filters: { dateFrom?: string; dateTo?: string; idPatient?: number; status?: InvoiceStatus; idBranch?: number } = {}): Observable<ApiResponse<InvoiceResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
        if (filters.idPatient) params = params.set('idPatient', filters.idPatient);
        if (filters.status) params = params.set('status', filters.status);
        if (filters.idBranch) params = params.set('idBranch', filters.idBranch);
        return this.http.get<ApiResponse<InvoiceResponse[]>>(this.API, { params });
    }

    getById(id: number): Observable<ApiResponse<InvoiceResponse>> {
        return this.http.get<ApiResponse<InvoiceResponse>>(`${this.API}/${id}`);
    }

    create(request: CreateInvoiceRequest): Observable<ApiResponse<InvoiceResponse>> {
        return this.http.post<ApiResponse<InvoiceResponse>>(this.API, request);
    }

    void(id: number, request: VoidInvoiceRequest): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(`${this.API}/${id}/void`, request);
    }

    // ── Timbrados de factura ──────────────────────────────────────────────────

    getActiveStamps(idCompany: number, idBranch?: number): Observable<ApiResponse<InvoiceStampResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany).set('active', true);
        if (idBranch) params = params.set('idBranch', idBranch);
        return this.http.get<ApiResponse<InvoiceStampResponse[]>>(this.STAMP_API, { params });
    }
}
