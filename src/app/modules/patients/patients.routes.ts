import { Routes } from '@angular/router';
import { PatientsComponent } from './patients.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';

export const patientsRoutes: Routes = [
    { path: '', component: PatientsComponent, data: { breadcrumb: 'Pacientes' } },
    { path: ':id', component: PatientDetailComponent, data: { breadcrumb: 'Ficha del Paciente' } }
];
