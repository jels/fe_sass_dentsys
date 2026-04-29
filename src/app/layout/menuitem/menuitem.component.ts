import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { filter, Subscription } from 'rxjs';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { LayoutService } from '../../core/services/conf/layout.service';

@Component({
    selector: '[app-menuitem]',
    standalone: true,
    imports: [CommonModule, RouterModule, RippleModule, TooltipModule],
    templateUrl: './menuitem.component.html',
    styleUrl: './menuitem.component.scss',
    animations: [trigger('children', [state('collapsed', style({ height: '0' })), state('expanded', style({ height: '*' })), transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))])]
})
export class MenuitemComponent implements OnInit {
    @Input() item: any;
    @Input() index!: number;
    @Input() root!: boolean;
    @Input() parentKey!: string;

    active = false;
    key = '';

    layoutService = inject(LayoutService);
    private router = inject(Router);
    private routerSubscription!: Subscription;

    ngOnInit(): void {
        this.key = this.parentKey ? `${this.parentKey}-${this.index}` : `${this.index}`;

        this.routerSubscription = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
            if (this.item.routerLink) {
                this.updateActiveState();
            }
        });

        this.updateActiveState();
    }

    updateActiveState(): void {
        if (this.item.routerLink) {
            this.active = this.router.isActive(this.item.routerLink[0], {
                paths: 'subset',
                queryParams: 'ignored',
                fragment: 'ignored',
                matrixParams: 'ignored'
            });
        }
    }

    itemClick(event: Event): void {
        if (this.item.disabled) {
            event.preventDefault();
            return;
        }

        if (this.item.items) {
            this.active = !this.active;
        }

        if (!this.item.items && this.layoutService.isMobile()) {
            this.layoutService.layoutState.update((prev) => ({
                ...prev,
                staticMenuMobileActive: false
            }));
        }
    }

    ngOnDestroy(): void {
        this.routerSubscription?.unsubscribe();
    }
}
