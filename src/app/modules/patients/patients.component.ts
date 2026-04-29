import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FechaLocalPipe } from '../../shared/pipes/fecha-local.pipe';
import { PatientResponse, CreatePatientRequest, UpdatePatientRequest, GENDER_OPTIONS } from '../../core/models/clinical.models';
import { PatientService } from '../../core/services/patient.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-patients',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DatePickerModule,
        DialogModule,
        InputTextModule,
        SelectModule,
        SkeletonModule,
        TableModule,
        TagModule,
        TextareaModule,
        ToastModule,
        TooltipModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule
    ],
    templateUrl: './patients.component.html',
    styleUrl: './patients.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class PatientsComponent implements OnInit, OnDestroy {
    patients = signal<PatientResponse[]>([]);
    loading = signal(false);
    saving = signal(false);
    showForm = signal(false);
    isEditMode = signal(false);
    editingId = signal<number | null>(null);

    today = new Date();

    search = '';
    filterGender = '';
    filterActive = true;

    readonly genderOptions = [{ label: 'Todos', value: '' }, ...GENDER_OPTIONS];
    readonly activeOptions = [
        { label: 'Activos', value: true },
        { label: 'Inactivos', value: false }
    ];

    patientForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private patientService: PatientService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        this.load();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private get idCompany(): number {
        return this.authService.idCompany()!;
    }

    // ── Carga ────────────────────────────────────────────────────────────────

    load(): void {
        this.loading.set(true);
        this.patientService
            .getAll(this.idCompany, {
                gender: this.filterGender || undefined,
                active: this.filterActive
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.patients.set(res.success ? (res.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    // ── Filtro local por búsqueda de texto ───────────────────────────────────

    get filtered(): PatientResponse[] {
        const q = this.search.toLowerCase().trim();
        if (!q) return this.patients();
        return this.patients().filter((p) => p.fullName.toLowerCase().includes(q) || (p.idNumber ?? '').includes(q) || (p.phone ?? '').includes(q) || (p.email ?? '').toLowerCase().includes(q));
    }

    // ── Navegación a ficha ───────────────────────────────────────────────────

    goToDetail(p: PatientResponse): void {
        this.router.navigate(['/modules/patients', p.idPatient]);
    }

    // ── Formulario ───────────────────────────────────────────────────────────

    private buildForm(): void {
        this.patientForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            idNumber: [''],
            birthDate: [null],
            gender: [''],
            phone: [''],
            email: ['', Validators.email],
            address: [''],
            allergies: [''],
            clinicalNotes: ['']
        });
    }

    openCreate(): void {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.patientForm.reset();
        this.showForm.set(true);
    }

    openEdit(p: PatientResponse): void {
        this.isEditMode.set(true);
        this.editingId.set(p.idPatient);
        this.patientForm.patchValue({
            firstName: p.firstName,
            lastName: p.lastName,
            idNumber: p.idNumber ?? '',
            birthDate: p.birthDate ? new Date(p.birthDate) : null,
            gender: p.gender ?? '',
            phone: p.phone ?? '',
            email: p.email ?? '',
            address: p.address ?? '',
            allergies: p.allergies ?? '',
            clinicalNotes: p.clinicalNotes ?? ''
        });
        this.showForm.set(true);
    }

    submit(): void {
        if (this.patientForm.invalid) {
            this.patientForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.patientForm.value;
        const toIso = (d: Date | null) => (d ? d.toISOString().split('T')[0] : undefined);

        if (this.isEditMode()) {
            const req: UpdatePatientRequest = {
                ...v,
                birthDate: toIso(v.birthDate),
                gender: v.gender || undefined
            };
            this.patientService
                .update(this.editingId()!, req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Paciente actualizado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        } else {
            const req: CreatePatientRequest = {
                ...v,
                birthDate: toIso(v.birthDate),
                gender: v.gender || undefined,
                idCompany: this.idCompany
            };
            this.patientService
                .create(req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Paciente registrado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        }
    }

    confirmToggle(p: PatientResponse): void {
        const action = p.active ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
            message: `¿Desea ${action} al paciente <strong>${p.fullName}</strong>?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.patientService
                    .toggleStatus(p.idPatient)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.load();
                            this.messageService.add({ severity: 'info', summary: `Paciente ${action === 'activar' ? 'activado' : 'desactivado'}` });
                        }
                    });
            }
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(field: string): boolean {
        const c = this.patientForm.get(field);
        return !!(c?.invalid && c.touched);
    }

    getGenderLabel(g: string | undefined): string {
        return ({ M: 'Masculino', F: 'Femenino' } as Record<string, string>)[g ?? ''] ?? '—';
    }

    getGenderIcon(g: string | undefined): string {
        return g === 'M' ? 'pi pi-mars' : g === 'F' ? 'pi pi-venus' : 'pi pi-minus';
    }

    calcAge(birthDate: string | undefined): string {
        if (!birthDate) return '—';
        const diff = Date.now() - new Date(birthDate).getTime();
        return `${Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))} años`;
    }
}
