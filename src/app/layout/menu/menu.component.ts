import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuitemComponent } from '../menuitem/menuitem.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, RouterModule, MenuitemComponent],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
    private authService = inject(AuthService);
    model: any[] = [];

    ngOnInit(): void {
        // const isAdmin = this.authService.hasAnyRole(['SUPER_ADMIN', 'ADMIN']);
        // const isAccountant = this.authService.hasAnyRole(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']);
        // const isReceptionist = this.authService.hasAnyRole(['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']);
        const isAdmin = true;
        const isAccountant = true;
        const isReceptionist = true;

        this.model = [
            {
                label: 'Principal',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-home',
                        routerLink: ['/modules/dashboard']
                    }
                ]
            },
            ...(isAdmin
                ? [
                      {
                          label: 'Organización',
                          items: [
                              {
                                  label: 'Empresa',
                                  icon: 'pi pi-building',
                                  routerLink: ['/modules/company']
                              },
                              {
                                  label: 'Sucursales',
                                  icon: 'pi pi-map-marker',
                                  routerLink: ['/modules/branch']
                              }
                          ]
                      }
                  ]
                : []),
            {
                label: 'Catálogos',
                items: [
                    ...(isAdmin
                        ? [
                              {
                                  label: 'Dentistas',
                                  icon: 'pi pi-user-plus',
                                  routerLink: ['/modules/dentist']
                              },
                              {
                                  label: 'Tratamientos',
                                  icon: 'pi pi-list',
                                  routerLink: ['/modules/treatment-catalog']
                              },
                              {
                                  label: 'Timbrados',
                                  icon: 'pi pi-verified',
                                  routerLink: ['/modules/stamps']
                              }
                          ]
                        : [])
                ]
            },
            {
                label: 'Operaciones',
                items: [
                    {
                        label: 'Pacientes',
                        icon: 'pi pi-users',
                        routerLink: ['/modules/patients']
                    },
                    {
                        label: 'Agenda',
                        icon: 'pi pi-calendar',
                        routerLink: ['/modules/scheduling']
                    },
                    {
                        label: 'Plan de tratamiento',
                        icon: 'pi pi-clipboard',
                        routerLink: ['/modules/treatment-plan']
                    },
                    {
                        label: 'Evolución clínica',
                        icon: 'pi pi-heart',
                        routerLink: ['/modules/performed-treatments']
                    }
                ]
            },
            ...(isAccountant || isReceptionist
                ? [
                      {
                          label: 'Facturación',
                          items: [
                              {
                                  label: 'Facturas',
                                  icon: 'pi pi-file-check',
                                  routerLink: ['/modules/invoicing']
                              },
                              {
                                  label: 'Recibos',
                                  icon: 'pi pi-receipt',
                                  routerLink: ['/modules/receipts']
                              },
                              ...(isAccountant
                                  ? [
                                        {
                                            label: 'Libro caja',
                                            icon: 'pi pi-book',
                                            routerLink: ['/modules/cash-book']
                                        },
                                        {
                                            label: 'Reportes',
                                            icon: 'pi pi-chart-bar',
                                            routerLink: ['/modules/reports']
                                        }
                                    ]
                                  : [])
                          ]
                      }
                  ]
                : [])
        ];
    }
}
