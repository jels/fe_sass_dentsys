// ─── Invoice Stamp (timbrado de facturas) ────────────────────────────────────

import { SeverityType } from './constants/constantes.constants';

export interface InvoiceStampResponse {
    idInvoiceStamp: number;
    idCompany: number;
    idBranch: number;
    branchName: string;
    stampNumber: string;
    authorizationCode: string;
    establishment: string;
    dispatchPoint: string;
    sequenceStart: number;
    sequenceEnd: number;
    sequenceCurrent: number;
    validityStart: string;
    validityEnd: string;
    documentType: string;
    active: boolean;
    // Display helper: 001-001-0000001
    nextInvoiceNumber?: string;
}

// ─── Receipt Stamp (timbrado de recibos) ─────────────────────────────────────

export interface ReceiptStampResponse {
    idReceiptStamp: number;
    idCompany: number;
    idBranch: number;
    branchName: string;
    stampNumber: string;
    authorizationCode: string;
    establishment: string;
    dispatchPoint: string;
    sequenceStart: number;
    sequenceEnd: number;
    sequenceCurrent: number;
    validityStart: string;
    validityEnd: string;
    active: boolean;
    nextReceiptNumber?: string;
}

// ─── Invoice Item (nuevo — a agregar en el backend) ───────────────────────────

export interface InvoiceItemResponse {
    idInvoiceItem: number;
    idInvoice: number;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    exemptAmount: number;
    taxable5: number;
    taxable10: number;
    vat5: number;
    vat10: number;
    subtotal: number;
}

export interface CreateInvoiceItemRequest {
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxType: 'EXEMPT' | 'VAT5' | 'VAT10';
}

// ─── Invoice ─────────────────────────────────────────────────────────────────

// ISSUED | PARTIAL | PAID | VOIDED
export type InvoiceStatus = 'ISSUED' | 'PARTIAL' | 'PAID' | 'VOIDED';

// CASH | CREDIT
export type PaymentCondition = 'CASH' | 'CREDIT';

export interface InvoiceResponse {
    idInvoice: number;
    idCompany: number;
    idBranch: number;
    branchName: string;
    idPatient: number;
    patientFullName: string;
    patientIdNumber?: string;
    idInvoiceStamp: number;
    stampNumber: string;
    invoiceNumber: string;
    paymentCondition: PaymentCondition;
    issueDatetime: string;
    concept: string;
    exemptAmount: number;
    taxable5: number;
    taxable10: number;
    vat5: number;
    vat10: number;
    total: number;
    totalPaid: number;
    outstandingBalance: number;
    status: InvoiceStatus;
    notes?: string;
    idAppointment?: number;
    idPerformedTreatment?: number;
    items?: InvoiceItemResponse[];
    createdAt: string;
    updatedAt?: string;
}

export interface CreateInvoiceRequest {
    idCompany: number;
    idBranch: number;
    idPatient: number;
    idInvoiceStamp: number;
    paymentCondition: PaymentCondition;
    concept: string;
    notes?: string;
    idAppointment?: number;
    idPerformedTreatment?: number;
    items: CreateInvoiceItemRequest[];
}

export interface VoidInvoiceRequest {
    reason: string;
}

// ─── Receipt ─────────────────────────────────────────────────────────────────

// INVOICE_PAYMENT | DIRECT_INCOME
export type ReceiptOrigin = 'INVOICE_PAYMENT' | 'DIRECT_INCOME';

// CASH | TRANSFER | CARD | CHECK
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'CHECK';

export interface ReceiptResponse {
    idReceipt: number;
    idCompany: number;
    idBranch: number;
    branchName: string;
    idPatient: number;
    patientFullName: string;
    patientIdNumber?: string;
    idReceiptStamp?: number;
    stampNumber?: string;
    receiptNumber: string;
    idInvoice?: number;
    invoiceNumber?: string;
    origin: ReceiptOrigin;
    issueDatetime: string;
    amount: number;
    paymentMethod: PaymentMethod;
    concept: string;
    createdAt: string;
}

export interface CreateReceiptRequest {
    idCompany: number;
    idBranch: number;
    idPatient: number;
    idReceiptStamp?: number;
    idInvoice?: number;
    origin: ReceiptOrigin;
    amount: number;
    paymentMethod: PaymentMethod;
    concept: string;
}

// ─── Constantes UI ───────────────────────────────────────────────────────────

export const INVOICE_STATUS_OPTIONS: { label: string; value: InvoiceStatus; severity: SeverityType }[] = [
    { label: 'Emitida', value: 'ISSUED', severity: 'info' },
    { label: 'Pago parcial', value: 'PARTIAL', severity: 'warn' },
    { label: 'Pagada', value: 'PAID', severity: 'success' },
    { label: 'Anulada', value: 'VOIDED', severity: 'danger' }
];

export const PAYMENT_CONDITION_OPTIONS: { label: string; value: PaymentCondition }[] = [
    { label: 'Contado', value: 'CASH' },
    { label: 'Crédito', value: 'CREDIT' }
];

export const PAYMENT_METHOD_OPTIONS: { label: string; value: PaymentMethod }[] = [
    { label: 'Efectivo', value: 'CASH' },
    { label: 'Transferencia', value: 'TRANSFER' },
    { label: 'Tarjeta', value: 'CARD' },
    { label: 'Cheque', value: 'CHECK' }
];

export const RECEIPT_ORIGIN_OPTIONS: { label: string; value: ReceiptOrigin }[] = [
    { label: 'Pago de factura', value: 'INVOICE_PAYMENT' },
    { label: 'Ingreso directo', value: 'DIRECT_INCOME' }
];

export const TAX_TYPE_OPTIONS = [
    { label: 'Exento', value: 'EXEMPT' },
    { label: 'IVA 5%', value: 'VAT5' },
    { label: 'IVA 10%', value: 'VAT10' }
];
