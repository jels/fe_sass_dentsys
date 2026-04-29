import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule, ProgressSpinnerModule],
    templateUrl: './loading-spinner.component.html',
    styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
    @Input() message = 'Cargando...';
    @Input() overlay = false;
}
