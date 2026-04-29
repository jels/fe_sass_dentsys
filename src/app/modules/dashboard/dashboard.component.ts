import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GuaraniesPipe } from '../../shared/pipes/guaranies.pipe';
import { FechaLocalPipe } from '../../shared/pipes/fecha-local.pipe';
import { DashboardSummaryResponse, WeeklyAppointmentsChart, MonthlyBillingChart } from '../../core/models/dashboard.models';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CardModule, ChartModule, DatePickerModule, DividerModule, ProgressBarModule, SkeletonModule, TagModule, TooltipModule, GuaraniesPipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
    summary = signal<DashboardSummaryResponse | null>(null);
    weeklyChart = signal<WeeklyAppointmentsChart | null>(null);
    monthlyChart = signal<MonthlyBillingChart | null>(null);

    loadingSummary = signal(true);
    loadingWeekly = signal(true);
    loadingMonthly = signal(true);

    filterDate: Date = new Date();

    // Chart.js data objects
    weeklyChartData: any = null;
    weeklyChartOpts: any = null;
    monthlyChartData: any = null;
    monthlyChartOpts: any = null;

    private destroy$ = new Subject<void>();

    today = new Date();

    constructor(
        private dashboardService: DashboardService,
        public authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadAll();
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

    // ── Carga ────────────────────────────────────────────────────────────────

    loadAll(): void {
        this.loadSummary();
        this.loadWeeklyChart();
        this.loadMonthlyChart();
    }

    loadSummary(): void {
        this.loadingSummary.set(true);
        const date = this.filterDate.toISOString().split('T')[0];
        this.dashboardService
            .getSummary(this.idCompany, this.idBranch, date)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.summary.set(r.success ? r.data : null);
                    this.loadingSummary.set(false);
                },
                error: () => this.loadingSummary.set(false)
            });
    }

    loadWeeklyChart(): void {
        this.loadingWeekly.set(true);
        this.dashboardService
            .getWeeklyAppointments(this.idCompany, this.idBranch)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) {
                        this.weeklyChart.set(r.data);
                        this.buildWeeklyChartData(r.data);
                    }
                    this.loadingWeekly.set(false);
                },
                error: () => this.loadingWeekly.set(false)
            });
    }

    loadMonthlyChart(): void {
        this.loadingMonthly.set(true);
        this.dashboardService
            .getMonthlyBilling(this.idCompany, this.idBranch)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) {
                        this.monthlyChart.set(r.data);
                        this.buildMonthlyChartData(r.data);
                    }
                    this.loadingMonthly.set(false);
                },
                error: () => this.loadingMonthly.set(false)
            });
    }

    // ── Construcción de charts ────────────────────────────────────────────────

    private buildWeeklyChartData(data: WeeklyAppointmentsChart): void {
        this.weeklyChartData = {
            labels: data.labels,
            datasets: [
                {
                    label: 'Atendidas',
                    data: data.attended,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Canceladas',
                    data: data.cancelled,
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'No se presentó',
                    data: data.noShow,
                    backgroundColor: 'rgba(148, 163, 184, 0.5)',
                    borderColor: 'rgb(148, 163, 184)',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        };

        this.weeklyChartOpts = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { stacked: false, grid: { display: false } },
                y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(148,163,184,0.15)' } }
            }
        };
    }

    private buildMonthlyChartData(data: MonthlyBillingChart): void {
        this.monthlyChartData = {
            labels: data.labels,
            datasets: [
                {
                    label: 'Facturado',
                    data: data.invoiced,
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3
                },
                {
                    label: 'Cobrado',
                    data: data.collected,
                    fill: true,
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3
                }
            ]
        };

        this.monthlyChartOpts = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => ` ${ctx.dataset.label}: ₲ ${ctx.raw.toLocaleString('es-PY')}`
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148,163,184,0.15)' },
                    ticks: { callback: (v: number) => `₲ ${(v / 1_000_000).toFixed(1)}M` }
                }
            }
        };
    }

    // ── Navegación ────────────────────────────────────────────────────────────

    onDateChange(): void {
        this.loadSummary();
    }

    goTo(route: string): void {
        this.router.navigate([route]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    get greeting(): string {
        const h = new Date().getHours();
        if (h < 12) return 'Buenos días';
        if (h < 19) return 'Buenas tardes';
        return 'Buenas noches';
    }

    get isToday(): boolean {
        return this.filterDate.toDateString() === new Date().toDateString();
    }

    appointmentPct(value: number, total: number): number {
        return total ? Math.round((value / total) * 100) : 0;
    }

    billingCollectedPct(s: DashboardSummaryResponse): number {
        return s.billing.totalToday ? Math.round((s.billing.totalPaidToday / s.billing.totalToday) * 100) : 0;
    }
}
