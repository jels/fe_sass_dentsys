import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FloatingconfiguratorComponent } from '../../layout/floatingconfigurator/floatingconfigurator.component';
import { APP_ROUTES, TOAST_LIFE } from '../../core/models/app.constants';

@Component({
    selector: 'app-forgot',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, RouterModule, ButtonModule, FloatLabelModule, InputTextModule, FloatingconfiguratorComponent, ToastModule],
    templateUrl: './forgot.component.html',
    styleUrl: './forgot.component.scss',
    providers: [MessageService]
})
export class ForgotComponent {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private messageService = inject(MessageService);

    forgotForm: FormGroup;
    loading = signal(false);
    sent = signal(false);

    constructor() {
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get emailInvalid(): boolean {
        const ctrl = this.forgotForm.get('email');
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    onSubmit(): void {
        if (this.forgotForm.invalid) {
            this.forgotForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);

        // TODO: conectar con el endpoint real de recuperación
        setTimeout(() => {
            this.loading.set(false);
            this.sent.set(true);
            this.messageService.add({
                severity: 'success',
                summary: 'Correo enviado',
                detail: 'Si el email existe, recibirás las instrucciones en breve.',
                life: TOAST_LIFE
            });
        }, 1500);
    }

    goToLogin(): void {
        this.router.navigate([APP_ROUTES.AUTH.LOGIN]);
    }
}
