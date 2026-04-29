import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { APP_ROUTES } from '../models/app.constants';

export const authGuard: CanActivateFn = () => {
    const sessionService = inject(SessionService);
    const router = inject(Router);

    if (sessionService.isLoggedIn()) {
        return true;
    }

    router.navigate([APP_ROUTES.AUTH.LOGIN]);
    return false;
};
