import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
    // Redireccionamiento raíz
    {
        path: '',
        redirectTo: 'modules/dashboard',
        pathMatch: 'full'
    },

    // Rutas de autenticación (sin layout)
    {
        path: 'auth',
        // canActivate: [noAuthGuard],
        loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes)
    },

    // Rutas protegidas (con layout principal)
    {
        path: 'modules',
        // canActivate: [authGuard],
        loadComponent: () => import('./layout/layout/layout.component').then((m) => m.LayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./modules/dashboard/dashboard.component').then((m) => m.DashboardComponent)
            },
            // ── Organización ──────────────────────────────────────────────────
            {
                path: 'company',
                loadChildren: () => import('./modules/company/company.routes').then((m) => m.companyRoutes)
                // data: { roles: ['SUPER_ADMIN', 'ADMIN'] }
            },
            {
                path: 'branch',
                loadChildren: () => import('./modules/branch/branch.routes').then((m) => m.branchRoutes)
                // data: { roles: ['SUPER_ADMIN', 'ADMIN'] }
            },
            // ── Catálogos ─────────────────────────────────────────────────────
            {
                path: 'dentist',
                loadChildren: () => import('./modules/dentist/dentist.routes').then((m) => m.dentistRoutes)
                // data: { roles: ['SUPER_ADMIN', 'ADMIN'] }
            },
            {
                path: 'treatment-catalog',
                loadChildren: () => import('./modules/treatment-catalog/treatment-catalog.routes').then((m) => m.treatmentCatalogRoutes)
                // data: { roles: ['SUPER_ADMIN', 'ADMIN'] }
            },
            {
                path: 'stamps',
                loadChildren: () => import('./modules/stamps/stamps.routes').then((m) => m.stampsRoutes)
                // data: { roles: ['SUPER_ADMIN', 'ADMIN'] }
            },
            // ── Pacientes y agenda ────────────────────────────────────────────
            {
                path: 'patients',
                loadChildren: () => import('./modules/patients/patients.routes').then((m) => m.patientsRoutes)
            },
            {
                path: 'scheduling',
                loadChildren: () => import('./modules/scheduling/scheduling.routes').then((m) => m.schedulingRoutes)
            },
            // ── Clínica ───────────────────────────────────────────────────────
            {
                path: 'treatment-plan',
                loadChildren: () => import('./modules/treatment-plan/treatment-plan.routes').then((m) => m.treatmentPlanRoutes)
            },
            {
                path: 'performed-treatments',
                loadChildren: () => import('./modules/performed-treatments/performed-treatments.routes').then((m) => m.performedTreatmentsRoutes)
            },
            // ── Facturación ───────────────────────────────────────────────────
            {
                path: 'invoicing',
                loadChildren: () => import('./modules/invoicing/invoicing.routes').then((m) => m.invoicingRoutes)
                // data: { roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'] }
            },
            {
                path: 'receipts',
                loadChildren: () => import('./modules/receipts/receipts.routes').then((m) => m.receiptsRoutes)
                // data: { roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'] }
            },
            {
                path: 'cash-book',
                loadChildren: () => import('./modules/cash-book/cash-book.routes').then((m) => m.cashBookRoutes)
                // data: { roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] }
            },
            // ── Reportes ──────────────────────────────────────────────────────
            {
                path: 'reports',
                loadChildren: () => import('./modules/reports/reports.routes').then((m) => m.reportsRoutes)
                // data: { roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] }
            },
            // fallback interno
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // Páginas de error (sin guard)
    {
        path: 'access-denied',
        loadComponent: () => import('./shared/components/accessdenied/accessdenied.component').then((m) => m.AccessdeniedComponent)
    },
    {
        path: 'not-found',
        loadComponent: () => import('./shared/components/notfound/notfound.component').then((m) => m.NotfoundComponent)
    },

    // Catch-all
    { path: '**', redirectTo: 'not-found' }
];
