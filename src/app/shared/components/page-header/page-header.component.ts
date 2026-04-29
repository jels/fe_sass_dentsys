import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

export interface PageHeaderAction {
    label: string;
    icon: string;
    severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
    onClick: () => void;
    visible?: boolean;
}

@Component({
    selector: 'app-page-header',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    templateUrl: './page-header.component.html',
    styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
    @Input() title = '';
    @Input() subtitle = '';
    @Input() icon = '';
    @Input() actions: PageHeaderAction[] = [];

    get visibleActions(): PageHeaderAction[] {
        return this.actions.filter((a) => a.visible !== false);
    }
}
