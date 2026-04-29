import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { TOAST_KEY } from './core/models/app.constants';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, ToastModule],
    template: `
        <p-toast [key]="toastKey" position="top-right" />
        <router-outlet />
    `
})
export class AppComponent {
    readonly toastKey = TOAST_KEY;
}
