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
import { BranchResponse, CreateBranchRequest, UpdateBranchRequest } from '../../core/models/organization.models';
import { AuthService } from '../../core/services/auth.service';
import { BranchService } from '../../core/services/branch.service';

@Component({
    selector: 'app-branch',
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
    templateUrl: './branch.component.html',
    styleUrl: './branch.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class BranchComponent implements OnInit, OnDestroy {
    branches = signal<BranchResponse[]>([]);
    loading = signal(false);
    saving = signal(false);
    showForm = signal(false);
    isEditMode = signal(false);
    editingId = signal<number | null>(null);
    search = '';

    branchForm!: FormGroup;
    private destroy$ = new Subject<void>();

    constructor(
        private branchService: BranchService,
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
        this.branchService
            .getAll(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (r) => {
                    this.branches.set(r.success ? (r.data ?? []) : []);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
    }

    // ── Filtro local ─────────────────────────────────────────────────────────

    get filtered(): BranchResponse[] {
        const q = this.search.toLowerCase().trim();
        if (!q) return this.branches();
        return this.branches().filter((b) => b.name.toLowerCase().includes(q) || b.establishmentCode.includes(q) || (b.address ?? '').toLowerCase().includes(q));
    }

    // ── Formulario ───────────────────────────────────────────────────────────

    private buildForm(): void {
        this.branchForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            establishmentCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
            address: [''],
            phone: ['']
        });
    }

    openCreate(): void {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.branchForm.reset();
        this.showForm.set(true);
    }

    openEdit(b: BranchResponse): void {
        this.isEditMode.set(true);
        this.editingId.set(b.idBranch);
        this.branchForm.patchValue({
            name: b.name,
            establishmentCode: b.establishmentCode,
            address: b.address ?? '',
            phone: b.phone ?? ''
        });
        this.showForm.set(true);
    }

    submit(): void {
        if (this.branchForm.invalid) {
            this.branchForm.markAllAsTouched();
            return;
        }
        this.saving.set(true);
        const v = this.branchForm.value;

        if (this.isEditMode()) {
            const req: UpdateBranchRequest = { ...v };
            this.branchService
                .update(this.editingId()!, req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (r) => {
                        this.saving.set(false);
                        if (r.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Sucursal actualizada' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        } else {
            const req: CreateBranchRequest = { ...v, idCompany: this.idCompany };
            this.branchService
                .create(req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (r) => {
                        this.saving.set(false);
                        if (r.success) {
                            this.showForm.set(false);
                            this.load();
                            this.messageService.add({ severity: 'success', summary: 'Sucursal creada' });
                        }
                    },
                    error: () => this.saving.set(false)
                });
        }
    }

    confirmToggle(b: BranchResponse): void {
        const action = b.active ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
            message: `¿Desea ${action} la sucursal <strong>${b.name}</strong>?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.branchService
                    .toggleStatus(b.idBranch)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.load();
                            this.messageService.add({ severity: 'info', summary: `Sucursal ${action === 'activar' ? 'activada' : 'desactivada'}` });
                        }
                    });
            }
        });
    }

    isInvalid(f: string): boolean {
        const c = this.branchForm.get(f);
        return !!(c?.invalid && c.touched);
    }
}
