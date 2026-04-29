import { Routes } from '@angular/router';
import { SchedulingComponent } from './scheduling.component';

export const schedulingRoutes: Routes = [{ path: '', component: SchedulingComponent, data: { breadcrumb: 'Agenda' } }];
