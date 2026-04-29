import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TreatmentResponse, CreateTreatmentRequest, UpdateTreatmentRequest, TREATMENT_CATEGORIES } from '../../core/models/catalogs.models';
import { GuaraniesPipe } from '../../shared/pipes/guaranies.pipe';
import { TreatmentService } from '../../core/services/treatment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-treatment-catalog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        CheckboxModule,
        DialogModule,
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
        IconFieldModule,
        InputIconModule,
        GuaraniesPipe
    ],
    templateUrl: './treatment-catalog.component.html',
    styleUrl: './treatment-catalog.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class TreatmentCatalogComponent implements OnInit, OnDestroy {
    treatments = signal<TreatmentResponse[]>([]);
    loading = signal(false);
    saving = signal(false);
    showForm = signal(false);
    isEditMode = signal(false);
    editingId = signal<number | null>(null);

    search = '';
    filterCategory = '';

    readonly categories = TREATMENT_CATEGORIES;
    readonly categoryOptions = [{ label: 'Todas las categorías', value: '' }, ...TREATMENT_CATEGORIES];

    treatmentForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private treatmentService: TreatmentService,
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
        this.treatmentService
            .getAll(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.treatments.set(res.success ? (res.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    // ── Filtro local ─────────────────────────────────────────────────────────

    get filtered(): TreatmentResponse[] {
        const q = this.search.toLowerCase().trim();
        return this.treatments().filter((t) => {
            const matchText = !q || t.name.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q);
            const matchCat = !this.filterCategory || t.category === this.filterCategory;
            return matchText && matchCat;
        });
    }

    // ── Formulario ───────────────────────────────────────────────────────────

    private buildForm(): void {
        this.treatmentForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            category: ['', Validators.required],
            basePrice: [null, [Validators.required, Validators.min(0)]],
            durationMinutes: [30, [Validators.required, Validators.min(5)]],
            requiresLab: [false]
        });
    }

    openCreate(): void {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.treatmentForm.reset({ durationMinutes: 30, requiresLab: false });
        this.showForm.set(true);
    }

    openEdit(t: TreatmentResponse): void {
        this.isEditMode.set(true);
        this.editingId.set(t.idTreatment);
        this.treatmentForm.patchValue({
            name: t.name,
            description: t.description ?? '',
            category: t.category,
            basePrice: t.basePrice,
            durationMinutes: t.durationMinutes,
            requiresLab: t.requiresLab
        });
        this.showForm.set(true);
    }

    submit(): void {
        if (this.treatmentForm.invalid) {
            this.treatmentForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.treatmentForm.value;

        if (this.isEditMode()) {
            const req: UpdateTreatmentRequest = { ...v };
            this.treatmentService
                .update(this.editingId()!, req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Tratamiento actualizado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        } else {
            const req: CreateTreatmentRequest = { ...v, idCompany: this.idCompany };
            this.treatmentService
                .create(req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Tratamiento creado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        }
    }

    confirmToggle(t: TreatmentResponse): void {
        const action = t.isActive ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
            message: `¿Desea ${action} el tratamiento <strong>${t.name}</strong>?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.treatmentService
                    .toggleStatus(t.idTreatment)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.load();
                            this.messageService.add({ severity: 'info', summary: `Tratamiento ${action === 'activar' ? 'activado' : 'desactivado'}` });
                        }
                    });
            }
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(field: string): boolean {
        const c = this.treatmentForm.get(field);
        return !!(c?.invalid && c.touched);
    }

    getCategoryLabel(value: string): string {
        return this.categories.find((c) => c.value === value)?.label ?? value;
    }
}
