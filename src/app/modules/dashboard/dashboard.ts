import { Component } from '@angular/core';
import { TableloansComponent } from './tableloans/tableloans.component';
import { GraphloansComponent } from './graphloans/graphloans.component';
import { StatswidgetComponent } from './statswidget/statswidget.component';

@Component({
    selector: 'app-dashboard',
    imports: [StatswidgetComponent, GraphloansComponent, TableloansComponent],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss'
})
export class Dashboard {}
