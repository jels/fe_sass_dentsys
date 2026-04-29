import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import {
    InvoiceResponse,
    InvoiceStampResponse,
    CreateInvoiceRequest,
    CreateInvoiceItemRequest,
    InvoiceStatus,
    PaymentCondition,
    INVOICE_STATUS_OPTIONS,
    PAYMENT_CONDITION_OPTIONS,
    TAX_TYPE_OPTIONS,
    CreateReceiptRequest,
    PAYMENT_METHOD_OPTIONS
} from '../../core/models/billing.models';
import { PatientResponse } from '../../core/models/clinical.models';
import { InvoiceService } from '../../core/services/invoice.service';
import { ReceiptService } from '../../core/services/receipt.service';
import { PatientService } from '../../core/services/patient.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-invoicing',
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
    templateUrl: './invoicing.component.html',
    styleUrl: './invoicing.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class InvoicingComponent implements OnInit, OnDestroy {
    invoices = signal<InvoiceResponse[]>([]);
    patients = signal<PatientResponse[]>([]);
    stamps = signal<InvoiceStampResponse[]>([]);
    loading = signal(false);
    saving = signal(false);
    savingPay = signal(false);

    showForm = signal(false);
    showDetail = signal(false);
    showPay = signal(false);
    showVoid = signal(false);

    selected = signal<InvoiceResponse | null>(null);

    // Filtros
    filterDateFrom: Date = new Date(new Date().setDate(1)); // 1er día del mes
    filterDateTo: Date = new Date();
    filterStatus: InvoiceStatus | '' = '';
    filterPatient: number | null = null;

    readonly statusOptions = INVOICE_STATUS_OPTIONS;
    readonly statusFilterOpts = [{ label: 'Todos los estados', value: '' }, ...INVOICE_STATUS_OPTIONS];
    readonly conditionOptions = PAYMENT_CONDITION_OPTIONS;
    readonly taxTypeOptions = TAX_TYPE_OPTIONS;
    readonly payMethodOptions = PAYMENT_METHOD_OPTIONS;

    invoiceForm!: FormGroup;
    payForm!: FormGroup;
    voidReason = '';

    private destroy$ = new Subject<void>();

    constructor(
        private invoiceService: InvoiceService,
        private receiptService: ReceiptService,
        private patientService: PatientService,
        private authService: AuthService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildInvoiceForm();
        this.buildPayForm();
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

        this.invoiceService
            .getActiveStamps(this.idCompany, this.idBranch)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) this.stamps.set(r.data ?? []);
                }
            });
    }

    // ── Carga ────────────────────────────────────────────────────────────────

    load(): void {
        this.loading.set(true);
        this.invoiceService
            .getAll(this.idCompany, {
                dateFrom: this.toIso(this.filterDateFrom),
                dateTo: this.toIso(this.filterDateTo),
                status: this.filterStatus || undefined,
                idPatient: this.filterPatient ?? undefined,
                idBranch: this.idBranch
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.invoices.set(r.success ? (r.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    // ── Formulario de factura ─────────────────────────────────────────────────

    private buildInvoiceForm(): void {
        this.invoiceForm = this.fb.group({
            idPatient: [null, Validators.required],
            idInvoiceStamp: [null, Validators.required],
            paymentCondition: ['CASH', Validators.required],
            concept: ['', Validators.required],
            notes: [''],
            items: this.fb.array([])
        });
    }

    get itemsArray(): FormArray {
        return this.invoiceForm.get('items') as FormArray;
    }

    buildItemGroup(): FormGroup {
        return this.fb.group({
            description: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [null, [Validators.required, Validators.min(0)]],
            discount: [0, [Validators.min(0)]],
            taxType: ['VAT10', Validators.required]
        });
    }

    addItem(): void {
        this.itemsArray.push(this.buildItemGroup());
    }

    removeItem(i: number): void {
        if (this.itemsArray.length > 1) this.itemsArray.removeAt(i);
    }

    openCreate(): void {
        this.invoiceForm.reset({ paymentCondition: 'CASH' });
        while (this.itemsArray.length) this.itemsArray.removeAt(0);
        this.addItem();
        this.showForm.set(true);
    }

    openDetail(inv: InvoiceResponse): void {
        this.invoiceService
            .getById(inv.idInvoice)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    if (r.success) {
                        this.selected.set(r.data);
                        this.showDetail.set(true);
                    }
                }
            });
    }

    openPay(inv: InvoiceResponse): void {
        this.selected.set(inv);
        this.payForm.reset({
            amount: inv.outstandingBalance,
            paymentMethod: 'CASH',
            concept: `Pago factura ${inv.invoiceNumber}`
        });
        this.showPay.set(true);
    }

    openVoid(inv: InvoiceResponse): void {
        this.selected.set(inv);
        this.voidReason = '';
        this.showVoid.set(true);
    }

    submitInvoice(): void {
        if (this.invoiceForm.invalid) {
            this.invoiceForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.invoiceForm.value;

        const items: CreateInvoiceItemRequest[] = v.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount ?? 0,
            taxType: item.taxType
        }));

        const req: CreateInvoiceRequest = {
            idCompany: this.idCompany,
            idBranch: this.idBranch,
            idPatient: v.idPatient,
            idInvoiceStamp: v.idInvoiceStamp,
            paymentCondition: v.paymentCondition,
            concept: v.concept,
            notes: v.notes || undefined,
            items
        };

        this.invoiceService
            .create(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.saving.set(false);
                    if (r.success) {
                        this.showForm.set(false);
                        this.load();
                        this.messageService.add({ severity: 'success', summary: 'Factura emitida', detail: r.data.invoiceNumber });
                    }
                },
                error: () => this.saving.set(false)
            });
    }

    // ── Pago de factura ───────────────────────────────────────────────────────

    private buildPayForm(): void {
        this.payForm = this.fb.group({
            amount: [null, [Validators.required, Validators.min(1)]],
            paymentMethod: ['CASH', Validators.required],
            concept: ['', Validators.required],
            idReceiptStamp: [null]
        });
    }

    submitPay(): void {
        if (this.payForm.invalid) {
            this.payForm.markAllAsTouched();
            return;
        }
        const inv = this.selected();
        if (!inv) return;
        this.savingPay.set(true);
        const v = this.payForm.value;

        const req: CreateReceiptRequest = {
            idCompany: this.idCompany,
            idBranch: this.idBranch,
            idPatient: inv.idPatient,
            idInvoice: inv.idInvoice,
            idReceiptStamp: v.idReceiptStamp || undefined,
            origin: 'INVOICE_PAYMENT',
            amount: v.amount,
            paymentMethod: v.paymentMethod,
            concept: v.concept
        };

        this.receiptService
            .create(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.savingPay.set(false);
                    if (r.success) {
                        this.showPay.set(false);
                        this.showDetail.set(false);
                        this.load();
                        this.messageService.add({ severity: 'success', summary: 'Pago registrado', detail: r.data.receiptNumber });
                    }
                },
                error: () => this.savingPay.set(false)
            });
    }

    // ── Anulación ─────────────────────────────────────────────────────────────

    submitVoid(): void {
        if (!this.voidReason.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Ingresá el motivo de anulación' });
            return;
        }
        const inv = this.selected();
        if (!inv) return;
        this.confirmationService.confirm({
            message: `¿Anular la factura <strong>${inv.invoiceNumber}</strong>? Esta acción no se puede deshacer.`,
            header: 'Confirmar anulación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.invoiceService
                    .void(inv.idInvoice, { reason: this.voidReason })
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.showVoid.set(false);
                            this.showDetail.set(false);
                            this.load();
                            this.messageService.add({ severity: 'warn', summary: 'Factura anulada' });
                        }
                    });
            }
        });
    }

    // ── Cálculos por ítem ─────────────────────────────────────────────────────

    calcItemSubtotal(item: any): number {
        const base = (item.quantity ?? 0) * (item.unitPrice ?? 0) - (item.discount ?? 0);
        return Math.max(0, base);
    }

    calcTotals(): { exempt: number; base5: number; base10: number; vat5: number; vat10: number; total: number } {
        let exempt = 0,
            base5 = 0,
            base10 = 0,
            vat5 = 0,
            vat10 = 0;
        for (const ctrl of this.itemsArray.controls) {
            const v = ctrl.value;
            const sub = this.calcItemSubtotal(v);
            if (v.taxType === 'EXEMPT') exempt += sub;
            if (v.taxType === 'VAT5') {
                vat5 += sub / 21;
                base5 += sub - sub / 21;
            }
            if (v.taxType === 'VAT10') {
                vat10 += sub / 11;
                base10 += sub - sub / 11;
            }
        }
        return {
            exempt: Math.round(exempt),
            base5: Math.round(base5),
            base10: Math.round(base10),
            vat5: Math.round(vat5),
            vat10: Math.round(vat10),
            total: Math.round(exempt + base5 + vat5 + base10 + vat10)
        };
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(field: string, form: FormGroup = this.invoiceForm): boolean {
        const c = form.get(field);
        return !!(c?.invalid && c.touched);
    }

    isItemInvalid(i: number, field: string): boolean {
        const c = (this.itemsArray.at(i) as FormGroup).get(field);
        return !!(c?.invalid && c.touched);
    }

    getStatusInfo(s: string) {
        return this.statusOptions.find((o) => o.value === s) ?? { label: s, severity: 'secondary' };
    }

    getConditionLabel(c: string): string {
        return c === 'CASH' ? 'Contado' : 'Crédito';
    }

    get patientOptions() {
        return this.patients().map((p) => ({ label: `${p.fullName} ${p.idNumber ? '· ' + p.idNumber : ''}`, value: p.idPatient }));
    }
    get stampOptions() {
        return this.stamps().map((s) => ({ label: `${s.stampNumber} (${s.establishment}-${s.dispatchPoint})`, value: s.idInvoiceStamp }));
    }
    get patientFilterOpts() {
        return [{ label: 'Todos los pacientes', value: null }, ...this.patientOptions];
    }

    get totalSummary() {
        return this.invoices().reduce(
            (acc, inv) => {
                if (inv.status !== 'VOIDED') {
                    acc.total += inv.total;
                    acc.paid += inv.totalPaid;
                    acc.pending += inv.outstandingBalance;
                }
                return acc;
            },
            { total: 0, paid: 0, pending: 0 }
        );
    }

    private toIso(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
