import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppointmentResponse, AppointmentStatus, CreateAppointmentRequest, UpdateAppointmentRequest, APPOINTMENT_STATUS_OPTIONS, PatientResponse } from '../../core/models/clinical.models';

// Re-export desde catalogs — ya definido en fase 2
import { DentistResponse as DR } from '../../core/models/catalogs.models';
import { AppointmentService } from '../../core/services/appointment.service';
import { PatientService } from '../../core/services/patient.service';
import { DentistService } from '../../core/services/dentist.service';
import { AuthService } from '../../core/services/auth.service';
import { SeverityType } from '../../core/models/constants/constantes.constants';

@Component({
    selector: 'app-scheduling',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DatePickerModule,
        DialogModule,
        DividerModule,
        InputTextModule,
        SelectModule,
        SkeletonModule,
        TableModule,
        TagModule,
        TextareaModule,
        ToastModule,
        TooltipModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule
    ],
    templateUrl: './scheduling.component.html',
    styleUrl: './scheduling.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class SchedulingComponent implements OnInit, OnDestroy {
    appointments = signal<AppointmentResponse[]>([]);
    patients = signal<PatientResponse[]>([]);
    dentists = signal<DR[]>([]);

    loading = signal(false);
    saving = signal(false);
    showForm = signal(false);
    showStatus = signal(false);
    isEditMode = signal(false);
    editingId = signal<number | null>(null);
    selected = signal<AppointmentResponse | null>(null);

    // Filtros
    filterDate: Date = new Date();
    filterDoctor: number | null = null;
    filterStatus: AppointmentStatus | '' = '';

    newStatus: AppointmentStatus | '' = '';

    readonly statusOptions = APPOINTMENT_STATUS_OPTIONS;
    readonly statusFilterOptions = [{ label: 'Todos los estados', value: '' }, ...APPOINTMENT_STATUS_OPTIONS];

    apptForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private appointmentService: AppointmentService,
        private patientService: PatientService,
        private dentistService: DentistService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        this.loadCatalogs();
        this.load();

        // Si viene desde ficha de paciente con ?idPatient=
        const idPatient = this.route.snapshot.queryParamMap.get('idPatient');
        if (idPatient) {
            setTimeout(() => this.openCreate(Number(idPatient)), 400);
        }
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

    loadCatalogs(): void {
        this.patientService
            .getAll(this.idCompany, { active: true })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.patients.set(res.data ?? []);
                }
            });

        this.dentistService
            .getAll(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.dentists.set(res.data ?? []);
                }
            });
    }

    load(): void {
        this.loading.set(true);
        const dateStr = this.toIso(this.filterDate);
        this.appointmentService
            .getAll(this.idCompany, {
                dateFrom: dateStr,
                dateTo: dateStr,
                idDoctor: this.filterDoctor ?? undefined,
                status: this.filterStatus || undefined,
                idBranch: this.idBranch
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.appointments.set(res.success ? (res.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    // ── Navegación por día ───────────────────────────────────────────────────

    prevDay(): void {
        this.shiftDay(-1);
    }
    nextDay(): void {
        this.shiftDay(+1);
    }

    private shiftDay(delta: number): void {
        const d = new Date(this.filterDate);
        d.setDate(d.getDate() + delta);
        this.filterDate = d;
        this.load();
    }

    goToday(): void {
        this.filterDate = new Date();
        this.load();
    }

    get isToday(): boolean {
        return this.filterDate.toDateString() === new Date().toDateString();
    }

    // ── Formulario ───────────────────────────────────────────────────────────

    private buildForm(): void {
        this.apptForm = this.fb.group({
            idPatient: [null, Validators.required],
            idDoctor: [null, Validators.required],
            startDatetime: [null, Validators.required],
            endDatetime: [null],
            reason: [''],
            notes: ['']
        });
    }

    openCreate(preselectedPatient?: number): void {
        this.isEditMode.set(false);
        this.editingId.set(null);
        const defaultStart = new Date(this.filterDate);
        defaultStart.setHours(9, 0, 0, 0);
        this.apptForm.reset({
            idPatient: preselectedPatient ?? null,
            startDatetime: defaultStart
        });
        this.showForm.set(true);
    }

    openEdit(a: AppointmentResponse): void {
        this.isEditMode.set(true);
        this.editingId.set(a.idAppointment);
        this.apptForm.patchValue({
            idPatient: a.idPatient,
            idDoctor: a.idDoctor,
            startDatetime: new Date(a.startDatetime),
            endDatetime: a.endDatetime ? new Date(a.endDatetime) : null,
            reason: a.reason ?? '',
            notes: a.notes ?? ''
        });
        this.showForm.set(true);
    }

    openChangeStatus(a: AppointmentResponse): void {
        this.selected.set(a);
        this.newStatus = a.status;
        this.showStatus.set(true);
    }

    submit(): void {
        if (this.apptForm.invalid) {
            this.apptForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.apptForm.value;
        const toIsoFull = (d: Date | null) => (d ? d.toISOString() : undefined);

        if (this.isEditMode()) {
            const req: UpdateAppointmentRequest = {
                idBranch: this.idBranch,
                idPatient: v.idPatient,
                idDoctor: v.idDoctor,
                startDatetime: v.startDatetime.toISOString(),
                endDatetime: toIsoFull(v.endDatetime),
                reason: v.reason || undefined,
                notes: v.notes || undefined
            };
            this.appointmentService
                .update(this.editingId()!, req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Cita actualizada' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        } else {
            const req: CreateAppointmentRequest = {
                idCompany: this.idCompany,
                idBranch: this.idBranch,
                idPatient: v.idPatient,
                idDoctor: v.idDoctor,
                startDatetime: v.startDatetime.toISOString(),
                endDatetime: toIsoFull(v.endDatetime),
                reason: v.reason || undefined,
                notes: v.notes || undefined
            };
            this.appointmentService
                .create(req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Cita agendada' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        }
    }

    submitStatusChange(): void {
        const a = this.selected();
        if (!a || !this.newStatus) return;
        this.appointmentService
            .changeStatus(a.idAppointment, this.newStatus as AppointmentStatus)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.showStatus.set(false);
                        this.load();
                        this.messageService.add({ severity: 'success', summary: 'Estado actualizado' });
                    }
                }
            });
    }

    confirmCancel(a: AppointmentResponse): void {
        this.confirmationService.confirm({
            message: `¿Cancelar la cita de <strong>${a.patientFullName}</strong>?`,
            header: 'Confirmar cancelación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.appointmentService
                    .cancel(a.idAppointment)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.load();
                            this.messageService.add({ severity: 'warn', summary: 'Cita cancelada' });
                        }
                    });
            }
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(field: string): boolean {
        const c = this.apptForm.get(field);
        return !!(c?.invalid && c.touched);
    }

    getStatusInfo(status: string): { label: string; severity: SeverityType } {
        return this.statusOptions.find((s) => s.value === status) ?? { label: status, severity: 'secondary' };
    }

    formatTime(dt: string): string {
        return new Date(dt).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
    }

    get doctorOptions(): { label: string; value: number }[] {
        return this.dentists().map((d) => ({ label: d.fullName, value: d.idDentist }));
    }

    get doctorFilterOptions(): { label: string; value: number | null }[] {
        return [{ label: 'Todos los dentistas', value: null }, ...this.doctorOptions];
    }

    get patientOptions(): { label: string; value: number }[] {
        return this.patients().map((p) => ({ label: p.fullName, value: p.idPatient }));
    }

    get stats(): { pending: number; confirmed: number; attended: number; cancelled: number } {
        const a = this.appointments();
        return {
            pending: a.filter((x) => x.status === 'PENDING').length,
            confirmed: a.filter((x) => x.status === 'CONFIRMED').length,
            attended: a.filter((x) => x.status === 'ATTENDED').length,
            cancelled: a.filter((x) => x.status === 'CANCELLED' || x.status === 'NO_SHOW').length
        };
    }

    private toIso(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
