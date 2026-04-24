import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, roleGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout/layout.component';
import { AccessdeniedComponent } from './shared/components/accessdenied/accessdenied.component';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { Dashboard } from './modules/dashboard/dashboard';
// import { DashboardComponent } from './modules/distrident/views/control-panel/dashboard/dashboard.component';
export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./auth/auth.routes')
    },
    {
        path: 'sys',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                data: { breadcrumb: 'Inicio' },
                component: Dashboard
            }
            // {
            //     path: 'dashboard',
            //     canActivate: [roleGuard],
            //     data: { roles: ['customer', 'admin', 'manager', 'delivery_person', 'warehouse_operator'] },
            //     loadChildren: () => import('./modules/distrident/views/client-panel/client-panel-views.routes')
            // }
        ]
    },
    {
        path: 'auth',
        canActivate: [noAuthGuard],
        loadChildren: () => import('./auth/auth.routes')
    },
    { path: 'notfound', component: NotfoundComponent },
    { path: 'denied', component: AccessdeniedComponent },

    { path: '**', redirectTo: '/notfound' }
];
