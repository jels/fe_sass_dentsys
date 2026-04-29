import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../core/services/conf/layout.service';

@Component({
    selector: 'app-floatingconfigurator',
    standalone: true,
    imports: [CommonModule, ButtonModule, StyleClassModule],
    templateUrl: './floatingconfigurator.component.html',
    styleUrl: './floatingconfigurator.component.scss'
})
export class FloatingconfiguratorComponent {
    layoutService = inject(LayoutService);

    toggleDarkMode(): void {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }
}
