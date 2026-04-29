// ─── Auth models ─────────────────────────────────────────────────────────────

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: AuthUser;
}

export interface AuthUser {
    idUser: number;
    username: string;
    fullName: string;
    email: string;
    roles: string[];
    idCompany: number;
    companyName: string;
    idBranch: number;
    branchName: string;
    avatar?: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface TokenPayload {
    sub: string;
    iat: number;
    exp: number;
    roles: string[];
    idCompany: number;
    idBranch: number;
}
