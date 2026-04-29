import { Routes } from '@angular/router';
import { TreatmentPlanComponent } from './treatment-plan.component';
import { TreatmentPlanDetailComponent } from './treatment-plan-detail/treatment-plan-detail.component';

export const treatmentPlanRoutes: Routes = [
    { path: '', component: TreatmentPlanComponent, data: { breadcrumb: 'Planes de Tratamiento' } },
    { path: ':id', component: TreatmentPlanDetailComponent, data: { breadcrumb: 'Detalle del Plan' } }
];
