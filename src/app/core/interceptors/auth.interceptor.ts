import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { SessionService } from '../services/session.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const sessionService = inject(SessionService);

    const publicUrls = ['/auth/login', '/auth/refresh-token', '/auth/forgot'];
    const isPublicUrl = publicUrls.some((url) => req.url.includes(url));

    if (isPublicUrl) {
        return next(req);
    }

    const token = sessionService.getToken();

    if (!token) {
        return next(req);
    }

    const clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !req.url.includes('/auth/refresh-token')) {
                return authService.refreshTokens().pipe(
                    switchMap(() => {
                        const newToken = sessionService.getToken();
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` }
                        });
                        return next(retryReq);
                    }),
                    catchError((refreshError) => {
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
