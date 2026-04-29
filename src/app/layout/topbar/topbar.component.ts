import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { LayoutService } from '../../core/services/conf/layout.service';
import { ConfiguratorComponent } from '../configurator/configurator.component';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, RouterModule, StyleClassModule, TooltipModule, ButtonModule, DialogModule, AvatarModule, ConfiguratorComponent, InitialsPipe],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
    items!: MenuItem[];
    displayConfirmation = false;

    layoutService = inject(LayoutService);
    private authService = inject(AuthService);
    private router = inject(Router);

    readonly user = this.authService.user;
    readonly fullName = this.authService.fullName;

    toggleDarkMode(): void {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    openConfirmation(): void {
        this.displayConfirmation = true;
    }

    closeConfirmation(confirm: boolean): void {
        if (confirm) {
            this.authService.logout();
        }
        this.displayConfirmation = false;
    }

    goTo(route: string): void {
        this.router.navigate([route]);
    }
}
