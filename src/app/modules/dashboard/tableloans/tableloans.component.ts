import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-tableloans',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    templateUrl: './tableloans.component.html',
    styleUrl: './tableloans.component.scss',
    providers: []
})
export class TableloansComponent {
    products!: any[];

    constructor() {}

    ngOnInit() {}
}
