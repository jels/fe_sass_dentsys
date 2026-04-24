import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/api/auth.service';
import { MenuitemComponent } from '../menuitem/menuitem.component';

@Component({
    selector: 'app-menu',
    imports: [MenuitemComponent, RouterModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss'
})
export class MenuComponent {
    model: MenuItem[] = [];
    private authService = inject(AuthService);

    rolUser = this.authService.getUserRoles();

    constructor() {}

    haveRole(role: string): boolean {
        return this.rolUser.includes(role);
    }

    ngOnInit() {
        this.model = [
            {
                label: 'Inicio',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-gauge',
                        routerLink: ['/sys/dashboard']
                    }
                ]
            },
            {
                label: 'E-COMMERCE',
                items: [
                    {
                        label: 'Pedidos',
                        icon: 'pi pi-fw pi-gift',
                        visible: this.haveRole('warehouse_operator') || this.haveRole('delivery_person') || this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root'),
                        items: [
                            {
                                label: 'Picking de Ordenes',
                                icon: 'pi pi-fw pi-chart-line',
                                visible: this.haveRole('warehouse_operator') || this.haveRole('delivery_person') || this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/orders/orders']
                            },
                            {
                                label: 'Romaneo de Ordenes',
                                icon: 'pi pi-fw pi-database',
                                visible: this.haveRole('warehouse_operator') || this.haveRole('delivery_person') || this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/orders/picking-orders']
                            },
                            {
                                label: 'Ordenes',
                                icon: 'pi pi-fw pi-database',
                                visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/orders']
                            },
                            {
                                label: 'Facturas',
                                icon: 'pi pi-fw pi-database',
                                visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/orders/invoice']
                            }
                        ]
                    },
                    {
                        label: 'Favoritos',
                        icon: 'pi pi-fw pi-heart',
                        visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                        // routerLink: ['/dd/cp/favorites']
                    },
                    {
                        label: 'E-Commerce',
                        icon: 'pi pi-fw pi-cart-plus',
                        visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                        // routerLink: ['/dd/cp/ecommerce']
                    }
                ]
            },
            {
                label: 'ADMINISTRACIÓN',
                items: [
                    {
                        label: 'Reportes',
                        icon: 'pi pi-fw pi-chart-bar',
                        visible: this.haveRole('warehouse_operator') || this.haveRole('delivery_person') || this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root'),
                        items: [
                            {
                                label: 'Entrada vs Salida',
                                icon: 'pi pi-fw pi-chart-line',
                                visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/report/movement']
                            },
                            {
                                label: 'Inventario General',
                                icon: 'pi pi-fw pi-database',
                                visible: this.haveRole('warehouse_operator') || this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/report/general']
                            },
                            {
                                label: 'Inventario por Depósito',
                                icon: 'pi pi-fw pi-database',
                                visible: this.haveRole('warehouse_operator') || this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/report/inventory-branch']
                            },
                            {
                                label: 'Delivery Tracking',
                                icon: 'pi pi-fw pi-truck',
                                visible: this.haveRole('warehouse_operator') || this.haveRole('delivery_person') || this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/report/delivery-tracking']
                            }
                        ]
                    },
                    {
                        label: 'Configuración',
                        icon: 'pi pi-fw pi-cog',
                        visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root'),
                        items: [
                            {
                                label: 'Productos',
                                icon: 'pi pi-fw pi-tags',
                                visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/settings/products']
                            },
                            {
                                label: 'Categorias',
                                icon: 'pi pi-fw pi-list-check',
                                visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/settings/categories']
                            },
                            {
                                label: 'Depósitos y Stock',
                                icon: 'pi pi-fw pi-map-marker',
                                visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/settings/warehause-stock']
                            },
                            {
                                label: 'Sucusales',
                                icon: 'pi pi-fw pi-shop',
                                visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/settings/branch']
                            },
                            {
                                label: 'Timbrados',
                                icon: 'pi pi-fw pi-receipt',
                                visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/settings/timbrado']
                            },
                            {
                                label: 'Roles y Usuarios',
                                icon: 'pi pi-fw pi-id-card',
                                visible: this.haveRole('manager') || this.haveRole('admin') || this.haveRole('Root')
                                // routerLink: ['/dd/cp/settings/user-rol']
                            }
                        ]
                    }
                ]
            }
        ];
    }
}
