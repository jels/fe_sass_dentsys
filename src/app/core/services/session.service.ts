import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class SessionService {
    getToken(): string | null {
        return localStorage.getItem(environment.tokenKey);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(environment.refreshTokenKey);
    }

    saveTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(environment.tokenKey, accessToken);
        localStorage.setItem(environment.refreshTokenKey, refreshToken);
    }

    saveUser(user: AuthUser): void {
        localStorage.setItem('dentsys_user', JSON.stringify(user));
    }

    getUser(): AuthUser | null {
        const raw = localStorage.getItem('dentsys_user');
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    }

    getIdCompany(): number | null {
        return this.getUser()?.idCompany ?? null;
    }

    getIdBranch(): number | null {
        return this.getUser()?.idBranch ?? null;
    }

    getRoles(): string[] {
        return this.getUser()?.roles ?? [];
    }

    hasRole(role: string): boolean {
        return this.getRoles().includes(role);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    clearSession(): void {
        localStorage.removeItem(environment.tokenKey);
        localStorage.removeItem(environment.refreshTokenKey);
        localStorage.removeItem('dentsys_user');
    }
}
