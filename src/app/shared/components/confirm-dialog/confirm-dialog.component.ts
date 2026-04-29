import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule],
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
    @Input() visible = false;
    @Input() title = 'Confirmar acción';
    @Input() message = '¿Estás seguro de realizar esta acción?';
    @Input() confirmLabel = 'Confirmar';
    @Input() cancelLabel = 'Cancelar';
    @Input() severity: 'primary' | 'danger' | 'warn' = 'danger';
    @Input() loading = false;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() confirmed = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    onConfirm(): void {
        this.confirmed.emit();
    }

    onCancel(): void {
        this.visible = false;
        this.visibleChange.emit(false);
        this.cancelled.emit();
    }
}
