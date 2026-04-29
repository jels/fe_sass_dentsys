import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DentistResponse, CreateDentistRequest, UpdateDentistRequest } from '../../core/models/catalogs.models';
import { DentistService } from '../../core/services/dentist.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dentist',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, SelectModule, SkeletonModule, TableModule, TagModule, ToastModule, TooltipModule, ConfirmDialogModule, IconFieldModule, InputIconModule],
    templateUrl: './dentist.component.html',
    styleUrl: './dentist.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class DentistComponent implements OnInit, OnDestroy {
    dentists = signal<DentistResponse[]>([]);
    loading = signal(false);
    saving = signal(false);
    showForm = signal(false);
    isEditMode = signal(false);
    editingId = signal<number | null>(null);
    search = '';

    dentistForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private dentistService: DentistService,
        private authService: AuthService,
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
        this.dentistService
            .getAll(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.dentists.set(res.success ? (res.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    // ── Filtro local ─────────────────────────────────────────────────────────

    get filtered(): DentistResponse[] {
        const q = this.search.toLowerCase().trim();
        if (!q) return this.dentists();
        return this.dentists().filter((d) => d.fullName.toLowerCase().includes(q) || d.documentNumber.includes(q) || (d.specialty ?? '').toLowerCase().includes(q));
    }

    // ── Formulario ───────────────────────────────────────────────────────────

    private buildForm(): void {
        this.dentistForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            documentNumber: ['', Validators.required],
            phone: [''],
            email: ['', Validators.email],
            specialty: [''],
            registrationNumber: [''],
            idBranch: [this.authService.idBranch(), Validators.required]
        });
    }

    openCreate(): void {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.dentistForm.reset({ idBranch: this.authService.idBranch() });
        this.showForm.set(true);
    }

    openEdit(d: DentistResponse): void {
        this.isEditMode.set(true);
        this.editingId.set(d.idDentist);
        this.dentistForm.patchValue({
            firstName: d.firstName,
            lastName: d.lastName,
            documentNumber: d.documentNumber,
            phone: d.phone ?? '',
            email: d.email ?? '',
            specialty: d.specialty ?? '',
            registrationNumber: d.registrationNumber ?? '',
            idBranch: d.idBranch
        });
        this.showForm.set(true);
    }

    submit(): void {
        if (this.dentistForm.invalid) {
            this.dentistForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.dentistForm.value;

        if (this.isEditMode()) {
            const req: UpdateDentistRequest = { ...v };
            this.dentistService
                .update(this.editingId()!, req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Dentista actualizado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        } else {
            const req: CreateDentistRequest = { ...v, idCompany: this.idCompany };
            this.dentistService
                .create(req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.saving.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Dentista registrado' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        }
    }

    confirmToggle(d: DentistResponse): void {
        const action = d.isActive ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
            message: `¿Desea ${action} al dentista <strong>${d.fullName}</strong>?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.dentistService
                    .toggleStatus(d.idDentist)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.load();
                            this.messageService.add({ severity: 'info', summary: `Dentista ${action === 'activar' ? 'activado' : 'desactivado'}` });
                        }
                    });
            }
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    isInvalid(field: string): boolean {
        const c = this.dentistForm.get(field);
        return !!(c?.invalid && c.touched);
    }
}
