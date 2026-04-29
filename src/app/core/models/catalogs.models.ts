// ─── Dentist ──────────────────────────────────────────────────────────────────

export interface DentistResponse {
    idDentist: number;
    firstName: string;
    lastName: string;
    fullName: string;
    documentNumber: string;
    phone?: string;
    email?: string;
    specialty?: string;
    registrationNumber?: string;
    idBranch: number;
    branchName: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateDentistRequest {
    firstName: string;
    lastName: string;
    documentNumber: string;
    phone?: string;
    email?: string;
    specialty?: string;
    registrationNumber?: string;
    idBranch: number;
    idCompany: number;
}

export interface UpdateDentistRequest extends Omit<CreateDentistRequest, 'idCompany'> {}

// ─── Treatment Catalog ────────────────────────────────────────────────────────

export interface TreatmentResponse {
    idTreatment: number;
    name: string;
    description?: string;
    category: string;
    basePrice: number;
    durationMinutes: number;
    requiresLab: boolean;
    isActive: boolean;
    idCompany: number;
    createdAt: string;
}

export interface CreateTreatmentRequest {
    name: string;
    description?: string;
    category: string;
    basePrice: number;
    durationMinutes: number;
    requiresLab: boolean;
    idCompany: number;
}

export interface UpdateTreatmentRequest extends Omit<CreateTreatmentRequest, 'idCompany'> {}

export const TREATMENT_CATEGORIES: { label: string; value: string }[] = [
    { label: 'Diagnóstico', value: 'DIAGNOSIS' },
    { label: 'Prevención', value: 'PREVENTION' },
    { label: 'Operatoria', value: 'OPERATIVE' },
    { label: 'Endodoncia', value: 'ENDODONTICS' },
    { label: 'Periodoncia', value: 'PERIODONTICS' },
    { label: 'Cirugía', value: 'SURGERY' },
    { label: 'Ortodoncia', value: 'ORTHODONTICS' },
    { label: 'Prótesis', value: 'PROSTHETICS' },
    { label: 'Implantología', value: 'IMPLANTOLOGY' },
    { label: 'Estética', value: 'AESTHETICS' },
    { label: 'Radiología', value: 'RADIOLOGY' },
    { label: 'Otro', value: 'OTHER' }
];

// ─── Stamps (Timbrados SET Paraguay) ─────────────────────────────────────────

export interface StampResponse {
    idStamp: number;
    stampNumber: string;
    establishmentCode: string;
    dispatchPointCode: string;
    documentType: string;
    startNumber: number;
    endNumber: number;
    currentNumber: number;
    validFrom: string;
    validTo: string;
    isActive: boolean;
    idBranch: number;
    branchName: string;
    idCompany: number;
    createdAt: string;
}

export interface CreateStampRequest {
    stampNumber: string;
    establishmentCode: string;
    dispatchPointCode: string;
    documentType: string;
    startNumber: number;
    endNumber: number;
    validFrom: string;
    validTo: string;
    idBranch: number;
    idCompany: number;
}

export interface UpdateStampRequest extends Omit<CreateStampRequest, 'idCompany'> {}

export const STAMP_DOCUMENT_TYPES: { label: string; value: string }[] = [
    { label: 'Factura', value: 'INVOICE' },
    { label: 'Nota de crédito', value: 'CREDIT_NOTE' },
    { label: 'Nota de débito', value: 'DEBIT_NOTE' },
    { label: 'Autofactura', value: 'SELF_INVOICE' }
];
