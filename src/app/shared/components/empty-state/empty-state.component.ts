import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-empty-state',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    templateUrl: './empty-state.component.html',
    styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
    @Input() icon = 'pi pi-inbox';
    @Input() title = 'Sin resultados';
    @Input() message = 'No hay datos para mostrar.';
    @Input() actionLabel = '';
    @Input() actionIcon = 'pi pi-plus';
    @Output() actionClick = new EventEmitter<void>();
}
