import { Routes } from '@angular/router';
import { DentistComponent } from './dentist.component';

export const dentistRoutes: Routes = [{ path: '', component: DentistComponent, data: { breadcrumb: 'Dentistas' } }];
