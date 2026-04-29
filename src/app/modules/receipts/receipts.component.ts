import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GuaraniesPipe } from '../../shared/pipes/guaranies.pipe';
import { FechaLocalPipe } from '../../shared/pipes/fecha-local.pipe';
import { ReceiptResponse, ReceiptStampResponse, InvoiceResponse, CreateReceiptRequest, PAYMENT_METHOD_OPTIONS, RECEIPT_ORIGIN_OPTIONS } from '../../core/models/billing.models';
import { PatientResponse } from '../../core/models/clinical.models';
import { ReceiptService } from '../../core/services/receipt.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { PatientService } from '../../core/services/patient.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-receipts',
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
        IconFieldModule,
        InputIconModule,
        GuaraniesPipe,
        FechaLocalPipe
    ],
    templateUrl: './receipts.component.html',
    styleUrl: './receipts.component.scss',
    providers: [MessageService]
})
export class ReceiptsComponent implements OnInit, OnDestroy {
    receipts = signal<ReceiptResponse[]>([]);
    patients = signal<PatientResponse[]>([]);
    stamps = signal<ReceiptStampResponse[]>([]);
    invoices = signal<InvoiceResponse[]>([]);
    loading = signal(false);
    saving = signal(false);
    showForm = signal(false);
    showDetail = false;
    selected = signal<ReceiptResponse | null>(null);

    filterDateFrom: Date = new Date(new Date().setDate(1));
    filterDateTo: Date = new Date();
    filterPatient: number | null = null;

    readonly originOptions = RECEIPT_ORIGIN_OPTIONS;
    readonly payMethodOptions = PAYMENT_METHOD_OPTIONS;

    receiptForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private receiptService: ReceiptService,
        private invoiceService: InvoiceService,
        private patientService: PatientService,
        private authService: AuthService,
        private fb: FormBuilder,
        private messageService: MessageService
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

        this.receiptService
            .getActiveStamps(this.idCompany, this.idBranch)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) this.stamps.set(r.data ?? []);
                }
            });
    }

    loadPendingInvoices(idPatient: number): void {
        this.invoiceService
            .getAll(this.idCompany, { idPatient, status: 'ISSUED' })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) this.invoices.set(r.data ?? []);
                }
            });

        this.invoiceService
            .getAll(this.idCompany, { idPatient, status: 'PARTIAL' })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) this.invoices.update((prev) => [...prev, ...(r.data ?? [])]);
                }
            });
    }

    // ── Carga ────────────────────────────────────────────────────────────────

    load(): void {
        this.loading.set(true);
        this.receiptService
            .getAll(this.idCompany, {
                dateFrom: this.toIso(this.filterDateFrom),
                dateTo: this.toIso(this.filterDateTo),
                idPatient: this.filterPatient ?? undefined,
                idBranch: this.idBranch
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.receipts.set(r.success ? (r.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    // ── Formulario ───────────────────────────────────────────────────────────

    private buildForm(): void {
        this.receiptForm = this.fb.group({
            origin: ['DIRECT_INCOME', Validators.required],
            idPatient: [null, Validators.required],
            idInvoice: [null],
            idReceiptStamp: [null],
            amount: [null, [Validators.required, Validators.min(1)]],
            paymentMethod: ['CASH', Validators.required],
            concept: ['', Validators.required]
        });

        // Al cambiar origen → ajustar validaciones
        this.receiptForm
            .get('origin')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((origin) => {
                const invoiceCtrl = this.receiptForm.get('idInvoice');
                if (origin === 'INVOICE_PAYMENT') {
                    invoiceCtrl?.setValidators(Validators.required);
                } else {
                    invoiceCtrl?.clearValidators();
                    invoiceCtrl?.setValue(null);
                    this.invoices.set([]);
                }
                invoiceCtrl?.updateValueAndValidity();
            });

        // Al cambiar paciente con origen INVOICE_PAYMENT → cargar facturas pendientes
        this.receiptForm
            .get('idPatient')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((idPatient) => {
                if (idPatient && this.receiptForm.get('origin')?.value === 'INVOICE_PAYMENT') {
                    this.loadPendingInvoices(idPatient);
                }
            });

        // Al seleccionar factura → auto-completar monto y concepto
        this.receiptForm
            .get('idInvoice')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((idInvoice) => {
                const inv = this.invoices().find((i) => i.idInvoice === idInvoice);
                if (inv) {
                    this.receiptForm.patchValue(
                        {
                            amount: inv.outstandingBalance,
                            concept: `Pago factura ${inv.invoiceNumber}`
                        },
                        { emitEvent: false }
                    );
                }
            });
    }

    openCreate(): void {
        this.receiptForm.reset({ origin: 'DIRECT_INCOME', paymentMethod: 'CASH' });
        this.invoices.set([]);
        this.showForm.set(true);
    }

    openDetail(r: ReceiptResponse): void {
        this.selected.set(r);
        this.showDetail = true;
    }

    submit(): void {
        if (this.receiptForm.invalid) {
            this.receiptForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.receiptForm.value;

        const req: CreateReceiptRequest = {
            idCompany: this.idCompany,
            idBranch: this.idBranch,
            idPatient: v.idPatient,
            idInvoice: v.idInvoice || undefined,
            idReceiptStamp: v.idReceiptStamp || undefined,
            origin: v.origin,
            amount: v.amount,
            paymentMethod: v.paymentMethod,
            concept: v.concept
        };

        this.receiptService
            .create(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.saving.set(false);
                    if (r.success) {
                        this.showForm.set(false);
                        this.load();
                        this.messageService.add({ severity: 'success', summary: 'Recibo generado', detail: r.data.receiptNumber });
                    }
                },
                error: () => this.saving.set(false)
            });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(f: string): boolean {
        const c = this.receiptForm.get(f);
        return !!(c?.invalid && c.touched);
    }

    getOriginLabel(o: string): string {
        return o === 'INVOICE_PAYMENT' ? 'Pago factura' : 'Ingreso directo';
    }
    getMethodLabel(m: string): string {
        return ({ CASH: 'Efectivo', TRANSFER: 'Transferencia', CARD: 'Tarjeta', CHECK: 'Cheque' } as Record<string, string>)[m] ?? m;
    }

    get isInvoicePayment(): boolean {
        return this.receiptForm.get('origin')?.value === 'INVOICE_PAYMENT';
    }

    get patientOptions() {
        return this.patients().map((p) => ({ label: p.fullName, value: p.idPatient }));
    }
    get stampOptions() {
        return [{ label: 'Sin timbrado', value: null }, ...this.stamps().map((s) => ({ label: `${s.stampNumber} (${s.establishment}-${s.dispatchPoint})`, value: s.idReceiptStamp }))];
    }
    get invoiceOptions() {
        return this.invoices().map((i) => ({ label: `${i.invoiceNumber} — Saldo: ${i.outstandingBalance.toLocaleString('es-PY')} Gs.`, value: i.idInvoice }));
    }
    get patientFilterOpts() {
        return [{ label: 'Todos', value: null }, ...this.patientOptions];
    }

    get totalAmount(): number {
        return this.receipts().reduce((s, r) => s + r.amount, 0);
    }

    private toIso(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
