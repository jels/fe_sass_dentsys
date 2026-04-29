import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { DashboardSummaryResponse, WeeklyAppointmentsChart, MonthlyBillingChart, ReportRequest, ReportResponse } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly API = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) {}

    // GET /dashboard/summary?idCompany=&idBranch=&date=
    getSummary(idCompany: number, idBranch: number, date?: string): Observable<ApiResponse<DashboardSummaryResponse>> {
        let params = new HttpParams().set('idCompany', idCompany).set('idBranch', idBranch);
        if (date) params = params.set('date', date);
        return this.http.get<ApiResponse<DashboardSummaryResponse>>(`${this.API}/summary`, { params });
    }

    // GET /dashboard/charts/weekly-appointments?idCompany=&idBranch=
    getWeeklyAppointments(idCompany: number, idBranch: number): Observable<ApiResponse<WeeklyAppointmentsChart>> {
        const params = new HttpParams().set('idCompany', idCompany).set('idBranch', idBranch);
        return this.http.get<ApiResponse<WeeklyAppointmentsChart>>(`${this.API}/charts/weekly-appointments`, { params });
    }

    // GET /dashboard/charts/monthly-billing?idCompany=&idBranch=
    getMonthlyBilling(idCompany: number, idBranch: number): Observable<ApiResponse<MonthlyBillingChart>> {
        const params = new HttpParams().set('idCompany', idCompany).set('idBranch', idBranch);
        return this.http.get<ApiResponse<MonthlyBillingChart>>(`${this.API}/charts/monthly-billing`, { params });
    }

    // POST /dashboard/reports
    generateReport(request: ReportRequest): Observable<ApiResponse<ReportResponse>> {
        return this.http.post<ApiResponse<ReportResponse>>(`${this.API}/reports`, request);
    }

    // GET /dashboard/reports/export — retorna blob para CSV/PDF
    exportReport(request: ReportRequest): Observable<Blob> {
        return this.http.post(`${this.API}/reports/export`, request, { responseType: 'blob' });
    }
}
