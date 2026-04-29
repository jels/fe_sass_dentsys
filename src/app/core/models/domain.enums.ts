// ─── Roles del sistema ────────────────────────────────────────────────────────

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    DENTIST = 'DENTIST',
    RECEPTIONIST = 'RECEPTIONIST',
    ACCOUNTANT = 'ACCOUNTANT'
}

// ─── Estados genéricos ────────────────────────────────────────────────────────

export enum EntityStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

// ─── Estados de turno / cita ─────────────────────────────────────────────────

export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW'
}

// ─── Estados del plan de tratamiento ─────────────────────────────────────────

export enum TreatmentPlanStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

// ─── Estados de factura ───────────────────────────────────────────────────────

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    ISSUED = 'ISSUED',
    CANCELLED = 'CANCELLED'
}

// ─── Tipo de movimiento de caja ───────────────────────────────────────────────

export enum CashMovementType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

// ─── Condición de pago (SET Paraguay) ────────────────────────────────────────

export enum PaymentCondition {
    CASH = '1',
    CREDIT = '2'
}

// ─── Género del paciente ──────────────────────────────────────────────────────

export enum Gender {
    MALE = 'M',
    FEMALE = 'F',
    OTHER = 'O'
}
