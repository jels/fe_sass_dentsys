import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { FloatingconfiguratorComponent } from '../../layout/floatingconfigurator/floatingconfigurator.component';
import { NotificationService } from '../../shared/components/notification-modal/notification.service';
import { UserService } from '../../core/services/api/user.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/api/auth.service';
import { LoadingWebComponent } from '../../shared/components/loading-web/loading-web.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, FloatingconfiguratorComponent, FloatLabelModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    providers: [MessageService]
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = signal(false);
    loadingMessage = signal('');
    returnUrl: string = '/sys/dashboard';
    mensaje = 'Validando, aguarde...';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(4)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    ngOnInit(): void {
        this.initForm();
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/sys/dashboard';

        // Verificar si ya está autenticado
        const token = localStorage.getItem('access_token');
        if (token && !this.authService.isTokenExpired(token)) {
            console.log('🔐 Already authenticated on init');
            this.redirectBasedOnRole();
        }
    }

    private initForm(): void {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    forgot() {
        this.router.navigate(['auth/forgot']);
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.markFormGroupTouched(this.loginForm);
            return;
        }

        this.loading.set(true);
        this.loadingMessage.set('Iniciando sesión...');

        const { username, password } = this.loginForm.value;

        this.authService.login({ username, password }).subscribe({
            next: (response) => {
                if (response.success) {
                    console.log('✅ Login successful');

                    // 🔥 Verificar que los datos se guardaron
                    const storedToken = localStorage.getItem('access_token');
                    const storedUser = localStorage.getItem('user_info');

                    console.log('🔍 Verificación post-login:', {
                        hasToken: !!storedToken,
                        hasUser: !!storedUser,
                        userData: storedUser ? JSON.parse(storedUser) : null
                    });

                    if (!storedToken || !storedUser) {
                        console.error('❌ Token o usuario no se guardaron en localStorage');
                        this.loading.set(false);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al guardar la sesión. Intenta nuevamente.',
                            life: 5000
                        });
                        return;
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: response.message || 'Bienvenido de vuelta!',
                        life: 3000
                    });

                    this.loadingMessage.set('Redirigiendo...');

                    // 🔥 Redirigir INMEDIATAMENTE usando Angular Router (no window.location)
                    this.redirectBasedOnRole();
                }
            },
            error: (error) => {
                this.loading.set(false);
                this.loadingMessage.set('');

                console.error('❌ Login error:', error);

                let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';

                if (error.status === 401) {
                    errorMessage = 'Credenciales inválidas';
                } else if (error.status === 403) {
                    errorMessage = 'Cuenta deshabilitada. Contacta con soporte.';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    private redirectBasedOnRole(): void {
        // 🔥 Leer de localStorage
        const userStr = localStorage.getItem('user_info');

        if (!userStr) {
            console.error('❌ No user_info in localStorage');
            this.loading.set(false);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo cargar la información del usuario',
                life: 5000
            });
            return;
        }

        const user = JSON.parse(userStr);

        if (!user || !user.roles || !Array.isArray(user.roles)) {
            console.error('❌ No roles found in user:', user);
            this.loading.set(false);
            return;
        }

        console.log('👤 User data:', user);

        // Normalizar roles (quitar ROLE_ si existe y convertir a minúsculas)
        const userRoles = user.roles.map((role: string) => role.replace('ROLE_', '').toLowerCase());

        console.log('🔐 User roles:', userRoles);

        // Determinar ruta según roles
        let targetUrl = this.returnUrl;

        // Si la ruta de retorno es la por defecto o raíz, redirigir según el rol
        if (targetUrl === '/sys/dashboard' || targetUrl === '/sys/dashboard' || targetUrl === '/sys/dashboard') {
            if (userRoles.includes('root') || userRoles.includes('manager')) {
                targetUrl = '/sys/dashboard';
            } else if (userRoles.includes('customer')) {
                targetUrl = '/sys/dashboard';
            } else if (userRoles.includes('warehouse_operator') || userRoles.includes('delivery_person')) {
                targetUrl = '/sys/dashboard';
            } else {
                // Si no tiene ningún rol conocido, ir a cliente por defecto
                targetUrl = '/sys/dashboard';
            }
        }

        console.log('🚀 Redirecting to:', targetUrl);

        // 🔥 Usar Angular Router en lugar de window.location
        this.loading.set(false);
        this.router.navigate([targetUrl]);
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }
}
