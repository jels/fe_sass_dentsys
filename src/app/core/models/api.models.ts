// ─── Wrapper genérico de respuesta del backend ───────────────────────────────

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
}

export interface ApiPageResponse<T> {
    success: boolean;
    message: string;
    data: PageData<T>;
    timestamp?: string;
}

export interface PageData<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// ─── Parámetros de paginación para requests ───────────────────────────────────

export interface PageParams {
    page: number;
    size: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
}

// ─── Opción genérica para dropdowns / selects ────────────────────────────────

export interface SelectOption {
    label: string;
    value: number | string;
    disabled?: boolean;
}

// ─── Auditoría base (campos compartidos por varias entidades) ────────────────

export interface AuditFields {
    createdAt?: string;
    updatedAt?: string;
    createdBy?: number;
    updatedBy?: number;
}
