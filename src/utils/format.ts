const numberFormatter = new Intl.NumberFormat('en-US');

export const num = (value: number): string => numberFormatter.format(Math.round(value));
export const money = (value: number): string => '$' + num(value);
