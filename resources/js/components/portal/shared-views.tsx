import type { ReactNode } from 'react';
import { useState } from 'react';
import type { PortalAction } from '@/components/portal/ui';
import {
    ActionButtons,
    Avatar,
    Button,
    Card,
    CardTitle,
    CellText,
    Field,
    Icon,
    PortalDialog,
    Segmented,
    SelectInput,
    StatCard,
    StatusBadge,
    Table,
    Td,
    TextInput,
    Th,
    Toggle,
    buttonClass,
} from '@/components/portal/ui';
import type { Tone } from '@/lib/portal';
import {
    dayMonth,
    formatCount,
    initials,
    isValidEmail,
    niceDate,
    relativeDays,
    seededRandom,
} from '@/lib/portal';
import { cn } from '@/lib/utils';

/** Seller and agency portals flag unpaid invoices in red. */
export const portalToneOverrides: Record<string, Tone> = { Due: 'error' };

/* ----------------------------------------------------------------- Leads */

export type LeadStatus = 'New' | 'Contacted' | 'Closed';

export type LeadView = {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    daysAgo: number;
    via: string;
    status: LeadStatus;
    propertyId: string;
    propertyShort: string;
    propertyAddress: string;
    propertySub: string;
    price: string;
    agentId?: string;
};

export function LeadsView({
    leads,
    onStatusChange,
    onOpenProperty,
    assign,
}: {
    leads: LeadView[];
    onStatusChange: (id: string, status: LeadStatus, message: string) => void;
    onOpenProperty: (propertyId: string) => void;
    assign?: {
        options: { value: string; label: string }[];
        onAssign: (leadId: string, agentId: string) => void;
    };
}) {
    const [filter, setFilter] = useState<'All' | LeadStatus>('All');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const list = leads
        .filter((lead) => filter === 'All' || lead.status === filter)
        .sort((a, b) => a.daysAgo - b.daysAgo);
    const selected = list.find((lead) => lead.id === selectedId) ?? list[0];

    const action = (
        label: string,
        status: LeadStatus,
        message: string,
        primary = false,
    ): PortalAction => ({
        label,
        primary,
        run: () => selected && onStatusChange(selected.id, status, message),
    });

    const actions: PortalAction[] = !selected
        ? []
        : selected.status === 'New'
          ? [
                action(
                    'Mark as contacted',
                    'Contacted',
                    'Marked as contacted',
                    true,
                ),
                action('Close lead', 'Closed', 'Lead closed'),
            ]
          : selected.status === 'Contacted'
            ? [
                  action('Close lead', 'Closed', 'Lead closed', true),
                  action('Back to new', 'New', 'Moved back to new'),
              ]
            : [action('Reopen', 'Contacted', 'Lead reopened')];

    return (
        <>
            <Segmented
                label="Filter leads"
                value={filter}
                onChange={(value) => {
                    setFilter(value);
                    setSelectedId(null);
                }}
                options={(['All', 'New', 'Contacted', 'Closed'] as const).map(
                    (value) => ({
                        value,
                        label: value,
                        count:
                            value === 'All'
                                ? leads.length
                                : leads.filter((lead) => lead.status === value)
                                      .length,
                    }),
                )}
            />
            <div className="grid items-start gap-4 min-[1180px]:grid-cols-[minmax(320px,1fr)_minmax(0,1.5fr)]">
                <Card className="flex flex-col overflow-hidden">
                    {list.map((lead) => {
                        const isSelected = selected?.id === lead.id;

                        return (
                            <button
                                key={lead.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => setSelectedId(lead.id)}
                                className={cn(
                                    'flex w-full cursor-pointer items-start gap-3 border-b border-l-[3px] border-b-portal-hair px-4 py-3.5 text-left text-portal-ink hover:bg-portal-row-hover',
                                    isSelected
                                        ? 'border-l-portal-accent bg-portal-accent-wash'
                                        : lead.status === 'New'
                                          ? 'border-l-portal-accent-ring bg-white'
                                          : 'border-l-transparent bg-white',
                                )}
                            >
                                <Avatar initials={initials(lead.name)} />
                                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                                    <span className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                'flex-1 text-sm',
                                                lead.status === 'New'
                                                    ? 'font-bold'
                                                    : 'font-semibold',
                                            )}
                                        >
                                            {lead.name}
                                        </span>
                                        <span className="text-xs whitespace-nowrap text-portal-subtle">
                                            {relativeDays(lead.daysAgo)}
                                        </span>
                                    </span>
                                    <span className="truncate text-xs text-portal-muted">
                                        {lead.propertyShort}
                                    </span>
                                    <span className="truncate text-[13px] text-portal-subtle">
                                        {lead.message}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                    {!list.length && (
                        <p className="px-4 py-7 text-portal-subtle">
                            No leads here.
                        </p>
                    )}
                </Card>

                {selected && (
                    <Card className="flex flex-col gap-[18px] p-[22px]">
                        <div className="flex flex-wrap items-start gap-3.5">
                            <Avatar
                                initials={initials(selected.name)}
                                size="lg"
                            />
                            <div className="min-w-[180px] flex-1">
                                <div className="text-[19px] font-bold">
                                    {selected.name}
                                </div>
                                <div className="mt-0.5 text-[13px] text-portal-subtle">
                                    {selected.via} ·{' '}
                                    {relativeDays(selected.daysAgo)}
                                </div>
                            </div>
                            <StatusBadge status={selected.status} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.propertyShort}`)}`}
                                className={buttonClass()}
                            >
                                <Icon name="mail" size={15} />
                                {selected.email}
                            </a>
                            <a
                                href={`tel:${selected.phone.replace(/\s/g, '')}`}
                                className={buttonClass()}
                            >
                                <Icon name="phone" size={15} />
                                {selected.phone}
                            </a>
                        </div>
                        <div className="rounded-xl bg-portal-soft px-4 py-3.5 leading-[1.6] text-pretty">
                            {selected.message}
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenProperty(selected.propertyId)}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-portal-line bg-white p-3 text-left text-portal-ink hover:border-portal-accent-ring"
                        >
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="text-xs text-portal-subtle">
                                    Enquiry about
                                </span>
                                <span className="font-semibold">
                                    {selected.propertyAddress}
                                </span>
                                <span className="text-xs text-portal-muted">
                                    {selected.propertySub}
                                </span>
                            </span>
                            <span className="font-bold whitespace-nowrap text-portal-accent">
                                {selected.price}
                            </span>
                        </button>
                        {assign && (
                            <Field label="Assigned agent">
                                <SelectInput
                                    value={selected.agentId}
                                    options={assign.options}
                                    onChange={(event) =>
                                        assign.onAssign(
                                            selected.id,
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        )}
                        <ActionButtons
                            actions={actions}
                            size="lg"
                            className="gap-2 border-t border-portal-hair pt-4"
                        />
                    </Card>
                )}
            </div>
        </>
    );
}

/* ------------------------------------------------------------ Screenings */

export type ScreeningStatus =
    | 'Invite sent'
    | 'In progress'
    | 'Complete'
    | 'Cancelled';

export type ScreeningView = {
    id: string;
    name: string;
    email: string;
    daysAgo: number;
    status: ScreeningStatus;
    result: '' | 'Recommended' | 'Not recommended';
    propertyShort: string;
    propertySub: string;
};

export function ScreeningsView({
    screenings,
    onRequest,
    onViewReport,
    onNudge,
}: {
    screenings: ScreeningView[];
    onRequest: () => void;
    onViewReport: (id: string) => void;
    onNudge: (screening: ScreeningView) => void;
}) {
    return (
        <>
            <Card className="flex flex-wrap items-center gap-4 border-portal-accent-line bg-[#f7f9ff] px-5 py-[18px]">
                <span className="grid size-[42px] flex-none place-items-center rounded-xl bg-portal-accent text-white">
                    <Icon name="shield" size={20} />
                </span>
                <div className="min-w-[240px] flex-1">
                    <div className="text-[15px] font-bold">
                        Screen tenants before you sign
                    </div>
                    <div className="mt-[3px] text-[13px] leading-normal text-portal-muted">
                        We email the applicant a secure link to verify their ID,
                        credit record and affordability. R 250 per screening,
                        charged only when the applicant completes it.
                    </div>
                </div>
                <Button variant="primary" className="h-10" onClick={onRequest}>
                    <Icon name="plus" size={15} strokeWidth={2.2} />
                    Request screening
                </Button>
            </Card>
            <Card className="overflow-hidden">
                <Table minWidth={820}>
                    <thead>
                        <tr>
                            <Th>Applicant</Th>
                            <Th>Property</Th>
                            <Th>Requested</Th>
                            <Th>Status</Th>
                            <Th>Result</Th>
                            <Th />
                        </tr>
                    </thead>
                    <tbody>
                        {[...screenings]
                            .sort((a, b) => a.daysAgo - b.daysAgo)
                            .map((screening) => {
                                const action =
                                    screening.status === 'Complete'
                                        ? 'View report'
                                        : screening.status === 'Invite sent'
                                          ? 'Resend invite'
                                          : screening.status === 'In progress'
                                            ? 'Send reminder'
                                            : '';

                                return (
                                    <tr key={screening.id}>
                                        <Td>
                                            <CellText
                                                main={screening.name}
                                                sub={screening.email}
                                                strong
                                            />
                                        </Td>
                                        <Td>
                                            <CellText
                                                main={screening.propertyShort}
                                                sub={screening.propertySub}
                                            />
                                        </Td>
                                        <Td className="whitespace-nowrap text-portal-muted">
                                            {niceDate(screening.daysAgo)}
                                        </Td>
                                        <Td>
                                            <StatusBadge
                                                status={screening.status}
                                            />
                                        </Td>
                                        <Td
                                            className={cn(
                                                'font-semibold',
                                                screening.result ===
                                                    'Recommended'
                                                    ? 'text-portal-success'
                                                    : screening.result
                                                      ? 'text-portal-error'
                                                      : 'text-portal-subtle',
                                            )}
                                        >
                                            {screening.result || '—'}
                                        </Td>
                                        <Td align="right">
                                            {action && (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        screening.status ===
                                                        'Complete'
                                                            ? onViewReport(
                                                                  screening.id,
                                                              )
                                                            : onNudge(screening)
                                                    }
                                                >
                                                    {action}
                                                </Button>
                                            )}
                                        </Td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </Table>
            </Card>
        </>
    );
}

export function RequestScreeningDialog({
    open,
    onClose,
    rentals,
    defaultPropertyId,
    billingNote,
    onSend,
}: {
    open: boolean;
    onClose: () => void;
    rentals: { value: string; label: string }[];
    defaultPropertyId: string;
    billingNote: string;
    onSend: (applicant: {
        name: string;
        email: string;
        propertyId: string;
    }) => void;
}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [propertyId, setPropertyId] = useState(defaultPropertyId);
    const [error, setError] = useState('');

    const send = (): void => {
        if (!name.trim()) {
            setError("Enter the applicant's name.");

            return;
        }

        if (!isValidEmail(email)) {
            setError('Enter a valid email address.');

            return;
        }

        onSend({ name: name.trim(), email: email.trim(), propertyId });
    };

    return (
        <PortalDialog
            open={open}
            onClose={onClose}
            title="Request a tenant screening"
            description={billingNote}
            error={error}
            confirmLabel="Send invite"
            onConfirm={send}
        >
            <div className="flex flex-col gap-3">
                <Field label="Applicant's full name">
                    <TextInput
                        value={name}
                        placeholder="e.g. Ayanda Zwane"
                        onChange={(event) => {
                            setName(event.target.value);
                            setError('');
                        }}
                    />
                </Field>
                <Field label="Applicant's email">
                    <TextInput
                        type="email"
                        value={email}
                        placeholder="name@email.com"
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setError('');
                        }}
                    />
                </Field>
                <Field label="Rental property">
                    <SelectInput
                        value={propertyId}
                        options={rentals}
                        onChange={(event) => setPropertyId(event.target.value)}
                    />
                </Field>
            </div>
        </PortalDialog>
    );
}

export function ScreeningReportDialog({
    screening,
    completedLabel,
    scores,
    onClose,
}: {
    screening: ScreeningView | null;
    completedLabel: string;
    scores: { good: string; goodAffordability: string };
    onClose: () => void;
}) {
    const isRecommended = screening?.result === 'Recommended';
    const rows = [
        ['ID verification', 'Verified with Home Affairs'],
        ['Credit score', isRecommended ? scores.good : '541 · Poor'],
        [
            'Affordability',
            isRecommended
                ? scores.goodAffordability
                : 'Rent is 46% of net income',
        ],
        [
            'Judgements & defaults',
            isRecommended ? 'None' : '1 default judgement (2024)',
        ],
        [
            'Previous landlord',
            isRecommended ? 'Positive reference' : 'No reference supplied',
        ],
    ];

    return (
        <PortalDialog
            open={screening !== null}
            onClose={onClose}
            title={screening?.name ?? ''}
            description={completedLabel}
            cancelLabel="Close"
        >
            <div
                className={cn(
                    'rounded-[10px] px-3.5 py-3 font-bold',
                    isRecommended
                        ? 'bg-portal-success-bg text-portal-success'
                        : 'bg-portal-error-bg text-portal-error',
                )}
            >
                {isRecommended ? 'Recommended' : 'Not recommended'}
            </div>
            <dl className="flex flex-col">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex gap-3 border-t border-portal-hair py-2.5"
                    >
                        <dt className="flex-1 text-portal-head">{label}</dt>
                        <dd className="text-right font-semibold">{value}</dd>
                    </div>
                ))}
            </dl>
        </PortalDialog>
    );
}

/* ----------------------------------------------------------- Performance */

export type PerformanceListing = {
    id: string;
    label: string;
    sub: string;
    status: string;
    series: number[];
    leads: number;
    newLeads: number;
};

/**
 * Thirty days of views for a listing, oldest first. Days before it was
 * listed, and days after it stopped being live, have no views.
 */
export function viewSeries({
    id,
    listedDaysAgo,
    modifiedDaysAgo,
    isOn,
    base,
    boostRecent,
}: {
    id: string;
    listedDaysAgo: number | null;
    modifiedDaysAgo: number;
    isOn: boolean;
    base: number;
    boostRecent: (day: number) => number;
}): number[] {
    if (listedDaysAgo === null) {
        return Array<number>(30).fill(0);
    }

    const random = seededRandom(Number(id.slice(-5)));

    return Array.from({ length: 30 }, (_, index) => {
        const day = 29 - index;

        if (day > listedDaysAgo || (!isOn && day < modifiedDaysAgo)) {
            return 0;
        }

        return Math.round(base * (0.45 + random() * 1.1) * boostRecent(day));
    });
}

export function PerformanceView({
    listings,
    allLabel,
    savesRate,
    viewsChange,
    children,
}: {
    listings: PerformanceListing[];
    allLabel: string;
    savesRate: number;
    viewsChange?: string;
    children?: ReactNode;
}) {
    const [selectedId, setSelectedId] = useState('all');
    const selected =
        selectedId === 'all'
            ? listings
            : listings.filter((listing) => listing.id === selectedId);

    const days = Array<number>(30).fill(0);
    selected.forEach((listing) =>
        listing.series.forEach((views, index) => (days[index] += views)),
    );
    const views = days.reduce((sum, value) => sum + value, 0);
    const leads = selected.reduce((sum, listing) => sum + listing.leads, 0);
    const waiting = selected.reduce(
        (sum, listing) => sum + listing.newLeads,
        0,
    );
    const previous = Math.round(views * 0.86);
    const max = Math.max(1, ...days);

    const stats = [
        {
            label: 'Views',
            value: formatCount(views),
            sub:
                viewsChange ??
                `+${Math.round(((views - previous) / Math.max(1, previous)) * 100)}% on the previous 30 days`,
        },
        {
            label: 'Enquiries',
            value: String(leads),
            sub: `${waiting} waiting for a reply`,
        },
        {
            label: 'Saved to favourites',
            value: String(Math.round(views * savesRate)),
            sub: 'Buyers and renters who shortlisted',
        },
        {
            label: 'Enquiry rate',
            value: `${views ? ((leads / views) * 100).toFixed(1) : '0.0'}%`,
            sub: 'Enquiries per 100 views',
        },
    ];

    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2.5 text-[13px] font-semibold text-portal-body">
                    Listing
                    <SelectInput
                        value={selectedId}
                        onChange={(event) => setSelectedId(event.target.value)}
                        className="w-[320px] max-w-[70vw]"
                        options={[
                            { value: 'all', label: allLabel },
                            ...listings.map((listing) => ({
                                value: listing.id,
                                label: `${listing.label} · ${listing.id}`,
                            })),
                        ]}
                    />
                </label>
                <span className="flex-1" />
                <span className="rounded-lg border border-portal-line bg-white px-3 py-2 text-xs font-semibold text-portal-body">
                    Last 30 days
                </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>
            <Card className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                    <CardTitle className="flex-1">Daily views</CardTitle>
                    <span className="text-xs text-portal-subtle">
                        Hover a bar for the day's count
                    </span>
                </div>
                <div
                    className="flex h-[200px] items-end gap-1 border-b border-[#e9ecf1] pt-2"
                    role="img"
                    aria-label={`Daily views over the last 30 days, ${formatCount(views)} in total`}
                >
                    {days.map((count, index) => {
                        const day = 29 - index;

                        return (
                            <div
                                key={index}
                                title={`${niceDate(day)}: ${count} views`}
                                style={{ height: `${(count / max) * 100}%` }}
                                className={cn(
                                    'min-h-0.5 flex-1 rounded-t-[5px] hover:bg-portal-accent-strong',
                                    day === 0
                                        ? 'bg-portal-accent'
                                        : 'bg-portal-accent-bar',
                                )}
                            />
                        );
                    })}
                </div>
                <div className="flex gap-1" aria-hidden="true">
                    {days.map((_, index) => (
                        <span
                            key={index}
                            className="min-w-0 flex-1 overflow-visible text-[11px] whitespace-nowrap text-portal-subtle"
                        >
                            {index % 7 === 0 ? dayMonth(29 - index) : ''}
                        </span>
                    ))}
                </div>
            </Card>
            <Card className="overflow-hidden">
                <Table minWidth={760}>
                    <thead>
                        <tr>
                            <Th>Listing</Th>
                            <Th>Status</Th>
                            <Th align="right">Views</Th>
                            <Th align="right">Enquiries</Th>
                            <Th align="right">Saves</Th>
                            <Th align="right">Enquiry rate</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.map((listing) => {
                            const total = listing.series.reduce(
                                (sum, value) => sum + value,
                                0,
                            );

                            return (
                                <tr key={listing.id}>
                                    <Td>
                                        <CellText
                                            main={listing.label}
                                            sub={listing.sub}
                                            strong
                                        />
                                    </Td>
                                    <Td>
                                        <StatusBadge status={listing.status} />
                                    </Td>
                                    <Td align="right" className="font-semibold">
                                        {formatCount(total)}
                                    </Td>
                                    <Td align="right">{listing.leads}</Td>
                                    <Td align="right">
                                        {Math.round(total * savesRate)}
                                    </Td>
                                    <Td align="right">
                                        {total
                                            ? `${((listing.leads / total) * 100).toFixed(1)}%`
                                            : '—'}
                                    </Td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card>
            {children}
        </>
    );
}

/* ---------------------------------------------------------------- Billing */

export type Invoice = {
    number: string;
    daysAgo: number;
    description: string;
    amount: number;
    status: 'Paid' | 'Due';
};

export function InvoicesCard({
    invoices,
    formatAmount,
    onPay,
    onDownload,
}: {
    invoices: Invoice[];
    formatAmount: (amount: number) => string;
    onPay: (invoice: Invoice) => void;
    onDownload: (invoice: Invoice) => void;
}) {
    const due = invoices.filter((invoice) => invoice.status === 'Due');

    return (
        <Card className="overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-[18px] pb-3">
                <CardTitle className="flex-1">Invoices</CardTitle>
                <span className="text-[13px] text-portal-subtle">
                    {due.length
                        ? `${due.length} unpaid · ${formatAmount(due.reduce((sum, invoice) => sum + invoice.amount, 0))} due`
                        : 'All paid up'}
                </span>
            </div>
            <Table minWidth={720}>
                <thead>
                    <tr>
                        <Th>Invoice</Th>
                        <Th>Date</Th>
                        <Th>Description</Th>
                        <Th align="right">Amount (incl. VAT)</Th>
                        <Th>Status</Th>
                        <Th />
                    </tr>
                </thead>
                <tbody>
                    {[...invoices]
                        .sort((a, b) => a.daysAgo - b.daysAgo)
                        .map((invoice) => (
                            <tr key={invoice.number}>
                                <Td className="font-semibold whitespace-nowrap">
                                    {invoice.number}
                                </Td>
                                <Td className="whitespace-nowrap text-portal-muted">
                                    {niceDate(invoice.daysAgo)}
                                </Td>
                                <Td>{invoice.description}</Td>
                                <Td
                                    align="right"
                                    className="font-semibold whitespace-nowrap"
                                >
                                    {formatAmount(invoice.amount)}
                                </Td>
                                <Td>
                                    <StatusBadge
                                        status={invoice.status}
                                        toneOverrides={portalToneOverrides}
                                    />
                                </Td>
                                <Td align="right">
                                    {invoice.status === 'Due' ? (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={() => onPay(invoice)}
                                        >
                                            Pay now
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => onDownload(invoice)}
                                        >
                                            Download
                                        </Button>
                                    )}
                                </Td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </Card>
    );
}

export function PaymentMethodCard({
    kind,
    number,
    holder,
    detail,
    actionLabel,
    onUpdate,
}: {
    kind: string;
    number: string;
    holder: string;
    detail: string;
    actionLabel: string;
    onUpdate: () => void;
}) {
    return (
        <Card className="flex flex-col gap-3.5 p-[22px]">
            <CardTitle>Payment method</CardTitle>
            <div className="flex flex-col gap-[22px] rounded-[14px] bg-portal-ink p-[18px] text-white">
                <div className="flex justify-between text-[13px] font-semibold">
                    <span>{kind}</span>
                    <span className="opacity-70">Default</span>
                </div>
                <div className="text-lg font-semibold tracking-[.1em]">
                    {number}
                </div>
                <div className="flex justify-between text-xs uppercase opacity-80">
                    <span>{holder}</span>
                    <span>{detail}</span>
                </div>
            </div>
            <Button className="h-10" onClick={onUpdate}>
                {actionLabel}
            </Button>
        </Card>
    );
}

/* ------------------------------------------------------------ Compliance */

export function ChecksCard({
    title,
    checks,
    note,
}: {
    title: string;
    checks: { title: string; detail: string }[];
    note: string;
}) {
    return (
        <Card className="flex flex-col gap-3 p-[22px]">
            <CardTitle>{title}</CardTitle>
            {checks.map((check) => (
                <div
                    key={check.title}
                    className="flex items-center gap-3 rounded-xl bg-portal-success-bg p-3 text-portal-success"
                >
                    <Icon name="check" strokeWidth={2.4} />
                    <span className="flex flex-col gap-0.5">
                        <span className="font-bold">{check.title}</span>
                        <span className="text-xs">{check.detail}</span>
                    </span>
                </div>
            ))}
            <p className="mt-1 text-[13px] leading-normal text-portal-head">
                {note}
            </p>
        </Card>
    );
}

export function NotificationToggles({
    settings,
    values,
    onToggle,
}: {
    settings: { key: string; label: string; detail: string }[];
    values: Record<string, boolean>;
    onToggle: (key: string) => void;
}) {
    return (
        <>
            <CardTitle className="border-t border-portal-hair pt-[18px]">
                Notifications
            </CardTitle>
            {settings.map((setting) => (
                <div key={setting.key} className="flex items-center gap-3.5">
                    <span className="flex flex-1 flex-col gap-0.5">
                        <span className="font-semibold">{setting.label}</span>
                        <span className="text-[13px] text-portal-subtle">
                            {setting.detail}
                        </span>
                    </span>
                    <Toggle
                        checked={values[setting.key]}
                        label={setting.label}
                        onChange={() => onToggle(setting.key)}
                    />
                </div>
            ))}
        </>
    );
}

/* ------------------------------------------------------------------ Help */

export function HelpView({
    faqs,
    audience,
    email,
}: {
    faqs: [string, string][];
    audience: string;
    email: string;
}) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="grid items-start gap-4 min-[1180px]:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
            <Card className="px-[22px] py-2">
                {faqs.map(([question, answer], index) => {
                    const isOpen = openIndex === index;

                    return (
                        <div
                            key={question}
                            className="border-b border-portal-hair last:border-b-0"
                        >
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                onClick={() =>
                                    setOpenIndex(isOpen ? null : index)
                                }
                                className="flex w-full cursor-pointer items-center gap-3 py-4 text-left text-[15px] font-semibold text-portal-ink"
                            >
                                <span className="flex-1">{question}</span>
                                <Icon
                                    name="chevronDown"
                                    strokeWidth={2}
                                    className={cn(
                                        'text-portal-subtle transition-transform',
                                        isOpen && 'rotate-180',
                                    )}
                                />
                            </button>
                            {isOpen && (
                                <p className="mb-4 leading-[1.6] text-pretty text-portal-muted">
                                    {answer}
                                </p>
                            )}
                        </div>
                    );
                })}
            </Card>
            <Card className="flex flex-col gap-3.5 p-[22px]">
                <CardTitle>Talk to us</CardTitle>
                <p className="leading-normal text-portal-muted">
                    Our {audience} team is available Monday to Friday, 08:00 to
                    17:00.
                </p>
                <a
                    href="tel:+27102430243"
                    className={cn(buttonClass(), 'h-11')}
                >
                    <Icon name="phone" size={15} />
                    010 243 0243
                </a>
                <a
                    href={`mailto:${email}`}
                    className={cn(buttonClass(), 'h-11')}
                >
                    <Icon name="mail" size={15} />
                    {email}
                </a>
            </Card>
        </div>
    );
}
