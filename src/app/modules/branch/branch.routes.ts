import { Routes } from '@angular/router';
import { BranchComponent } from './branch.component';

export const branchRoutes: Routes = [{ path: '', component: BranchComponent, data: { breadcrumb: 'Sucursales' } }];
