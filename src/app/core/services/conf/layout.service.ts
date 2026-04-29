import { Injectable, signal, computed, effect } from '@angular/core';
import { Subject } from 'rxjs';

export interface LayoutConfig {
    preset: string;
    primary: string;
    surface: string | undefined | null;
    darkTheme: boolean;
    menuMode: string;
}

export interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class LayoutService {
    layoutConfig = signal<LayoutConfig>({
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: false,
        menuMode: 'static'
    });

    layoutState = signal<LayoutState>({
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    });

    private configUpdate = new Subject<LayoutConfig>();
    private overlayOpen = new Subject<void>();

    configUpdate$ = this.configUpdate.asObservable();
    overlayOpen$ = this.overlayOpen.asObservable();

    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);

    isDarkTheme = computed(() => this.layoutConfig().darkTheme);

    getPrimary = computed(() => this.layoutConfig().primary);

    getSurface = computed(() => this.layoutConfig().surface);

    constructor() {
        effect(() => {
            const config = this.layoutConfig();
            this.applyTheme(config);
        });
    }

    onMenuToggle(): void {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({
                ...prev,
                overlayMenuActive: !prev.overlayMenuActive
            }));
            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next();
            }
        }

        if (this.isStatic()) {
            this.layoutState.update((prev) => ({
                ...prev,
                staticMenuDesktopInactive: !prev.staticMenuDesktopInactive
            }));
        }

        if (this.isMobile()) {
            this.layoutState.update((prev) => ({
                ...prev,
                staticMenuMobileActive: !prev.staticMenuMobileActive
            }));
            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next();
            }
        }
    }

    isOverlay(): boolean {
        return this.layoutConfig().menuMode === 'overlay';
    }

    isStatic(): boolean {
        return this.layoutConfig().menuMode === 'static';
    }

    isMobile(): boolean {
        return !this.isDesktop();
    }

    isDesktop(): boolean {
        return window.innerWidth > 991;
    }

    private applyTheme(config: LayoutConfig): void {
        const el = document.querySelector('html');
        if (!el) return;
        if (config.darkTheme) {
            el.classList.add('app-dark');
        } else {
            el.classList.remove('app-dark');
        }
    }
}
