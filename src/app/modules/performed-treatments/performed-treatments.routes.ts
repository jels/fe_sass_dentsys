import { Routes } from '@angular/router';
import { PerformedTreatmentsComponent } from './performed-treatments.component';

export const performedTreatmentsRoutes: Routes = [{ path: '', component: PerformedTreatmentsComponent, data: { breadcrumb: 'Evolución Clínica' } }];
