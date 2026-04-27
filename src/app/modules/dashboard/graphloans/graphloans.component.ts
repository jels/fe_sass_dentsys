import { Component } from '@angular/core';

import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';

@Component({
    selector: 'app-graphloans',
    imports: [ChartModule, FluidModule],
    templateUrl: './graphloans.component.html',
    styleUrl: './graphloans.component.scss'
})
export class GraphloansComponent {
    lineData: any;
    lineOptions: any;

    constructor() {
        this.initCharts();
    }

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.lineData = {
            labels: ['Ago', 'Set', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Entregados',
                    data: [35, 45, 60, 25, 65, 35, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                    tension: 0.4
                },
                {
                    label: 'Pedidos',
                    data: [25, 10, 16, 33, 48, 12, 28, 48, 40, 19, 86, 27],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    borderColor: documentStyle.getPropertyValue('--p-primary-200'),
                    tension: 0.4
                }
            ]
        };

        this.lineOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }
}
