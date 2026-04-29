import { Routes } from '@angular/router';
import { CashBookComponent } from './cash-book.component';

export const cashBookRoutes: Routes = [{ path: '', component: CashBookComponent, data: { breadcrumb: 'Libro Caja' } }];
