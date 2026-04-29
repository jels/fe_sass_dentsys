import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
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
import { PerformedTreatmentResponse, CreatePerformedTreatmentRequest, UpdatePerformedTreatmentRequest, PerformedTreatmentStatus, PERFORMED_STATUS_OPTIONS } from '../../core/models/clinical.models';
import { PatientResponse } from '../../core/models/clinical.models';
import { DentistResponse, TreatmentResponse } from '../../core/models/catalogs.models';
import { PerformedTreatmentService } from '../../core/services/performed-treatment.service';
import { PatientService } from '../../core/services/patient.service';
import { DentistService } from '../../core/services/dentist.service';
import { TreatmentService } from '../../core/services/treatment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-performed-treatments',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DatePickerModule,
        DialogModule,
        DividerModule,
        IconFieldModule,
        InputIconModule,
        InputNumberModule,
        InputTextModule,
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
    templateUrl: './performed-treatments.component.html',
    styleUrl: './performed-treatments.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class PerformedTreatmentsComponent implements OnInit, OnDestroy {
    records = signal<PerformedTreatmentResponse[]>([]);
    patients = signal<PatientResponse[]>([]);
    dentists = signal<DentistResponse[]>([]);
    treatments = signal<TreatmentResponse[]>([]);

    loading = signal(false);
    saving = signal(false);
    showForm = signal(false);
    showDetail = false;
    isEditMode = signal(false);
    editingId = signal<number | null>(null);
    selected = signal<PerformedTreatmentResponse | null>(null);

    // Filtros
    filterDateFrom: Date = new Date();
    filterDateTo: Date = new Date();
    filterPatient: number | null = null;
    filterDoctor: number | null = null;
    filterStatus: PerformedTreatmentStatus | '' = '';

    today = new Date();

    readonly statusOptions = PERFORMED_STATUS_OPTIONS;
    readonly statusFilterOptions = [{ label: 'Todos los estados', value: '' }, ...PERFORMED_STATUS_OPTIONS];

    ptForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private ptService: PerformedTreatmentService,
        private patientService: PatientService,
        private dentistService: DentistService,
        private treatmentService: TreatmentService,
        private authService: AuthService,
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

        this.treatmentService
            .getAll(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) this.treatments.set(r.data ?? []);
                }
            });
    }

    // ── Carga ────────────────────────────────────────────────────────────────

    load(): void {
        this.loading.set(true);
        this.ptService
            .getAll(this.idCompany, {
                dateFrom: this.toIso(this.filterDateFrom),
                dateTo: this.toIso(this.filterDateTo),
                idPatient: this.filterPatient ?? undefined,
                idDoctor: this.filterDoctor ?? undefined,
                status: this.filterStatus || undefined
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.records.set(r.success ? (r.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    clearFilters(): void {
        this.filterDateFrom = new Date();
        this.filterDateTo = new Date();
        this.filterPatient = null;
        this.filterDoctor = null;
        this.filterStatus = '';
        this.load();
    }

    // ── Formulario ───────────────────────────────────────────────────────────

    private buildForm(): void {
        this.ptForm = this.fb.group({
            idPatient: [null, Validators.required],
            idTreatmentCatalog: [null, Validators.required],
            idDoctor: [null, Validators.required],
            performedDate: [new Date(), Validators.required],
            toothReference: [''],
            actualCost: [null, [Validators.required, Validators.min(0)]],
            chargedPrice: [null, [Validators.required, Validators.min(0)]],
            priceAdjustmentReason: [''],
            observations: ['']
        });
    }

    openCreate(): void {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.ptForm.reset({ performedDate: new Date() });
        this.showForm.set(true);
    }

    openEdit(r: PerformedTreatmentResponse): void {
        this.isEditMode.set(true);
        this.editingId.set(r.idPerformedTreatment);
        this.ptForm.patchValue({
            idPatient: r.idPatient,
            idTreatmentCatalog: r.idTreatmentCatalog,
            idDoctor: r.idDoctor,
            performedDate: new Date(r.performedDate),
            toothReference: r.toothReference ?? '',
            actualCost: r.actualCost,
            chargedPrice: r.chargedPrice,
            priceAdjustmentReason: r.priceAdjustmentReason ?? '',
            observations: r.observations ?? ''
        });
        this.showForm.set(true);
    }

    openDetail(r: PerformedTreatmentResponse): void {
        this.selected.set(r);
        this.showDetail = true;
    }

    onTreatmentSelect(idTreatment: number): void {
        const t = this.treatments().find((x) => x.idTreatment === idTreatment);
        if (t) this.ptForm.patchValue({ actualCost: t.basePrice, chargedPrice: t.basePrice });
    }

    submit(): void {
        if (this.ptForm.invalid) {
            this.ptForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.ptForm.value;
        const toIso = (d: Date) => d.toISOString().split('T')[0];

        if (this.isEditMode()) {
            const req: UpdatePerformedTreatmentRequest = {
                performedDate: toIso(v.performedDate),
                toothReference: v.toothReference || undefined,
                actualCost: v.actualCost,
                chargedPrice: v.chargedPrice,
                priceAdjustmentReason: v.priceAdjustmentReason || undefined,
                observations: v.observations || undefined
            };
            this.ptService
                .update(this.editingId()!, req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (r) => {
                        this.saving.set(false);
                        if (r.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Registro actualizado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        } else {
            const req: CreatePerformedTreatmentRequest = {
                idCompany: this.idCompany,
                idBranch: this.idBranch,
                idPatient: v.idPatient,
                idTreatmentCatalog: v.idTreatmentCatalog,
                idDoctor: v.idDoctor,
                performedDate: toIso(v.performedDate),
                toothReference: v.toothReference || undefined,
                actualCost: v.actualCost,
                chargedPrice: v.chargedPrice,
                priceAdjustmentReason: v.priceAdjustmentReason || undefined,
                observations: v.observations || undefined
            };
            this.ptService
                .create(req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (r) => {
                        this.saving.set(false);
                        if (r.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Tratamiento registrado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        }
    }

    confirmCancel(r: PerformedTreatmentResponse): void {
        this.confirmationService.confirm({
            message: `¿Cancelar el registro de <strong>${r.treatmentName}</strong> para <strong>${r.patientFullName}</strong>?`,
            header: 'Confirmar cancelación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.ptService
                    .cancel(r.idPerformedTreatment)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.load();
                            this.messageService.add({ severity: 'warn', summary: 'Registro cancelado' });
                        }
                    });
            }
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(f: string): boolean {
        const c = this.ptForm.get(f);
        return !!(c?.invalid && c.touched);
    }

    getStatusInfo(s: string) {
        return this.statusOptions.find((o) => o.value === s) ?? { label: s, severity: 'secondary' };
    }

    hasPriceAdjustment(r: PerformedTreatmentResponse): boolean {
        return r.actualCost !== r.chargedPrice;
    }

    get patientOptions() {
        return this.patients().map((p) => ({ label: p.fullName, value: p.idPatient }));
    }
    get doctorOptions() {
        return this.dentists().map((d) => ({ label: d.fullName, value: d.idDentist }));
    }
    get treatmentOptions() {
        return this.treatments()
            .filter((t) => t.isActive)
            .map((t) => ({ label: t.name, value: t.idTreatment }));
    }
    get patientFilterOptions() {
        return [{ label: 'Todos los pacientes', value: null }, ...this.patientOptions];
    }
    get doctorFilterOptions() {
        return [{ label: 'Todos los dentistas', value: null }, ...this.doctorOptions];
    }

    get totalCharged(): number {
        return this.records()
            .filter((r) => r.status !== 'CANCELLED')
            .reduce((s, r) => s + r.chargedPrice, 0);
    }

    private toIso(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
