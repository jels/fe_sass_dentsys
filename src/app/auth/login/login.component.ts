import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FloatingconfiguratorComponent } from '../../layout/floatingconfigurator/floatingconfigurator.component';
import { AuthService } from '../../core/services/auth.service';
import { APP_ROUTES, TOAST_LIFE } from '../../core/models/app.constants';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, RouterModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FloatLabelModule, FloatingconfiguratorComponent, ToastModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    providers: [MessageService]
})
export class LoginComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    loginForm: FormGroup;
    loading = signal(false);

    constructor() {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    ngOnInit(): void {
        if (this.authService.isLoggedIn()) {
            this.router.navigate([APP_ROUTES.DASHBOARD]);
        }
    }

    get usernameInvalid(): boolean {
        const ctrl = this.loginForm.get('username');
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    get passwordInvalid(): boolean {
        const ctrl = this.loginForm.get('password');
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);

        const { username, password } = this.loginForm.value;

        this.authService.login({ username, password }).subscribe({
            next: () => {
                this.loading.set(false);
            },
            error: (error) => {
                this.loading.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de acceso',
                    detail: this.resolveErrorMessage(error),
                    life: TOAST_LIFE
                });
            }
        });
    }

    goToForgot(): void {
        this.router.navigate([APP_ROUTES.AUTH.FORGOT]);
    }

    private resolveErrorMessage(error: { status: number; error?: { message?: string } }): string {
        if (error.status === 401) return 'Usuario o contraseña incorrectos.';
        if (error.status === 403) return 'Cuenta deshabilitada. Contactá con soporte.';
        if (error.status === 0) return 'Sin conexión con el servidor.';
        return error.error?.message ?? 'Error al iniciar sesión. Intentá nuevamente.';
    }
}
