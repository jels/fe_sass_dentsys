import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { ReceiptResponse, ReceiptStampResponse, CreateReceiptRequest } from '../models/billing.models';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
    private readonly API = `${environment.apiUrl}/receipts`;
    private readonly STAMP_API = `${environment.apiUrl}/receipt-stamps`;

    constructor(private http: HttpClient) {}

    getAll(idCompany: number, filters: { dateFrom?: string; dateTo?: string; idPatient?: number; idInvoice?: number; idBranch?: number } = {}): Observable<ApiResponse<ReceiptResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
        if (filters.idPatient) params = params.set('idPatient', filters.idPatient);
        if (filters.idInvoice) params = params.set('idInvoice', filters.idInvoice);
        if (filters.idBranch) params = params.set('idBranch', filters.idBranch);
        return this.http.get<ApiResponse<ReceiptResponse[]>>(this.API, { params });
    }

    getById(id: number): Observable<ApiResponse<ReceiptResponse>> {
        return this.http.get<ApiResponse<ReceiptResponse>>(`${this.API}/${id}`);
    }

    create(request: CreateReceiptRequest): Observable<ApiResponse<ReceiptResponse>> {
        return this.http.post<ApiResponse<ReceiptResponse>>(this.API, request);
    }

    // ── Timbrados de recibo ───────────────────────────────────────────────────

    getActiveStamps(idCompany: number, idBranch?: number): Observable<ApiResponse<ReceiptStampResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany).set('active', true);
        if (idBranch) params = params.set('idBranch', idBranch);
        return this.http.get<ApiResponse<ReceiptStampResponse[]>>(this.STAMP_API, { params });
    }
}
