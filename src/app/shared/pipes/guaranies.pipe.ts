import { Pipe, PipeTransform } from '@angular/core';
import { CURRENCY_LOCALE } from '../../core/models/app.constants';

@Pipe({ name: 'guaranies', standalone: true })
export class GuaraniesPipe implements PipeTransform {
    transform(value: number | null | undefined): string {
        if (value == null) return '₲ 0';
        return `₲ ${value.toLocaleString(CURRENCY_LOCALE)}`;
    }
}
