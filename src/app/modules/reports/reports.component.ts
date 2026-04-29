import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GuaraniesPipe } from '../../shared/pipes/guaranies.pipe';
import { FechaLocalPipe } from '../../shared/pipes/fecha-local.pipe';
import { ReportType, ReportFormat, ReportGroupBy, ReportRequest, ReportResponse, ReportRow, REPORT_TYPE_OPTIONS, REPORT_GROUPBY_OPTIONS, REPORT_FORMAT_OPTIONS } from '../../core/models/dashboard.models';
import { PatientResponse } from '../../core/models/clinical.models';
import { DentistResponse } from '../../core/models/catalogs.models';
import { DashboardService } from '../../core/services/dashboard.service';
import { DentistService } from '../../core/services/dentist.service';
import { PatientService } from '../../core/services/patient.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, ChartModule, DatePickerModule, DividerModule, SelectModule, SkeletonModule, TableModule, TagModule, ToastModule, TooltipModule, GuaraniesPipe, FechaLocalPipe],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.scss',
    providers: [MessageService]
})
export class ReportsComponent implements OnInit, OnDestroy {
    patients = signal<PatientResponse[]>([]);
    dentists = signal<DentistResponse[]>([]);
    result = signal<ReportResponse | null>(null);

    loading = signal(false);
    exporting = signal(false);
    hasResults = signal(false);

    // Configuración del reporte
    selectedType: ReportType = 'APPOINTMENTS';
    selectedGroupBy: ReportGroupBy = 'DAY';
    selectedFormat: ReportFormat = 'JSON';
    dateFrom: Date = new Date(new Date().setDate(1));
    dateTo: Date = new Date();
    selectedDoctor: number | null = null;
    selectedPatient: number | null = null;
    selectedStatus: string = '';

    // Chart data
    chartData: any = null;
    chartOpts: any = null;

    readonly typeOptions = REPORT_TYPE_OPTIONS;
    readonly formatOptions = REPORT_FORMAT_OPTIONS;
    readonly groupByOptions_all = REPORT_GROUPBY_OPTIONS;

    private destroy$ = new Subject<void>();

    constructor(
        private dashboardService: DashboardService,
        private dentistService: DentistService,
        private patientService: PatientService,
        private authService: AuthService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadCatalogs();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private get idCompany(): number {
        return this.authService.idCompany()!;
    }
    private get idBranch(): number {
        return this.authService.idBranch()!;
    }

    // ── Catálogos ────────────────────────────────────────────────────────────

    loadCatalogs(): void {
        this.patientService
            .getAll(this.idCompany, { active: true })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) this.patients.set(r.data ?? []);
                }
            });

        this.dentistService
            .getAll(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) this.dentists.set(r.data ?? []);
                }
            });
    }

    // ── Opciones dinámicas ────────────────────────────────────────────────────

    get groupByOptions() {
        return this.groupByOptions_all[this.selectedType] ?? [];
    }

    get showDoctorFilter(): boolean {
        return ['APPOINTMENTS', 'PERFORMED_TREATMENTS'].includes(this.selectedType);
    }

    get showPatientFilter(): boolean {
        return ['BILLING', 'PERFORMED_TREATMENTS'].includes(this.selectedType);
    }

    get showStatusFilter(): boolean {
        return this.selectedType === 'APPOINTMENTS';
    }

    get statusOptions() {
        return [
            { label: 'Todos', value: '' },
            { label: 'Pendiente', value: 'PENDING' },
            { label: 'Confirmado', value: 'CONFIRMED' },
            { label: 'Atendido', value: 'ATTENDED' },
            { label: 'Cancelado', value: 'CANCELLED' },
            { label: 'No se presentó', value: 'NO_SHOW' }
        ];
    }

    onTypeChange(): void {
        // Reset groupBy al primero disponible
        const opts = this.groupByOptions_all[this.selectedType];
        this.selectedGroupBy = opts?.[0]?.value ?? 'DAY';
        this.result.set(null);
        this.hasResults.set(false);
        this.chartData = null;
    }

    // ── Generar reporte ───────────────────────────────────────────────────────

    generate(): void {
        this.loading.set(true);
        this.result.set(null);
        this.chartData = null;

        const req: ReportRequest = {
            idCompany: this.idCompany,
            idBranch: this.idBranch,
            reportType: this.selectedType,
            dateFrom: this.toIso(this.dateFrom),
            dateTo: this.toIso(this.dateTo),
            groupBy: this.selectedGroupBy,
            format: 'JSON',
            idDoctor: this.selectedDoctor ?? undefined,
            idPatient: this.selectedPatient ?? undefined,
            status: this.selectedStatus || undefined
        };

        this.dashboardService
            .generateReport(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.loading.set(false);
                    if (r.success) {
                        this.result.set(r.data);
                        this.hasResults.set(true);
                        this.buildChart(r.data);
                    }
                },
                error: () => {
                    this.loading.set(false);
                    this.messageService.add({ severity: 'error', summary: 'Error al generar el reporte' });
                }
            });
    }

    export(format: ReportFormat): void {
        if (format === 'JSON') {
            this.generate();
            return;
        }
        this.exporting.set(true);

        const req: ReportRequest = {
            idCompany: this.idCompany,
            idBranch: this.idBranch,
            reportType: this.selectedType,
            dateFrom: this.toIso(this.dateFrom),
            dateTo: this.toIso(this.dateTo),
            groupBy: this.selectedGroupBy,
            format,
            idDoctor: this.selectedDoctor ?? undefined,
            idPatient: this.selectedPatient ?? undefined,
            status: this.selectedStatus || undefined
        };

        this.dashboardService
            .exportReport(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    this.exporting.set(false);
                    const ext = format === 'PDF' ? 'pdf' : 'csv';
                    const mime = format === 'PDF' ? 'application/pdf' : 'text/csv';
                    const name = `reporte_${this.selectedType.toLowerCase()}_${this.toIso(this.dateFrom)}_${this.toIso(this.dateTo)}.${ext}`;
                    this.downloadBlob(blob, name);
                    this.messageService.add({ severity: 'success', summary: 'Reporte exportado' });
                },
                error: () => {
                    this.exporting.set(false);
                    this.messageService.add({ severity: 'error', summary: 'Error al exportar' });
                }
            });
    }

    // ── Construcción del chart ────────────────────────────────────────────────

    private buildChart(data: ReportResponse): void {
        if (!data.rows.length || data.groupBy === 'NONE') {
            this.chartData = null;
            return;
        }

        const labels = data.rows.map((r) => r.label);
        const isMoney = ['BILLING', 'CASH_BOOK', 'PERFORMED_TREATMENTS'].includes(data.reportType);

        if (isMoney) {
            this.chartData = {
                labels,
                datasets: [
                    {
                        label: this.getTypeLabel(data.reportType),
                        data: data.rows.map((r) => r.amount ?? 0),
                        backgroundColor: 'rgba(59,130,246,0.15)',
                        borderColor: 'rgb(59,130,246)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3
                    }
                ]
            };
            this.chartOpts = this.buildLineOpts(true);
        } else {
            this.chartData = {
                labels,
                datasets: [
                    {
                        label: this.getTypeLabel(data.reportType),
                        data: data.rows.map((r) => r.count),
                        backgroundColor: 'rgba(99,102,241,0.7)',
                        borderColor: 'rgb(99,102,241)',
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            };
            this.chartOpts = this.buildBarOpts();
        }
    }

    private buildLineOpts(isMoney: boolean): any {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => (isMoney ? ` ₲ ${ctx.raw.toLocaleString('es-PY')}` : ` ${ctx.raw}`)
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148,163,184,0.15)' },
                    ticks: isMoney ? { callback: (v: number) => `₲ ${(v / 1_000_000).toFixed(1)}M` } : {}
                }
            }
        };
    }

    private buildBarOpts(): any {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(148,163,184,0.15)' } }
            }
        };
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    getTypeLabel(type: ReportType): string {
        return this.typeOptions.find((o) => o.value === type)?.label ?? type;
    }

    getTypeIcon(type: ReportType): string {
        return this.typeOptions.find((o) => o.value === type)?.icon ?? 'pi pi-chart-bar';
    }

    isAmountReport(): boolean {
        return ['BILLING', 'CASH_BOOK', 'PERFORMED_TREATMENTS'].includes(this.selectedType);
    }

    get patientOptions() {
        return [{ label: 'Todos', value: null }, ...this.patients().map((p) => ({ label: p.fullName, value: p.idPatient }))];
    }
    get doctorOptions() {
        return [{ label: 'Todos', value: null }, ...this.dentists().map((d) => ({ label: d.fullName, value: d.idDentist }))];
    }

    private downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    get summaryStats() {
        return this.result()?.summary;
    }

    // ── Atajos de período ─────────────────────────────────────────────────────

    setToday(): void {
        this.dateFrom = new Date();
        this.dateTo = new Date();
    }

    setThisWeek(): void {
        const now = new Date();
        const day = now.getDay() || 7;
        const from = new Date(now);
        from.setDate(now.getDate() - day + 1);
        this.dateFrom = from;
        this.dateTo = new Date();
    }

    setThisMonth(): void {
        const now = new Date();
        this.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        this.dateTo = new Date();
    }

    setLastMonth(): void {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const to = new Date(now.getFullYear(), now.getMonth(), 0);
        this.dateFrom = from;
        this.dateTo = to;
    }

    get today(): Date {
        return new Date();
    }

    private toIso(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
