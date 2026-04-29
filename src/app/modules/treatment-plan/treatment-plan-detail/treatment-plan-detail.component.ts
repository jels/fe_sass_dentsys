import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GuaraniesPipe } from '../../../shared/pipes/guaranies.pipe';
import { FechaLocalPipe } from '../../../shared/pipes/fecha-local.pipe';
import { TreatmentPlanResponse, TreatmentPlanItemResponse, TreatmentPlanItemStatus, AddPlanItemRequest, PLAN_STATUS_OPTIONS, PLAN_ITEM_STATUS_OPTIONS } from '../../../core/models/clinical.models';
import { TreatmentResponse } from '../../../core/models/catalogs.models';
import { TreatmentPlanService } from '../../../core/services/treatment-plan.service';
import { TreatmentService } from '../../../core/services/treatment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-treatment-plan-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DialogModule,
        InputNumberModule,
        InputTextModule,
        ProgressBarModule,
        SelectModule,
        SkeletonModule,
        TagModule,
        TextareaModule,
        ToastModule,
        TooltipModule,
        ConfirmDialogModule,
        DividerModule,
        GuaraniesPipe,
        FechaLocalPipe
    ],
    templateUrl: './treatment-plan-detail.component.html',
    styleUrl: './treatment-plan-detail.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class TreatmentPlanDetailComponent implements OnInit, OnDestroy {
    plan = signal<TreatmentPlanResponse | null>(null);
    treatments = signal<TreatmentResponse[]>([]);
    loading = signal(true);
    saving = signal(false);
    showAddItem = signal(false);

    readonly planStatusOptions = PLAN_STATUS_OPTIONS;
    readonly itemStatusOptions = PLAN_ITEM_STATUS_OPTIONS;

    itemForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private planService: TreatmentPlanService,
        private treatmentService: TreatmentService,
        private authService: AuthService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildItemForm();
    }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!id) {
            this.router.navigate(['/modules/treatment-plan']);
            return;
        }
        this.loadPlan(id);
        this.loadTreatments();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private get idCompany(): number {
        return this.authService.idCompany()!;
    }

    // ── Carga ────────────────────────────────────────────────────────────────

    loadPlan(id: number): void {
        this.planService
            .getById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.plan.set(r.success ? r.data : null);
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                    this.router.navigate(['/modules/treatment-plan']);
                }
            });
    }

    reload(): void {
        const id = this.plan()?.idTreatmentPlan;
        if (id) this.loadPlan(id);
    }

    loadTreatments(): void {
        this.treatmentService
            .getAll(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) this.treatments.set(r.data ?? []);
                }
            });
    }

    // ── Ítem form ────────────────────────────────────────────────────────────

    private buildItemForm(): void {
        this.itemForm = this.fb.group({
            idTreatmentCatalog: [null, Validators.required],
            estimatedPrice: [null, [Validators.required, Validators.min(0)]],
            toothReference: [''],
            observations: ['']
        });
    }

    openAddItem(): void {
        this.itemForm.reset();
        this.showAddItem.set(true);
    }

    onTreatmentSelect(idTreatment: number): void {
        const t = this.treatments().find((x) => x.idTreatment === idTreatment);
        if (t) this.itemForm.patchValue({ estimatedPrice: t.basePrice });
    }

    submitItem(): void {
        if (this.itemForm.invalid) {
            this.itemForm.markAllAsTouched();
            return;
        }
        const plan = this.plan();
        if (!plan) return;
        this.saving.set(true);
        const v = this.itemForm.value;
        const nextOrder = (plan.items?.length ?? 0) + 1;

        const req: AddPlanItemRequest = {
            idTreatmentCatalog: v.idTreatmentCatalog,
            estimatedPrice: v.estimatedPrice,
            toothReference: v.toothReference || undefined,
            observations: v.observations || undefined
        };

        this.planService
            .addItem(plan.idTreatmentPlan, req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.saving.set(false);
                    if (r.success) {
                        this.showAddItem.set(false);
                        this.reload();
                        this.messageService.add({ severity: 'success', summary: 'Tratamiento agregado al plan' });
                    }
                },
                error: () => this.saving.set(false)
            });
    }

    confirmRemoveItem(item: TreatmentPlanItemResponse): void {
        this.confirmationService.confirm({
            message: `¿Eliminar <strong>${item.treatmentName}</strong> del plan?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.planService
                    .removeItem(this.plan()!.idTreatmentPlan, item.idTreatmentPlanItem)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.reload();
                            this.messageService.add({ severity: 'warn', summary: 'Ítem eliminado' });
                        }
                    });
            }
        });
    }

    changeItemStatus(item: TreatmentPlanItemResponse, status: TreatmentPlanItemStatus): void {
        this.planService
            .updateItemStatus(this.plan()!.idTreatmentPlan, item.idTreatmentPlanItem, status)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) {
                        this.reload();
                        this.messageService.add({ severity: 'info', summary: 'Estado actualizado' });
                    }
                }
            });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(f: string): boolean {
        const c = this.itemForm.get(f);
        return !!(c?.invalid && c.touched);
    }

    getPlanStatusInfo(s: string) {
        return this.planStatusOptions.find((o) => o.value === s) ?? { label: s, severity: 'secondary' };
    }
    getItemStatusInfo(s: string) {
        return this.itemStatusOptions.find((o) => o.value === s) ?? { label: s, severity: 'secondary' };
    }

    get totalEstimated(): number {
        return this.plan()?.items?.reduce((sum, i) => sum + i.estimatedPrice, 0) ?? 0;
    }
    get completedCount(): number {
        return this.plan()?.items?.filter((i) => i.status === 'COMPLETED').length ?? 0;
    }
    get totalCount(): number {
        return this.plan()?.items?.length ?? 0;
    }
    get progressPercent(): number {
        return this.totalCount ? Math.round((this.completedCount / this.totalCount) * 100) : 0;
    }

    get treatmentOptions() {
        return this.treatments()
            .filter((t) => t.isActive)
            .map((t) => ({ label: `${t.name} — ${t.category}`, value: t.idTreatment }));
    }

    canEdit(plan: TreatmentPlanResponse): boolean {
        return plan.status === 'DRAFT' || plan.status === 'ACTIVE';
    }

    goBack(): void {
        this.router.navigate(['/modules/treatment-plan']);
    }
}
