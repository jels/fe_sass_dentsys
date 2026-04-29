import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TOAST_KEY, TOAST_LIFE } from '../models/app.constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const messageService = inject(MessageService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // 401 lo maneja el authInterceptor, no mostramos toast acá
            if (error.status === 401) {
                return throwError(() => error);
            }

            const message = resolveErrorMessage(error);

            messageService.add({
                key: TOAST_KEY,
                severity: 'error',
                summary: 'Error',
                detail: message,
                life: TOAST_LIFE
            });

            return throwError(() => error);
        })
    );
};

function resolveErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
        return 'Sin conexión con el servidor. Verificá tu red.';
    }
    if (error.status === 403) {
        return 'No tenés permiso para realizar esta acción.';
    }
    if (error.status === 404) {
        return 'El recurso solicitado no fue encontrado.';
    }
    if (error.status === 409) {
        return error.error?.message ?? 'Ya existe un registro con esos datos.';
    }
    if (error.status === 422) {
        return error.error?.message ?? 'Los datos enviados no son válidos.';
    }
    if (error.status >= 500) {
        return 'Error interno del servidor. Intentá más tarde.';
    }
    return error.error?.message ?? 'Ocurrió un error inesperado.';
}
