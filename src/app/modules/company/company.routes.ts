import { Routes } from '@angular/router';
import { CompanyComponent } from './company.component';

export const companyRoutes: Routes = [{ path: '', component: CompanyComponent, data: { breadcrumb: 'Empresa' } }];
