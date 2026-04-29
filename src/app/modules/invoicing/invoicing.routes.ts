import { Routes } from '@angular/router';
import { InvoicingComponent } from './invoicing.component';

export const invoicingRoutes: Routes = [{ path: '', component: InvoicingComponent, data: { breadcrumb: 'Facturas' } }];
