// ─── Patient ──────────────────────────────────────────────────────────────────

import { SeverityType } from './constants/constantes.constants';

export interface PatientResponse {
    idPatient: number;
    firstName: string;
    lastName: string;
    fullName: string;
    idNumber?: string;
    birthDate?: string; // ISO date: yyyy-MM-dd
    gender?: 'M' | 'F';
    phone?: string;
    email?: string;
    address?: string;
    allergies?: string;
    clinicalNotes?: string;
    age?: number;
    idCompany: number;
    active: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreatePatientRequest {
    firstName: string;
    lastName: string;
    idNumber?: string;
    birthDate?: string;
    gender?: 'M' | 'F';
    phone?: string;
    email?: string;
    address?: string;
    allergies?: string;
    clinicalNotes?: string;
    idCompany: number;
}

export interface UpdatePatientRequest {
    firstName: string;
    lastName: string;
    idNumber?: string;
    birthDate?: string;
    gender?: 'M' | 'F';
    phone?: string;
    email?: string;
    address?: string;
    allergies?: string;
    clinicalNotes?: string;
}

export interface PatientFilters {
    search?: string;
    gender?: string;
    active?: boolean;
}

// ─── Appointment ──────────────────────────────────────────────────────────────

// PENDING | CONFIRMED | ATTENDED | CANCELLED | NO_SHOW
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';

export interface AppointmentResponse {
    idAppointment: number;
    idCompany: number;
    idBranch: number;
    branchName: string;
    idPatient: number;
    patientFullName: string;
    patientPhone?: string;
    idDoctor: number;
    doctorFullName: string;
    startDatetime: string; // ISO datetime
    endDatetime?: string;
    status: AppointmentStatus;
    reason?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateAppointmentRequest {
    idCompany: number;
    idBranch: number;
    idPatient: number;
    idDoctor: number;
    startDatetime: string;
    endDatetime?: string;
    reason?: string;
    notes?: string;
}

export interface UpdateAppointmentRequest {
    idBranch: number;
    idPatient: number;
    idDoctor: number;
    startDatetime: string;
    endDatetime?: string;
    reason?: string;
    notes?: string;
}

export interface AppointmentFilters {
    dateFrom?: string;
    dateTo?: string;
    idDoctor?: number;
    idPatient?: number;
    status?: AppointmentStatus;
    idBranch?: number;
}

// ─── Constantes UI ───────────────────────────────────────────────────────────

export const APPOINTMENT_STATUS_OPTIONS: { label: string; value: AppointmentStatus; severity: SeverityType }[] = [
    { label: 'Pendiente', value: 'PENDING', severity: 'warn' },
    { label: 'Confirmado', value: 'CONFIRMED', severity: 'info' },
    { label: 'Atendido', value: 'ATTENDED', severity: 'success' },
    { label: 'Cancelado', value: 'CANCELLED', severity: 'danger' },
    { label: 'No se presentó', value: 'NO_SHOW', severity: 'secondary' }
];

export const GENDER_OPTIONS = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' }
];

// ─── Treatment Plan ───────────────────────────────────────────────────────────

// DRAFT | ACTIVE | COMPLETED | CANCELLED
export type TreatmentPlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface TreatmentPlanResponse {
    idTreatmentPlan: number;
    idCompany: number;
    idBranch: number;
    branchName: string;
    idPatient: number;
    patientFullName: string;
    idDoctor: number;
    doctorFullName: string;
    title: string;
    description?: string;
    status: TreatmentPlanStatus;
    startDate?: string; // yyyy-MM-dd
    estimatedEndDate?: string; // yyyy-MM-dd
    totalEstimated: number; // suma de items
    completedItems: number;
    totalItems: number;
    createdAt: string;
    updatedAt?: string;
    items?: TreatmentPlanItemResponse[];
}

export interface CreateTreatmentPlanRequest {
    idCompany: number;
    idBranch: number;
    idPatient: number;
    idDoctor: number;
    title: string;
    description?: string;
    startDate?: string;
    estimatedEndDate?: string;
    items: CreateTreatmentPlanItemRequest[];
}

export interface UpdateTreatmentPlanRequest {
    idPatient: number;
    idDoctor: number;
    title: string;
    description?: string;
    startDate?: string;
    estimatedEndDate?: string;
}

// ─── Treatment Plan Item ──────────────────────────────────────────────────────

// PENDING | IN_PROGRESS | COMPLETED | CANCELLED
export type TreatmentPlanItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TreatmentPlanItemResponse {
    idTreatmentPlanItem: number;
    idTreatmentPlan: number;
    idTreatmentCatalog: number;
    treatmentName: string;
    treatmentCategory: string;
    idPerformedTreatment?: number; // vinculado cuando fue ejecutado
    itemOrder: number;
    toothReference?: string;
    estimatedPrice: number;
    status: TreatmentPlanItemStatus;
    observations?: string;
    createdAt: string;
}

export interface CreateTreatmentPlanItemRequest {
    idTreatmentCatalog: number;
    itemOrder: number;
    toothReference?: string;
    estimatedPrice: number;
    observations?: string;
}

export interface AddPlanItemRequest {
    idTreatmentCatalog: number;
    toothReference?: string;
    estimatedPrice: number;
    observations?: string;
}

// ─── Performed Treatment ──────────────────────────────────────────────────────

// PERFORMED | BILLED | CANCELLED
export type PerformedTreatmentStatus = 'PERFORMED' | 'BILLED' | 'CANCELLED';

export interface PerformedTreatmentResponse {
    idPerformedTreatment: number;
    idCompany: number;
    idBranch: number;
    branchName: string;
    idPatient: number;
    patientFullName: string;
    idTreatmentCatalog: number;
    treatmentName: string;
    treatmentCategory: string;
    idDoctor: number;
    doctorFullName: string;
    idAppointment?: number;
    performedDate: string; // yyyy-MM-dd
    toothReference?: string;
    actualCost: number;
    chargedPrice: number;
    priceAdjustmentReason?: string;
    observations?: string;
    status: PerformedTreatmentStatus;
    createdAt: string;
    updatedAt?: string;
}

export interface CreatePerformedTreatmentRequest {
    idCompany: number;
    idBranch: number;
    idPatient: number;
    idTreatmentCatalog: number;
    idDoctor: number;
    idAppointment?: number;
    performedDate: string;
    toothReference?: string;
    actualCost: number;
    chargedPrice: number;
    priceAdjustmentReason?: string;
    observations?: string;
}

export interface UpdatePerformedTreatmentRequest {
    performedDate: string;
    toothReference?: string;
    actualCost: number;
    chargedPrice: number;
    priceAdjustmentReason?: string;
    observations?: string;
}

// ─── Constantes UI ───────────────────────────────────────────────────────────

export const PLAN_STATUS_OPTIONS: { label: string; value: TreatmentPlanStatus; severity: SeverityType }[] = [
    { label: 'Borrador', value: 'DRAFT', severity: 'secondary' },
    { label: 'Activo', value: 'ACTIVE', severity: 'info' },
    { label: 'Completado', value: 'COMPLETED', severity: 'success' },
    { label: 'Cancelado', value: 'CANCELLED', severity: 'danger' }
];

export const PLAN_ITEM_STATUS_OPTIONS: { label: string; value: TreatmentPlanItemStatus; severity: SeverityType }[] = [
    { label: 'Pendiente', value: 'PENDING', severity: 'warn' },
    { label: 'En progreso', value: 'IN_PROGRESS', severity: 'info' },
    { label: 'Completado', value: 'COMPLETED', severity: 'success' },
    { label: 'Cancelado', value: 'CANCELLED', severity: 'danger' }
];

export const PERFORMED_STATUS_OPTIONS: { label: string; value: PerformedTreatmentStatus; severity: SeverityType }[] = [
    { label: 'Realizado', value: 'PERFORMED', severity: 'success' },
    { label: 'Facturado', value: 'BILLED', severity: 'info' },
    { label: 'Cancelado', value: 'CANCELLED', severity: 'danger' }
];
