import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
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
import { CompanyResponse, CreateCompanyRequest, UpdateCompanyRequest } from '../../core/models/organization.models';
import { CompanyService } from '../../core/services/company.service';

@Component({
    selector: 'app-company',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        SkeletonModule,
        TableModule,
        TagModule,
        TextareaModule,
        ToastModule,
        TooltipModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule,
        FechaLocalPipe
    ],
    templateUrl: './company.component.html',
    styleUrl: './company.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class CompanyComponent implements OnInit, OnDestroy {
    companies = signal<CompanyResponse[]>([]);
    loading = signal(false);
    saving = signal(false);
    showForm = signal(false);
    isEditMode = signal(false);
    editingId = signal<number | null>(null);
    search = '';

    companyForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private companyService: CompanyService,
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

    // ── Carga ────────────────────────────────────────────────────────────────

    load(): void {
        this.loading.set(true);
        this.companyService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.companies.set(r.success ? (r.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    // ── Filtro local ─────────────────────────────────────────────────────────

    get filtered(): CompanyResponse[] {
        const q = this.search.toLowerCase().trim();
        if (!q) return this.companies();
        return this.companies().filter((c) => c.name.toLowerCase().includes(q) || c.taxId.includes(q) || (c.email ?? '').toLowerCase().includes(q));
    }

    // ── Formulario ───────────────────────────────────────────────────────────

    private buildForm(): void {
        this.companyForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            taxId: ['', Validators.required],
            address: [''],
            phone: [''],
            email: ['', Validators.email]
        });
    }

    openCreate(): void {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.companyForm.reset();
        this.showForm.set(true);
    }

    openEdit(c: CompanyResponse): void {
        this.isEditMode.set(true);
        this.editingId.set(c.idCompany);
        this.companyForm.patchValue({
            name: c.name,
            taxId: c.taxId,
            address: c.address ?? '',
            phone: c.phone ?? '',
            email: c.email ?? ''
        });
        this.showForm.set(true);
    }

    submit(): void {
        if (this.companyForm.invalid) {
            this.companyForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.companyForm.value;

        const call$ = this.isEditMode() ? this.companyService.update(this.editingId()!, v as UpdateCompanyRequest) : this.companyService.create(v as CreateCompanyRequest);

        call$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (r) => {
                this.saving.set(false);
                if (r.success) {
                    this.showForm.set(false);
                    this.load();
                    this.messageService.add({ severity: 'success', summary: this.isEditMode() ? 'Empresa actualizada' : 'Empresa creada' });
                }
            },
            error: () => this.saving.set(false)
        });
    }

    confirmToggle(c: CompanyResponse): void {
        const action = c.active ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
            message: `¿Desea ${action} la empresa <strong>${c.name}</strong>?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.companyService
                    .toggleStatus(c.idCompany)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.load();
                            this.messageService.add({ severity: 'info', summary: `Empresa ${action === 'activar' ? 'activada' : 'desactivada'}` });
                        }
                    });
            }
        });
    }

    isInvalid(f: string): boolean {
        const c = this.companyForm.get(f);
        return !!(c?.invalid && c.touched);
    }
}
