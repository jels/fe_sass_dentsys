import { Routes } from '@angular/router';
import { TreatmentCatalogComponent } from './treatment-catalog.component';

export const treatmentCatalogRoutes: Routes = [{ path: '', component: TreatmentCatalogComponent, data: { breadcrumb: 'Catálogo de Tratamientos' } }];
