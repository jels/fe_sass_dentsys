import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GuaraniesPipe } from '../../shared/pipes/guaranies.pipe';
import { FechaLocalPipe } from '../../shared/pipes/fecha-local.pipe';
import { TreatmentPlanResponse, CreateTreatmentPlanRequest, UpdateTreatmentPlanRequest, TreatmentPlanStatus, PLAN_STATUS_OPTIONS } from '../../core/models/clinical.models';
import { PatientResponse } from '../../core/models/clinical.models';
import { DentistResponse } from '../../core/models/catalogs.models';
import { TreatmentPlanService } from '../../core/services/treatment-plan.service';
import { PatientService } from '../../core/services/patient.service';
import { DentistService } from '../../core/services/dentist.service';
import { AuthService } from '../../core/services/auth.service';
import { SeverityType } from '../../core/models/constants/constantes.constants';

@Component({
    selector: 'app-treatment-plan',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DatePickerModule,
        DialogModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        ProgressBarModule,
        SelectModule,
        SkeletonModule,
        TableModule,
        TagModule,
        TextareaModule,
        ToastModule,
        TooltipModule,
        ConfirmDialogModule,
        GuaraniesPipe,
        FechaLocalPipe
    ],
    templateUrl: './treatment-plan.component.html',
    styleUrl: './treatment-plan.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class TreatmentPlanComponent implements OnInit, OnDestroy {
    plans = signal<TreatmentPlanResponse[]>([]);
    patients = signal<PatientResponse[]>([]);
    dentists = signal<DentistResponse[]>([]);
    loading = signal(false);
    saving = signal(false);
    showForm = signal(false);
    isEditMode = signal(false);
    editingId = signal<number | null>(null);

    search = '';
    filterStatus: TreatmentPlanStatus | '' = '';

    readonly statusOptions = PLAN_STATUS_OPTIONS;
    readonly statusFilterOptions = [{ label: 'Todos los estados', value: '' }, ...PLAN_STATUS_OPTIONS];

    planForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private planService: TreatmentPlanService,
        private patientService: PatientService,
        private dentistService: DentistService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        this.loadCatalogs();
        this.load();
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

    // ── Carga ────────────────────────────────────────────────────────────────

    load(): void {
        this.loading.set(true);
        this.planService
            .getAll(this.idCompany, undefined, this.filterStatus || undefined)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.plans.set(r.success ? (r.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    // ── Filtro local ─────────────────────────────────────────────────────────

    get filtered(): TreatmentPlanResponse[] {
        const q = this.search.toLowerCase().trim();
        if (!q) return this.plans();
        return this.plans().filter((p) => p.title.toLowerCase().includes(q) || p.patientFullName.toLowerCase().includes(q) || p.doctorFullName.toLowerCase().includes(q));
    }

    // ── Formulario ───────────────────────────────────────────────────────────

    private buildForm(): void {
        this.planForm = this.fb.group({
            idPatient: [null, Validators.required],
            idDoctor: [null, Validators.required],
            title: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            startDate: [null],
            estimatedEndDate: [null]
        });
    }

    openCreate(): void {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.planForm.reset();
        this.showForm.set(true);
    }

    openEdit(p: TreatmentPlanResponse): void {
        this.isEditMode.set(true);
        this.editingId.set(p.idTreatmentPlan);
        this.planForm.patchValue({
            idPatient: p.idPatient,
            idDoctor: p.idDoctor,
            title: p.title,
            description: p.description ?? '',
            startDate: p.startDate ? new Date(p.startDate) : null,
            estimatedEndDate: p.estimatedEndDate ? new Date(p.estimatedEndDate) : null
        });
        this.showForm.set(true);
    }

    goToDetail(p: TreatmentPlanResponse): void {
        this.router.navigate(['/modules/treatment-plan', p.idTreatmentPlan]);
    }

    submit(): void {
        if (this.planForm.invalid) {
            this.planForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.planForm.value;
        const toIso = (d: Date | null) => (d ? d.toISOString().split('T')[0] : undefined);

        if (this.isEditMode()) {
            const req: UpdateTreatmentPlanRequest = {
                idPatient: v.idPatient,
                idDoctor: v.idDoctor,
                title: v.title,
                description: v.description || undefined,
                startDate: toIso(v.startDate),
                estimatedEndDate: toIso(v.estimatedEndDate)
            };
            this.planService
                .update(this.editingId()!, req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (r) => {
                        this.saving.set(false);
                        if (r.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Plan actualizado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        } else {
            const req: CreateTreatmentPlanRequest = {
                idCompany: this.idCompany,
                idBranch: this.idBranch,
                idPatient: v.idPatient,
                idDoctor: v.idDoctor,
                title: v.title,
                description: v.description || undefined,
                startDate: toIso(v.startDate),
                estimatedEndDate: toIso(v.estimatedEndDate),
                items: []
            };
            this.planService
                .create(req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (r) => {
                        this.saving.set(false);
                        if (r.success) {
                            this.showForm.set(false);
                            this.messageService.add({ severity: 'success', summary: 'Plan creado' });
                            this.router.navigate(['/modules/treatment-plan', r.data.idTreatmentPlan]);
                        }
                    },
                    error: () => this.saving.set(false)
                });
        }
    }

    confirmChangeStatus(p: TreatmentPlanResponse, status: TreatmentPlanStatus): void {
        const label = this.statusOptions.find((s) => s.value === status)?.label ?? status;
        this.confirmationService.confirm({
            message: `¿Cambiar el plan <strong>${p.title}</strong> a estado <strong>${label}</strong>?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.planService
                    .changeStatus(p.idTreatmentPlan, status)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.load();
                            this.messageService.add({ severity: 'info', summary: 'Estado actualizado' });
                        }
                    });
            }
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(f: string): boolean {
        const c = this.planForm.get(f);
        return !!(c?.invalid && c.touched);
    }

    getStatusInfo(s: string): { label: string; severity: SeverityType } {
        return this.statusOptions.find((o) => o.value === s) ?? { label: s, severity: 'secondary' };
    }

    progressPercent(p: TreatmentPlanResponse): number {
        if (!p.totalItems) return 0;
        return Math.round((p.completedItems / p.totalItems) * 100);
    }

    get patientOptions() {
        return this.patients().map((p) => ({ label: p.fullName, value: p.idPatient }));
    }
    get doctorOptions() {
        return this.dentists().map((d) => ({ label: d.fullName, value: d.idDentist }));
    }
}
