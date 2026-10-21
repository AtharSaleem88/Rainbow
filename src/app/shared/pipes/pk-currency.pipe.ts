import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pkCurrency',
  standalone: true
})
export class PkCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showDecimals = false): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'Rs. 0';
    }

    const num = Number(value);
    const formatted = showDecimals
      ? num.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.round(num).toLocaleString('en-PK');

    return `Rs. ${formatted}`;
  }
}
