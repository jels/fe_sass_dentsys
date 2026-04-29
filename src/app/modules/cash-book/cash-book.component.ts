import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
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
import {
    CashBookResponse,
    CashConceptResponse,
    CashBookStatsResponse,
    CreateCashBookRequest,
    CreateCashConceptRequest,
    UpdateCashConceptRequest,
    CashMovementType,
    CASH_MOVEMENT_TYPE_OPTIONS,
    CASH_ORIGIN_LABELS,
    PAYMENT_METHOD_OPTIONS_CASH
} from '../../core/models/cashbook.models';
import { CashBookService } from '../../core/services/cash-book.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-cash-book',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DatePickerModule,
        DialogModule,
        DividerModule,
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
        GuaraniesPipe
    ],
    templateUrl: './cash-book.component.html',
    styleUrl: './cash-book.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class CashBookComponent implements OnInit, OnDestroy {
    movements = signal<CashBookResponse[]>([]);
    concepts = signal<CashConceptResponse[]>([]);
    stats = signal<CashBookStatsResponse | null>(null);

    loadingMovements = signal(false);
    loadingStats = signal(false);
    saving = signal(false);
    savingConcept = signal(false);

    showForm = signal(false);
    showConcepts = signal(false);
    showConceptForm = signal(false);
    isConceptEdit = signal(false);
    editingConceptId = signal<number | null>(null);

    // Filtros
    filterDate: Date = new Date();
    filterType: CashMovementType | '' = '';
    filterConcept: number | null = null;

    readonly typeOptions = CASH_MOVEMENT_TYPE_OPTIONS;
    readonly typeFilterOpts = [{ label: 'Todos', value: '' }, ...CASH_MOVEMENT_TYPE_OPTIONS];
    readonly payMethodOptions = PAYMENT_METHOD_OPTIONS_CASH;
    readonly originLabels = CASH_ORIGIN_LABELS;

    movementForm!: FormGroup;
    conceptForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private cashBookService: CashBookService,
        private authService: AuthService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildMovementForm();
        this.buildConceptForm();
    }

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
        this.loadStats();
        this.loadMovements();
        this.loadConcepts();
    }

    loadStats(): void {
        this.loadingStats.set(true);
        this.cashBookService
            .getStats(this.idCompany, this.idBranch)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.stats.set(r.success ? r.data : null);
                    this.loadingStats.set(false);
                },
                error: () => this.loadingStats.set(false)
            });
    }

    loadMovements(): void {
        this.loadingMovements.set(true);
        const dateStr = this.toIso(this.filterDate);
        this.cashBookService
            .getMovements(this.idCompany, {
                dateFrom: dateStr,
                dateTo: dateStr,
                movementType: this.filterType || undefined,
                idCashConcept: this.filterConcept ?? undefined,
                idBranch: this.idBranch
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.movements.set(r.success ? (r.data ?? []) : []);
                    this.loadingMovements.set(false);
                },
                error: () => this.loadingMovements.set(false)
            });
    }

    loadConcepts(): void {
        this.cashBookService
            .getConcepts(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) this.concepts.set(r.data ?? []);
                }
            });
    }

    // ── Navegación por día ───────────────────────────────────────────────────

    prevDay(): void {
        this.shiftDay(-1);
    }
    nextDay(): void {
        this.shiftDay(+1);
    }
    goToday(): void {
        this.filterDate = new Date();
        this.loadAll();
    }

    private shiftDay(delta: number): void {
        const d = new Date(this.filterDate);
        d.setDate(d.getDate() + delta);
        this.filterDate = d;
        this.loadStats();
        this.loadMovements();
    }

    get isToday(): boolean {
        return this.filterDate.toDateString() === new Date().toDateString();
    }

    // ── Formulario movimiento manual ─────────────────────────────────────────

    private buildMovementForm(): void {
        this.movementForm = this.fb.group({
            movementType: ['INCOME', Validators.required],
            idCashConcept: [null, Validators.required],
            movementDatetime: [new Date(), Validators.required],
            amount: [null, [Validators.required, Validators.min(1)]],
            paymentMethod: ['CASH', Validators.required],
            description: ['']
        });

        // Al cambiar tipo limpiar concepto si no corresponde
        this.movementForm
            .get('movementType')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((type) => {
                const currentId = this.movementForm.get('idCashConcept')?.value;
                const valid = this.concepts().find((c) => c.idCashConcept === currentId && c.movementType === type);
                if (!valid) this.movementForm.patchValue({ idCashConcept: null });
            });
    }

    openCreate(preType?: CashMovementType): void {
        this.movementForm.reset({
            movementType: preType ?? 'INCOME',
            movementDatetime: new Date(this.filterDate),
            paymentMethod: 'CASH'
        });
        this.showForm.set(true);
    }

    submitMovement(): void {
        if (this.movementForm.invalid) {
            this.movementForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.movementForm.value;

        const req: CreateCashBookRequest = {
            idCompany: this.idCompany,
            idBranch: this.idBranch,
            idCashConcept: v.idCashConcept,
            movementType: v.movementType,
            movementDatetime: (v.movementDatetime as Date).toISOString(),
            amount: v.amount,
            paymentMethod: v.paymentMethod,
            description: v.description || undefined
        };

        this.cashBookService
            .createManual(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.saving.set(false);
                    if (r.success) {
                        this.showForm.set(false);
                        this.loadAll();
                        this.messageService.add({ severity: 'success', summary: `${v.movementType === 'INCOME' ? 'Ingreso' : 'Egreso'} registrado` });
                    }
                },
                error: () => this.saving.set(false)
            });
    }

    // ── Gestión de conceptos ─────────────────────────────────────────────────

    private buildConceptForm(): void {
        this.conceptForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            movementType: ['INCOME', Validators.required]
        });
    }

    openCreateConcept(): void {
        this.isConceptEdit.set(false);
        this.editingConceptId.set(null);
        this.conceptForm.reset({ movementType: 'INCOME' });
        this.showConceptForm.set(true);
    }

    openEditConcept(c: CashConceptResponse): void {
        this.isConceptEdit.set(true);
        this.editingConceptId.set(c.idCashConcept);
        this.conceptForm.patchValue({ name: c.name, movementType: c.movementType });
        this.showConceptForm.set(true);
    }

    submitConcept(): void {
        if (this.conceptForm.invalid) {
            this.conceptForm.markAllAsTouched();
            return;
        }
        this.savingConcept.set(true);
        const v = this.conceptForm.value;

        const call$ = this.isConceptEdit() ? this.cashBookService.updateConcept(this.editingConceptId()!, v as UpdateCashConceptRequest) : this.cashBookService.createConcept({ ...v, idCompany: this.idCompany } as CreateCashConceptRequest);

        call$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (r) => {
                this.savingConcept.set(false);
                if (r.success) {
                    this.showConceptForm.set(false);
                    this.loadConcepts();
                    this.messageService.add({ severity: 'success', summary: this.isConceptEdit() ? 'Concepto actualizado' : 'Concepto creado' });
                }
            },
            error: () => this.savingConcept.set(false)
        });
    }

    confirmToggleConcept(c: CashConceptResponse): void {
        const action = c.active ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
            message: `¿Desea ${action} el concepto <strong>${c.name}</strong>?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.cashBookService
                    .toggleConcept(c.idCashConcept)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadConcepts();
                            this.messageService.add({ severity: 'info', summary: `Concepto ${action === 'activar' ? 'activado' : 'desactivado'}` });
                        }
                    });
            }
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(f: string, form: FormGroup = this.movementForm): boolean {
        const c = form.get(f);
        return !!(c?.invalid && c.touched);
    }

    get conceptsForType(): CashConceptResponse[] {
        const type = this.movementForm.get('movementType')?.value;
        return this.concepts().filter((c) => c.active && c.movementType === type);
    }

    get conceptOptions() {
        return this.conceptsForType.map((c) => ({ label: c.name, value: c.idCashConcept }));
    }

    get conceptFilterOpts() {
        return [{ label: 'Todos los conceptos', value: null }, ...this.concepts().map((c) => ({ label: c.name, value: c.idCashConcept }))];
    }

    get totalIncome(): number {
        return this.movements()
            .filter((m) => m.movementType === 'INCOME')
            .reduce((s, m) => s + m.amount, 0);
    }
    get totalExpense(): number {
        return this.movements()
            .filter((m) => m.movementType === 'EXPENSE')
            .reduce((s, m) => s + m.amount, 0);
    }
    get balance(): number {
        return this.totalIncome - this.totalExpense;
    }

    getOriginLabel(origin: string): string {
        return this.originLabels[origin as keyof typeof this.originLabels] ?? origin;
    }
    getMethodLabel(m: string): string {
        return ({ CASH: 'Efectivo', TRANSFER: 'Transferencia', CARD: 'Tarjeta', CHECK: 'Cheque' } as Record<string, string>)[m] ?? m;
    }

    private toIso(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
