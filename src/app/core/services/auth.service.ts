import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { SessionService } from './session.service';
import { AuthUser, LoginRequest } from '../models/auth.models';
import { AuthApiService } from './auth-api.service';
import { APP_ROUTES } from '../models/app.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private sessionUserService = inject(SessionService);

    private _user = signal<AuthUser | null>(this.sessionUserService.getUser());

    readonly user = this._user.asReadonly();
    readonly isLoggedIn = computed(() => !!this._user());
    readonly fullName = computed(() => this._user()?.fullName ?? '');
    readonly roles = computed(() => this._user()?.roles ?? []);
    readonly idCompany = computed(() => this._user()?.idCompany ?? null);
    readonly idBranch = computed(() => this._user()?.idBranch ?? null);

    constructor(
        private authApiService: AuthApiService,
        private sessionService: SessionService,
        private router: Router
    ) {}

    login(request: LoginRequest): Observable<void> {
        return new Observable((observer) => {
            this.authApiService.login(request).subscribe({
                next: (response) => {
                    this.sessionService.saveTokens(response.accessToken, response.refreshToken);
                    this.sessionService.saveUser(response.user);
                    this._user.set(response.user);
                    this.router.navigate([APP_ROUTES.DASHBOARD]);
                    observer.next();
                    observer.complete();
                },
                error: (err) => observer.error(err)
            });
        });
    }

    // Llamado por el authInterceptor cuando recibe un 401
    refreshTokens(): Observable<void> {
        const refreshToken = this.sessionService.getRefreshToken();
        return new Observable((observer) => {
            if (!refreshToken) {
                this.clearAndRedirect();
                observer.error(new Error('No refresh token'));
                return;
            }
            this.authApiService.refreshToken(refreshToken).subscribe({
                next: (response) => {
                    this.sessionService.saveTokens(response.accessToken, response.refreshToken);
                    this.sessionService.saveUser(response.user);
                    this._user.set(response.user);
                    observer.next();
                    observer.complete();
                },
                error: (err) => {
                    this.clearAndRedirect();
                    observer.error(err);
                }
            });
        });
    }

    logout(): void {
        this.authApiService.logout().subscribe({
            complete: () => this.clearAndRedirect(),
            error: () => this.clearAndRedirect()
        });
    }

    hasRole(role: string): boolean {
        return this.roles().includes(role);
    }

    hasAnyRole(roles: string[]): boolean {
        return roles.some((r) => this.roles().includes(r));
    }

    private clearAndRedirect(): void {
        this.sessionService.clearSession();
        this._user.set(null);
        this.router.navigate([APP_ROUTES.AUTH.LOGIN]);
    }
}
