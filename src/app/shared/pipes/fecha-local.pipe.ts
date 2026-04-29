import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fechaLocal', standalone: true })
export class FechaLocalPipe implements PipeTransform {
    transform(value: string | Date | null | undefined, includeTime = false): string {
        if (!value) return '—';

        const date = typeof value === 'string' ? new Date(value) : value;

        if (isNaN(date.getTime())) return '—';

        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return date.toLocaleDateString('es-PY', options);
    }
}
