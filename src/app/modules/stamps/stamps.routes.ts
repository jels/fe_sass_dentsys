import { Routes } from '@angular/router';
import { StampsComponent } from './stamps.component';

export const stampsRoutes: Routes = [{ path: '', component: StampsComponent, data: { breadcrumb: 'Timbrados' } }];
