import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { StampResponse, CreateStampRequest, UpdateStampRequest, STAMP_DOCUMENT_TYPES } from '../../core/models/catalogs.models';
import { StampService } from '../../core/services/stamp.service';
import { AuthService } from '../../core/services/auth.service';
import { SeverityType } from '../../core/models/constants/constantes.constants';

@Component({
    selector: 'app-stamps',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DatePickerModule,
        DialogModule,
        InputNumberModule,
        InputTextModule,
        SelectModule,
        SkeletonModule,
        TableModule,
        TagModule,
        ToastModule,
        TooltipModule,
        ConfirmDialogModule,
        ProgressBarModule
    ],
    templateUrl: './stamps.component.html',
    styleUrl: './stamps.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class StampsComponent implements OnInit, OnDestroy {
    stamps = signal<StampResponse[]>([]);
    loading = signal(false);
    saving = signal(false);
    showForm = signal(false);
    isEditMode = signal(false);
    editingId = signal<number | null>(null);
    showDetail = false;
    selected = signal<StampResponse | null>(null);

    readonly docTypes = STAMP_DOCUMENT_TYPES;

    stampForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private stampService: StampService,
        private authService: AuthService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        this.load();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private get idCompany(): number {
        return this.authService.idCompany()!;
    }

    // ── Carga ────────────────────────────────────────────────────────────────

    load(): void {
        this.loading.set(true);
        this.stampService
            .getAll(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.stamps.set(res.success ? (res.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    // ── Formulario ───────────────────────────────────────────────────────────

    private buildForm(): void {
        this.stampForm = this.fb.group({
            stampNumber: ['', Validators.required],
            establishmentCode: ['001', Validators.required],
            dispatchPointCode: ['001', Validators.required],
            documentType: ['INVOICE', Validators.required],
            startNumber: [1, [Validators.required, Validators.min(1)]],
            endNumber: [null, [Validators.required, Validators.min(1)]],
            validFrom: [null, Validators.required],
            validTo: [null, Validators.required],
            idBranch: [this.authService.idBranch(), Validators.required]
        });
    }

    openCreate(): void {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.stampForm.reset({
            establishmentCode: '001',
            dispatchPointCode: '001',
            documentType: 'INVOICE',
            startNumber: 1,
            idBranch: this.authService.idBranch()
        });
        this.showForm.set(true);
    }

    openEdit(s: StampResponse): void {
        this.isEditMode.set(true);
        this.editingId.set(s.idStamp);
        this.stampForm.patchValue({
            stampNumber: s.stampNumber,
            establishmentCode: s.establishmentCode,
            dispatchPointCode: s.dispatchPointCode,
            documentType: s.documentType,
            startNumber: s.startNumber,
            endNumber: s.endNumber,
            validFrom: new Date(s.validFrom),
            validTo: new Date(s.validTo),
            idBranch: s.idBranch
        });
        this.showForm.set(true);
    }

    openDetail(s: StampResponse): void {
        this.selected.set(s);
        this.showDetail = true;
    }

    submit(): void {
        if (this.stampForm.invalid) {
            this.stampForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.stampForm.value;

        const toIso = (d: Date) => d.toISOString().split('T')[0];

        if (this.isEditMode()) {
            const req: UpdateStampRequest = {
                ...v,
                validFrom: toIso(v.validFrom),
                validTo: toIso(v.validTo)
            };
            this.stampService
                .update(this.editingId()!, req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Timbrado actualizado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        } else {
            const req: CreateStampRequest = {
                ...v,
                idCompany: this.idCompany,
                validFrom: toIso(v.validFrom),
                validTo: toIso(v.validTo)
            };
            this.stampService
                .create(req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Timbrado registrado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        }
    }

    confirmToggle(s: StampResponse): void {
        const action = s.isActive ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
            message: `¿Desea ${action} el timbrado <strong>${s.stampNumber}</strong>?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.stampService
                    .toggleStatus(s.idStamp)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.load();
                            this.messageService.add({ severity: 'info', summary: `Timbrado ${action === 'activar' ? 'activado' : 'desactivado'}` });
                        }
                    });
            }
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(field: string): boolean {
        const c = this.stampForm.get(field);
        return !!(c?.invalid && c.touched);
    }

    getDocTypeLabel(value: string): string {
        return this.docTypes.find((d) => d.value === value)?.label ?? value;
    }

    getUsagePercent(s: StampResponse): number {
        const total = s.endNumber - s.startNumber + 1;
        const used = s.currentNumber - s.startNumber;
        return Math.round((used / total) * 100);
    }

    isExpired(s: StampResponse): boolean {
        return new Date(s.validTo) < new Date();
    }

    isNearExpiry(s: StampResponse): boolean {
        const diff = new Date(s.validTo).getTime() - Date.now();
        return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // < 30 días
    }

    getStatusSeverity(s: StampResponse): SeverityType {
        if (!s.isActive) return 'secondary';
        if (this.isExpired(s)) return 'danger';
        if (this.isNearExpiry(s)) return 'warn';
        return 'success';
    }

    getStatusLabel(s: StampResponse): string {
        if (!s.isActive) return 'Inactivo';
        if (this.isExpired(s)) return 'Vencido';
        if (this.isNearExpiry(s)) return 'Por vencer';
        return 'Vigente';
    }
}
