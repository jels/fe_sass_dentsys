// ─── Rutas de la aplicación ───────────────────────────────────────────────────

export const APP_ROUTES = {
    AUTH: {
        ROOT: '/auth',
        LOGIN: '/auth/login',
        FORGOT: '/auth/forgot'
    },
    DASHBOARD: '/modules/dashboard',
    COMPANY: '/modules/company',
    BRANCH: '/modules/branch',
    DENTIST: '/modules/dentist',
    STAFF: '/modules/staff',
    TREATMENT_CATALOG: '/modules/treatment-catalog',
    STAMPS: '/modules/stamps',
    PATIENTS: '/modules/patients',
    SCHEDULING: '/modules/scheduling',
    TREATMENT_PLAN: '/modules/treatment-plan',
    PERFORMED_TREATMENTS: '/modules/performed-treatments',
    INVOICING: '/modules/invoicing',
    RECEIPTS: '/modules/receipts',
    CASH_BOOK: '/modules/cash-book',
    REPORTS: '/modules/reports',
    ACCESS_DENIED: '/access-denied',
    NOT_FOUND: '/not-found'
} as const;

// ─── Paginación por defecto ───────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// ─── Configuración de toasts ──────────────────────────────────────────────────

export const TOAST_LIFE = 4000;
export const TOAST_KEY = 'global-toast';

// ─── Formato de fechas ────────────────────────────────────────────────────────

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// ─── Separador de miles (Guaraníes) ──────────────────────────────────────────

export const CURRENCY_LOCALE = 'es-PY';
export const CURRENCY_CODE = 'PYG';
