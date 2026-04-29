// ─── Company ──────────────────────────────────────────────────────────────────

export interface CompanyResponse {
    idCompany: number;
    name: string;
    taxId: string; // RUC Paraguay
    address?: string;
    phone?: string;
    email?: string;
    active: boolean;
    createdAt: string;
}

export interface CreateCompanyRequest {
    name: string;
    taxId: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface UpdateCompanyRequest {
    name: string;
    taxId: string;
    address?: string;
    phone?: string;
    email?: string;
}

// ─── Branch ───────────────────────────────────────────────────────────────────

export interface BranchResponse {
    idBranch: number;
    idCompany: number;
    companyName: string;
    name: string;
    address?: string;
    phone?: string;
    establishmentCode: string; // 3 chars — SET Paraguay
    active: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateBranchRequest {
    idCompany: number;
    name: string;
    address?: string;
    phone?: string;
    establishmentCode: string;
}

export interface UpdateBranchRequest {
    name: string;
    address?: string;
    phone?: string;
    establishmentCode: string;
}
