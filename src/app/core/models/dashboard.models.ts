// ─── Dashboard principal ──────────────────────────────────────────────────────

export interface DashboardSummaryResponse {
    generatedAt: string; // ISO datetime
    idCompany: number;
    idBranch: number;
    branchName: string;
    date: string; // yyyy-MM-dd del día consultado

    // Pacientes
    patients: DashboardPatientsStats;

    // Citas del día
    appointments: DashboardAppointmentsStats;

    // Facturación del día
    billing: DashboardBillingStats;

    // Caja del día
    cash: DashboardCashStats;
}

// ── Pacientes ─────────────────────────────────────────────────────────────────

export interface DashboardPatientsStats {
    totalActive: number; // total activos en la empresa
    newThisMonth: number; // altas este mes
    newToday: number; // altas hoy
    withAppointmentToday: number; // pacientes con cita hoy
}

// ── Citas ─────────────────────────────────────────────────────────────────────

export interface DashboardAppointmentsStats {
    total: number;
    pending: number;
    confirmed: number;
    attended: number;
    cancelled: number;
    noShow: number;
    attendanceRate: number; // % (attended / (total - cancelled))
    byDoctor: DoctorAppointmentStat[];
}

export interface DoctorAppointmentStat {
    idDoctor: number;
    doctorName: string;
    total: number;
    attended: number;
}

// ── Facturación ───────────────────────────────────────────────────────────────

export interface DashboardBillingStats {
    invoicesToday: number; // cantidad
    totalToday: number; // monto total emitido
    totalPaidToday: number; // cobrado
    totalPendingToday: number; // pendiente
    cashInvoices: number; // cantidad contado
    creditInvoices: number; // cantidad crédito
    monthTotal: number; // acumulado del mes
    monthPaid: number;
    monthPending: number;
}

// ── Caja ─────────────────────────────────────────────────────────────────────

export interface DashboardCashStats {
    todayIncome: number;
    todayExpense: number;
    todayBalance: number;
    todayMovements: number;
    monthIncome: number;
    monthExpense: number;
    monthBalance: number;
}

// ─── Chart data ────────────────────────────────────────────────────────────────

export interface WeeklyAppointmentsChart {
    labels: string[]; // ['Lun', 'Mar', ...]
    attended: number[];
    cancelled: number[];
    noShow: number[];
}

export interface MonthlyBillingChart {
    labels: string[]; // ['01/Jun', '02/Jun', ...]
    invoiced: number[];
    collected: number[];
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export type ReportType = 'APPOINTMENTS' | 'BILLING' | 'CASH_BOOK' | 'PATIENTS' | 'PERFORMED_TREATMENTS';

export type ReportFormat = 'JSON' | 'CSV' | 'PDF';
export type ReportGroupBy = 'DAY' | 'WEEK' | 'MONTH' | 'DOCTOR' | 'PATIENT' | 'STATUS' | 'NONE';

export interface ReportRequest {
    idCompany: number;
    idBranch?: number;
    reportType: ReportType;
    dateFrom: string;
    dateTo: string;
    groupBy: ReportGroupBy;
    idDoctor?: number;
    idPatient?: number;
    status?: string;
    format: ReportFormat;
}

export interface ReportResponse {
    reportType: ReportType;
    dateFrom: string;
    dateTo: string;
    groupBy: ReportGroupBy;
    generatedAt: string;
    totalRecords: number;
    summary: ReportSummary;
    rows: ReportRow[];
}

export interface ReportSummary {
    totalAmount?: number;
    totalIncome?: number;
    totalExpense?: number;
    totalBalance?: number;
    totalAppointments?: number;
    attendanceRate?: number;
    totalPatients?: number;
    totalInvoices?: number;
    totalTreatments?: number;
}

export interface ReportRow {
    label: string; // agrupador (fecha, doctor, estado, etc.)
    count: number;
    amount?: number;
    subRows?: ReportRow[];
    metadata?: Record<string, string | number>;
}

// ─── Constantes UI ───────────────────────────────────────────────────────────

export const REPORT_TYPE_OPTIONS: { label: string; value: ReportType; icon: string; description: string }[] = [
    {
        label: 'Citas',
        value: 'APPOINTMENTS',
        icon: 'pi pi-calendar',
        description: 'Cantidad de citas, tasa de asistencia y estados'
    },
    {
        label: 'Facturación',
        value: 'BILLING',
        icon: 'pi pi-file-check',
        description: 'Facturas emitidas, cobradas y pendientes'
    },
    {
        label: 'Libro Caja',
        value: 'CASH_BOOK',
        icon: 'pi pi-book',
        description: 'Ingresos, egresos y balance por período'
    },
    {
        label: 'Pacientes',
        value: 'PATIENTS',
        icon: 'pi pi-users',
        description: 'Altas, actividad y distribución de pacientes'
    },
    {
        label: 'Tratamientos',
        value: 'PERFORMED_TREATMENTS',
        icon: 'pi pi-heart',
        description: 'Tratamientos realizados, costos y facturación'
    }
];

export const REPORT_GROUPBY_OPTIONS: Record<ReportType, { label: string; value: ReportGroupBy }[]> = {
    APPOINTMENTS: [
        { label: 'Por día', value: 'DAY' },
        { label: 'Por semana', value: 'WEEK' },
        { label: 'Por mes', value: 'MONTH' },
        { label: 'Por dentista', value: 'DOCTOR' },
        { label: 'Por estado', value: 'STATUS' }
    ],
    BILLING: [
        { label: 'Por día', value: 'DAY' },
        { label: 'Por semana', value: 'WEEK' },
        { label: 'Por mes', value: 'MONTH' },
        { label: 'Por paciente', value: 'PATIENT' },
        { label: 'Sin agrupar', value: 'NONE' }
    ],
    CASH_BOOK: [
        { label: 'Por día', value: 'DAY' },
        { label: 'Por semana', value: 'WEEK' },
        { label: 'Por mes', value: 'MONTH' }
    ],
    PATIENTS: [
        { label: 'Por mes de alta', value: 'MONTH' },
        { label: 'Sin agrupar', value: 'NONE' }
    ],
    PERFORMED_TREATMENTS: [
        { label: 'Por día', value: 'DAY' },
        { label: 'Por mes', value: 'MONTH' },
        { label: 'Por dentista', value: 'DOCTOR' },
        { label: 'Por paciente', value: 'PATIENT' }
    ]
};

export const REPORT_FORMAT_OPTIONS: { label: string; value: ReportFormat; icon: string }[] = [
    { label: 'Tabla interactiva', value: 'JSON', icon: 'pi pi-table' },
    { label: 'Exportar CSV', value: 'CSV', icon: 'pi pi-file-excel' },
    { label: 'Exportar PDF', value: 'PDF', icon: 'pi pi-file-pdf' }
];
