import { useState } from 'react';

export type BondTerm = '15' | '20' | '25' | '30';

const parseAmount = (value: string): number =>
    parseFloat(value.replace(/[^\d.]/g, '')) || 0;

export const formatRand = (amount: number): string =>
    'R ' +
    new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 })
        .format(Math.round(amount))
        .replace(/[\s,  ]/g, ' ');

/**
 * Monthly bond repayment estimate using the standard amortisation formula.
 */
export function useBondCalculator() {
    const [price, setPrice] = useState('1 450 000');
    const [deposit, setDeposit] = useState('145 000');
    const [rate, setRate] = useState('10.75');
    const [term, setTerm] = useState<BondTerm>('20');

    const loan = Math.max(0, parseAmount(price) - parseAmount(deposit));
    const monthlyRate = parseAmount(rate) / 100 / 12;
    const months = parseAmount(term) * 12;
    const monthly =
        monthlyRate > 0 && months > 0
            ? (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
            : loan / (months || 1);

    return {
        price,
        deposit,
        rate,
        term,
        setPrice,
        setDeposit,
        setRate,
        setTerm,
        loanLabel: formatRand(loan),
        monthlyLabel: formatRand(monthly),
    };
}

export type BondCalculator = ReturnType<typeof useBondCalculator>;

export const bondTerms: BondTerm[] = ['20', '25', '30', '15'];
