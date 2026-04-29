import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { APP_ROUTES } from '../models/app.constants';

export const noAuthGuard: CanActivateFn = () => {
    const sessionService = inject(SessionService);
    const router = inject(Router);

    if (sessionService.isLoggedIn()) {
        router.navigate([APP_ROUTES.DASHBOARD]);
        return false;
    }

    return true;
};
