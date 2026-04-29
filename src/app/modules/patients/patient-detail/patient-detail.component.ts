import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PatientResponse, AppointmentResponse, APPOINTMENT_STATUS_OPTIONS } from '../../../core/models/clinical.models';
import { FechaLocalPipe } from '../../../shared/pipes/fecha-local.pipe';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { SeverityType } from '../../../core/models/constants/constantes.constants';

@Component({
    selector: 'app-patient-detail',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, DividerModule, SkeletonModule, TagModule, ToastModule, TooltipModule, FechaLocalPipe],
    templateUrl: './patient-detail.component.html',
    styleUrl: './patient-detail.component.scss',
    providers: [MessageService]
})
export class PatientDetailComponent implements OnInit, OnDestroy {
    patient = signal<PatientResponse | null>(null);
    appointments = signal<AppointmentResponse[]>([]);
    loading = signal(true);
    loadingAppts = signal(true);

    private destroy$ = new Subject<void>();

    readonly statusOptions = APPOINTMENT_STATUS_OPTIONS;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private patientService: PatientService,
        private appointmentService: AppointmentService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!id) {
            this.router.navigate(['/modules/patients']);
            return;
        }
        this.loadPatient(id);
        this.loadAppointments(id);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadPatient(id: number): void {
        this.patientService
            .getById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.patient.set(res.success ? res.data : null);
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                    this.messageService.add({ severity: 'error', summary: 'Paciente no encontrado' });
                    this.router.navigate(['/modules/patients']);
                }
            });
    }

    private loadAppointments(idPatient: number): void {
        this.appointmentService
            .getAll(this.patient()?.idCompany ?? 0, { idPatient })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.appointments.set(res.success ? (res.data ?? []) : []);
                    this.loadingAppts.set(false);
                },
                error: () => this.loadingAppts.set(false)
            });
    }

    goBack(): void {
        this.router.navigate(['/modules/patients']);
    }

    newAppointment(): void {
        this.router.navigate(['/modules/scheduling'], {
            queryParams: { idPatient: this.patient()?.idPatient }
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    getStatusInfo(status: string): { label: string; severity: SeverityType } {
        return this.statusOptions.find((s) => s.value === status) ?? { label: status, severity: 'secondary' };
    }

    calcAge(birthDate: string | undefined): string {
        if (!birthDate) return '—';
        const diff = Date.now() - new Date(birthDate).getTime();
        return `${Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))} años`;
    }

    formatDatetime(dt: string): string {
        if (!dt) return '—';
        return new Date(dt).toLocaleString('es-PY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    get upcomingAppts(): AppointmentResponse[] {
        const now = new Date().toISOString();
        return this.appointments()
            .filter((a) => a.startDatetime >= now && a.status !== 'CANCELLED')
            .slice(0, 5);
    }

    get pastAppts(): AppointmentResponse[] {
        const now = new Date().toISOString();
        return this.appointments()
            .filter((a) => a.startDatetime < now || a.status === 'ATTENDED')
            .slice(0, 10);
    }
}
