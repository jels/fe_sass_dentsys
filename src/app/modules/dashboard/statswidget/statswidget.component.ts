import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/api/auth.service';

@Component({
    selector: 'app-statswidget',
    standalone: true,
    imports: [],
    templateUrl: './statswidget.component.html',
    styleUrl: './statswidget.component.scss'
})
export class StatswidgetComponent implements OnInit {
    // dashboardDto: DashboardDto = {} as DashboardDto;

    private authService = inject(AuthService);

    rolUser = this.authService.getUserRoles();

    constructor() {
        // constructor(private _dashboardService: DashboardService) {
        // this._dashboardService.getDatosStatsWidgets().subscribe((resp) => {
        //     if (resp.status) {
        //         console.log(resp.objeto);
        //         this.dashboardDto = resp.objeto;
        //     }
        // });
    }

    ngOnInit() {}

    haveRole(role: string): boolean {
        return this.rolUser.includes(role);
    }
}
