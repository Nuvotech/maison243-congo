/**
 * Shared helpers for the seller, agency and admin portals. Dates in the
 * demo data are stored as "days ago" offsets from today.
 */

export type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const groupDigits = (value: string): string => value.replace(/[\s,  ]/g, ' ');

/** Whole rands, e.g. "R 1 450 000". */
export const zar = (amount: number): string =>
    'R ' +
    groupDigits(
        new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 }).format(
            Math.round(amount),
        ),
    );

/** Rands and cents, e.g. "R 3 490,00". */
export const zarCents = (amount: number): string =>
    'R ' +
    groupDigits(
        new Intl.NumberFormat('en-ZA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount),
    );

/** Adds 15% VAT and formats with cents. */
export const zarInclVat = (amount: number): string => zarCents(amount * 1.15);

export const formatCount = (value: number): string =>
    groupDigits(new Intl.NumberFormat('en-ZA').format(value));

export const daysAgo = (days: number): Date => {
    const today = new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - days,
    );
};

/** "02/10/2026" */
export const shortDate = (days: number): string => {
    const date = daysAgo(days);

    return [
        String(date.getDate()).padStart(2, '0'),
        String(date.getMonth() + 1).padStart(2, '0'),
        date.getFullYear(),
    ].join('/');
};

/** "2 Oct 2026" */
export const niceDate = (days: number): string =>
    daysAgo(days).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

/** "2 Oct" */
export const dayMonth = (days: number): string =>
    daysAgo(days).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
    });

export const relativeDays = (days: number): string => {
    if (days <= 0) {
        return 'Today';
    }

    return days === 1 ? 'Yesterday' : `${days} days ago`;
};

/** ISO date ("2026-12-31") a number of days from today. */
export const isoInDays = (days: number): string => {
    const date = daysAgo(-days);

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
};

export const daysUntil = (iso: string): number => {
    const [year, month, day] = iso.split('-').map(Number);

    return Math.round(
        (new Date(year, month - 1, day).getTime() - daysAgo(0).getTime()) /
            864e5,
    );
};

export const formatIsoDate = (iso: string): string => {
    const [year, month, day] = iso.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const initials = (name: string): string =>
    name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('');

export const isValidEmail = (email: string): boolean =>
    /^\S+@\S+\.\S+$/.test(email);

/** Deterministic pseudo-random generator so demo charts stay stable. */
export function seededRandom(seed: number): () => number {
    let state = seed;

    return () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const toneByStatus: Record<string, Tone> = {
    Live: 'success',
    Complete: 'success',
    Paid: 'success',
    Contacted: 'success',
    Active: 'success',
    Verified: 'success',
    Recommended: 'success',
    'Pending review': 'warning',
    'Invite sent': 'warning',
    Invited: 'warning',
    'FFC pending': 'warning',
    'ID pending': 'warning',
    Pending: 'warning',
    Due: 'warning',
    Expired: 'error',
    Overdue: 'error',
    Suspended: 'error',
    Removed: 'error',
    'Not recommended': 'error',
    'Under offer': 'info',
    New: 'info',
    'In progress': 'info',
};

/** Seller and agency portals show "Due" as an error, admin as a warning. */
export const statusTone = (
    status: string,
    overrides: Record<string, Tone> = {},
): Tone => overrides[status] ?? toneByStatus[status] ?? 'neutral';

/** Catmull-Rom spline through the points, as an SVG path. */
export function smoothPath(points: [number, number][]): string {
    const f = (value: number): string => value.toFixed(1);
    let path = `M${f(points[0][0])} ${f(points[0][1])}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] ?? points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] ?? p2;
        path += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }

    return path;
}
