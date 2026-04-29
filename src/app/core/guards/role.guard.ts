import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SessionService } from '../services/session.service';
import { APP_ROUTES } from '../models/app.constants';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const sessionService = inject(SessionService);
    const router = inject(Router);

    const requiredRoles: string[] = route.data['roles'] ?? [];

    if (requiredRoles.length === 0) {
        return true;
    }

    const hasRole = requiredRoles.some((role) => sessionService.hasRole(role));

    if (hasRole) {
        return true;
    }

    router.navigate([APP_ROUTES.ACCESS_DENIED]);
    return false;
};
