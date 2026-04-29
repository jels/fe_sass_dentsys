// ─── Cash Concept ─────────────────────────────────────────────────────────────

export type CashMovementType = 'INCOME' | 'EXPENSE';

export interface CashConceptResponse {
    idCashConcept: number;
    idCompany: number;
    name: string;
    movementType: CashMovementType;
    active: boolean;
    createdAt: string;
}

export interface CreateCashConceptRequest {
    idCompany: number;
    name: string;
    movementType: CashMovementType;
}

export interface UpdateCashConceptRequest {
    name: string;
    movementType: CashMovementType;
}

// ─── Cash Book ────────────────────────────────────────────────────────────────

// AUTO_CASH_INVOICE | AUTO_PAYMENT | MANUAL
export type CashBookOrigin = 'AUTO_CASH_INVOICE' | 'AUTO_PAYMENT' | 'MANUAL';

export interface CashBookResponse {
    idCashBook: number;
    idCompany: number;
    idBranch: number;
    branchName: string;
    idCashConcept: number;
    conceptName: string;
    idInvoice?: number;
    invoiceNumber?: string;
    idReceipt?: number;
    receiptNumber?: string;
    movementDatetime: string;
    movementType: CashMovementType;
    amount: number;
    paymentMethod: string;
    description?: string;
    origin: CashBookOrigin;
    createdAt: string;
}

export interface CreateCashBookRequest {
    idCompany: number;
    idBranch: number;
    idCashConcept: number;
    movementDatetime: string;
    movementType: CashMovementType;
    amount: number;
    paymentMethod: string;
    description?: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface CashBookStatsResponse {
    todayIncome: number;
    todayExpense: number;
    todayBalance: number;
    monthIncome: number;
    monthExpense: number;
    monthBalance: number;
    todayMovements: number;
}

// ─── Constantes UI ───────────────────────────────────────────────────────────

export const CASH_MOVEMENT_TYPE_OPTIONS = [
    { label: 'Ingreso', value: 'INCOME' },
    { label: 'Egreso', value: 'EXPENSE' }
];

export const CASH_ORIGIN_LABELS: Record<CashBookOrigin, string> = {
    AUTO_CASH_INVOICE: 'Factura contado',
    AUTO_PAYMENT: 'Abono/recibo',
    MANUAL: 'Manual'
};

export const PAYMENT_METHOD_OPTIONS_CASH = [
    { label: 'Efectivo', value: 'CASH' },
    { label: 'Transferencia', value: 'TRANSFER' },
    { label: 'Tarjeta', value: 'CARD' },
    { label: 'Cheque', value: 'CHECK' }
];
