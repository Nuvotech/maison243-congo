import { useState } from 'react';
import {
    listerOf,
    listingTitle,
    priceText,
    relativeOrDate,
} from '@/components/portal/admin/records';
import { Badge, Button, Card, CardTitle, Icon } from '@/components/portal/ui';
import type {
    AccountKind,
    AdminData,
    RecordKind,
} from '@/lib/admin-portal-data';
import { pendingStatus, sparkline } from '@/lib/admin-portal-data';
import { initials, smoothPath } from '@/lib/portal';
import { cn } from '@/lib/utils';

type OverviewProps = {
    data: AdminData;
    openTable: (kind: RecordKind, filter?: string) => void;
    openRecord: (kind: RecordKind, id: string) => void;
    approve: (id: string) => void;
    reject: (id: string) => void;
    verify: (kind: AccountKind, id: string) => void;
};

export default function AdminOverview({
    data,
    openTable,
    openRecord,
    approve,
    reject,
    verify,
}: OverviewProps) {
    const live = data.listings.filter((listing) => listing.status === 'Live');
    const pending = data.listings.filter(
        (listing) => listing.status === 'Pending review',
    );
    const pendingAgents = data.agents.filter(
        (agent) => agent.status === pendingStatus.agents,
    );
    const pendingSellers = data.sellers.filter(
        (seller) => seller.status === pendingStatus.sellers,
    );
    const pendingAgencies = data.agencies.filter(
        (agency) => agency.status === pendingStatus.agencies,
    );
    const suspended = (['sellers', 'agents', 'agencies'] as const).reduce(
        (count, kind) =>
            count +
            data[kind].filter((account) => account.status === 'Suspended')
                .length,
        0,
    );
    const firstPendingKind: AccountKind = pendingAgents.length
        ? 'agents'
        : pendingSellers.length
          ? 'sellers'
          : 'agencies';

    const stats = [
        {
            label: 'Live listings',
            value: live.length,
            sub: `${live.filter((listing) => listing.sale).length} for sale · ${live.filter((listing) => !listing.sale).length} to rent`,
            go: () => openTable('listings', 'Live'),
        },
        {
            label: 'Awaiting review',
            value: pending.length,
            sub: `Oldest ${relativeOrDate(Math.max(0, ...pending.map((listing) => listing.updated))).toLowerCase()}`,
            go: () => openTable('listings', 'Pending review'),
        },
        {
            label: 'Accounts to verify',
            value:
                pendingAgents.length +
                pendingSellers.length +
                pendingAgencies.length,
            sub: `${pendingAgents.length} agents · ${pendingSellers.length} sellers · ${pendingAgencies.length} agencies`,
            go: () =>
                openTable(firstPendingKind, pendingStatus[firstPendingKind]),
        },
        {
            label: 'Suspended accounts',
            value: suspended,
            sub: 'Across sellers, agents, agencies',
            go: () => openTable('agents', 'Suspended'),
        },
    ];

    const reviewQueue = [...pending]
        .sort((a, b) => b.updated - a.updated)
        .slice(0, 4);
    const verifyQueue = [
        ...pendingAgents.map((agent) => ({
            kind: 'agents' as const,
            account: agent,
            label: 'Agent',
            sub: `FFC ${agent.ffc} · ${data.agencies.find((agency) => agency.id === agent.companyId)!.name}`,
        })),
        ...pendingSellers.map((seller) => ({
            kind: 'sellers' as const,
            account: seller,
            label: 'Seller',
            sub: `ID documents uploaded · ${seller.city}`,
        })),
        ...pendingAgencies.map((agency) => ({
            kind: 'agencies' as const,
            account: agency,
            label: 'Agency',
            sub: `Reg. ${agency.reg} · ${agency.city}`,
        })),
    ];

    return (
        <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                {stats.map((stat, index) => {
                    const spark = sparkline(7 + index * 13);
                    const isRed = index % 2 === 1;

                    return (
                        <button
                            key={stat.label}
                            type="button"
                            onClick={stat.go}
                            className="flex cursor-pointer flex-col gap-3 rounded-[14px] border border-portal-line bg-white p-[18px] text-left hover:border-portal-accent-ring hover:shadow-[0_6px_18px_rgba(20,22,27,.06)]"
                        >
                            <span className="text-[13px] font-semibold text-portal-body">
                                {stat.label}
                            </span>
                            <span className="flex w-full items-end gap-3">
                                <span className="flex-1 text-[28px] leading-none font-bold tracking-[-0.02em]">
                                    {stat.value}
                                </span>
                                <svg
                                    width="110"
                                    height="44"
                                    viewBox="0 0 120 44"
                                    className="flex-none overflow-visible"
                                    aria-hidden="true"
                                >
                                    <path
                                        d={spark.area}
                                        fill={
                                            isRed
                                                ? 'rgba(229,72,77,.1)'
                                                : 'rgba(31,157,85,.1)'
                                        }
                                    />
                                    <path
                                        d={spark.line}
                                        fill="none"
                                        stroke={isRed ? '#e5484d' : '#1f9d55'}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                            <span className="text-xs text-portal-subtle">
                                {stat.sub}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-4 min-[1180px]:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
                <ActivityChart activity={data.activity} />
                <ListingMix data={data} />
            </div>

            <div className="grid items-start gap-4 min-[1180px]:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
                <Card className="flex min-w-0 flex-col gap-4 p-5">
                    <div className="flex items-center gap-3">
                        <CardTitle className="flex-1">
                            Awaiting review
                        </CardTitle>
                        <Button
                            onClick={() =>
                                openTable('listings', 'Pending review')
                            }
                        >
                            View all
                        </Button>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3.5">
                        {reviewQueue.map((listing) => {
                            const lister = listerOf(data, listing);

                            return (
                                <div
                                    key={listing.id}
                                    className="flex flex-col gap-2.5 rounded-xl border border-portal-line p-2.5"
                                >
                                    <div className="relative grid h-[140px] place-items-center overflow-hidden rounded-[9px] bg-[#eef0f4] text-portal-subtle">
                                        <Icon
                                            name="home"
                                            size={28}
                                            strokeWidth={1.5}
                                        />
                                        <Badge
                                            tone="white"
                                            className="absolute top-2 left-2"
                                        >
                                            {listing.sale
                                                ? 'For sale'
                                                : 'To rent'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-start gap-2 px-0.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openRecord(
                                                    'listings',
                                                    listing.id,
                                                )
                                            }
                                            className="min-w-0 flex-1 cursor-pointer text-left text-sm font-bold text-portal-ink hover:text-portal-accent"
                                        >
                                            {listingTitle(listing)}
                                        </button>
                                        <span className="text-[13px] font-bold whitespace-nowrap text-portal-accent">
                                            {priceText(listing)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-0.5 text-xs text-portal-muted">
                                        <Icon name="pin" size={14} />
                                        <span className="flex-1">
                                            {listing.suburb}, {listing.city}
                                        </span>
                                        <span className="text-portal-subtle">
                                            {relativeOrDate(listing.updated)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(
                                            [
                                                [
                                                    'bed',
                                                    listing.beds || '—',
                                                    'Bedrooms',
                                                ],
                                                [
                                                    'bath',
                                                    listing.baths || '—',
                                                    'Bathrooms',
                                                ],
                                                [
                                                    'area',
                                                    `${listing.size} m²`,
                                                    'Size',
                                                ],
                                            ] as const
                                        ).map(([icon, value, label]) => (
                                            <span
                                                key={icon}
                                                title={label}
                                                className="flex items-center gap-[5px] rounded-full border border-portal-line px-[9px] py-1 text-xs"
                                            >
                                                <Icon name={icon} size={14} />
                                                {value}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="px-0.5 text-xs text-portal-subtle">
                                        Listed by{' '}
                                        {listing.listerKind === 'agents'
                                            ? lister.name
                                            : `private seller ${lister.name}`}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            className="h-[34px] flex-1 justify-center"
                                            onClick={() => reject(listing.id)}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="h-[34px] flex-1 justify-center"
                                            onClick={() => approve(listing.id)}
                                        >
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {!reviewQueue.length && (
                        <p className="text-portal-subtle">Queue is clear.</p>
                    )}
                </Card>

                <Card className="flex min-w-0 flex-col gap-3 p-5">
                    <CardTitle className="mb-1">Accounts to verify</CardTitle>
                    {verifyQueue.map(({ kind, account, label, sub }) => (
                        <div
                            key={account.id}
                            className="flex items-center gap-3 rounded-xl border border-portal-line p-2.5"
                        >
                            <span className="grid size-10 flex-none place-items-center rounded-[10px] bg-portal-accent-tint text-[13px] font-bold text-portal-accent-text">
                                {initials(account.name)}
                            </span>
                            <button
                                type="button"
                                onClick={() => openRecord(kind, account.id)}
                                className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5 text-left text-portal-ink"
                            >
                                <span className="text-sm font-semibold">
                                    {account.name}
                                </span>
                                <span className="max-w-full truncate text-xs text-portal-subtle">
                                    {sub}
                                </span>
                            </button>
                            <Badge tone="neutral">{label}</Badge>
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => verify(kind, account.id)}
                            >
                                Verify
                            </Button>
                        </div>
                    ))}
                    {!verifyQueue.length && (
                        <p className="text-portal-subtle">Nobody waiting.</p>
                    )}
                </Card>
            </div>
        </>
    );
}

function ActivityChart({ activity }: { activity: AdminData['activity'] }) {
    const [hover, setHover] = useState<number | null>(null);
    const count = activity.length;
    const max =
        Math.ceil(
            Math.max(
                ...activity.map((week) => Math.max(week.sale, week.rent)),
            ) / 10,
        ) *
            10 +
        10;
    const width = 600;
    const height = 200;
    const x = (index: number) => ((index + 0.5) * width) / count;
    const y = (value: number) => height - (value / max) * height;
    const sale = smoothPath(
        activity.map((week, index) => [x(index), y(week.sale)]),
    );
    const rent = smoothPath(
        activity.map((week, index) => [x(index), y(week.rent)]),
    );
    const hovered = hover === null ? null : activity[hover];

    return (
        <Card className="flex min-w-0 flex-col gap-[18px] p-5">
            <div className="flex flex-wrap items-center gap-3.5">
                <CardTitle className="flex-1">Listing activity</CardTitle>
                <span className="flex items-center gap-1.5 text-xs text-portal-muted">
                    <span className="size-2 rounded-[2px] bg-portal-accent" />
                    For sale
                </span>
                <span className="flex items-center gap-1.5 text-xs text-portal-muted">
                    <span className="size-2 rounded-[2px] bg-portal-danger" />
                    To rent
                </span>
                <span className="rounded-lg border border-portal-line px-2.5 py-1.5 text-xs font-semibold text-portal-body">
                    Last 12 weeks
                </span>
            </div>
            <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-2">
                <div
                    className="-mt-[7px] flex h-[234px] flex-col justify-between text-[11px] leading-[14px] text-portal-subtle"
                    aria-hidden="true"
                >
                    {[4, 3, 2, 1, 0].map((step) => (
                        <span key={step}>{Math.round((max * step) / 4)}</span>
                    ))}
                </div>
                <div
                    className="relative h-[220px]"
                    onMouseLeave={() => setHover(null)}
                    role="img"
                    aria-label="New listings per week for the last 12 weeks, for sale and to rent"
                >
                    {['0', '25%', '50%', '75%'].map((top) => (
                        <div
                            key={top}
                            className="absolute inset-x-0 border-t border-dashed border-[#e9ecf1]"
                            style={{ top }}
                        />
                    ))}
                    <div className="absolute inset-x-0 bottom-0 border-t border-[#e9ecf1]" />
                    <div className="absolute inset-0 flex">
                        {activity.map((week, index) => (
                            <div
                                key={week.label}
                                onMouseEnter={() => setHover(index)}
                                className={cn(
                                    'flex-1 rounded-md',
                                    hover === index && 'bg-portal-accent/7',
                                )}
                            />
                        ))}
                    </div>
                    <svg
                        viewBox="0 0 600 200"
                        preserveAspectRatio="none"
                        className="pointer-events-none absolute inset-0 size-full overflow-visible"
                    >
                        <path
                            d={`${sale} L${x(count - 1)} ${height} L${x(0)} ${height} Z`}
                            fill="rgba(67,97,238,.09)"
                        />
                        <path
                            d={sale}
                            fill="none"
                            stroke="#4361ee"
                            strokeWidth="2.5"
                            vectorEffect="non-scaling-stroke"
                        />
                        <path
                            d={rent}
                            fill="none"
                            stroke="#e5484d"
                            strokeWidth="2.5"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                    {hovered && hover !== null && (
                        <>
                            {(
                                [
                                    ['sale', hovered.sale, 'bg-portal-accent'],
                                    ['rent', hovered.rent, 'bg-portal-danger'],
                                ] as const
                            ).map(([key, value, color]) => (
                                <span
                                    key={key}
                                    className={cn(
                                        'pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,.2)]',
                                        color,
                                    )}
                                    style={{
                                        left: `${((hover + 0.5) / count) * 100}%`,
                                        top: `${(y(value) / height) * 100}%`,
                                    }}
                                />
                            ))}
                            <div
                                className="pointer-events-none absolute top-[28%] flex flex-col gap-[5px] rounded-[10px] bg-white px-3 py-2.5 text-xs whitespace-nowrap shadow-[0_8px_24px_rgba(20,22,27,.14)]"
                                style={{
                                    left: `${((hover + 0.5) / count) * 100}%`,
                                    transform: `translateX(${hover >= count / 2 ? 'calc(-100% - 14px)' : '14px'})`,
                                }}
                            >
                                <span className="text-portal-subtle">
                                    Week of {hovered.label}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="size-[7px] rounded-full bg-portal-accent" />
                                    For sale
                                    <strong className="ml-auto pl-3">
                                        {hovered.sale}
                                    </strong>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="size-[7px] rounded-full bg-portal-danger" />
                                    To rent
                                    <strong className="ml-auto pl-3">
                                        {hovered.rent}
                                    </strong>
                                </span>
                            </div>
                        </>
                    )}
                </div>
                <div />
                <div className="flex" aria-hidden="true">
                    {activity.map((week, index) => (
                        <span
                            key={week.label}
                            className={cn(
                                'min-w-0 flex-1 overflow-hidden text-center text-[11px] whitespace-nowrap',
                                hover === index
                                    ? 'font-bold text-portal-accent'
                                    : 'font-medium text-portal-subtle',
                            )}
                        >
                            {week.label}
                        </span>
                    ))}
                </div>
            </div>
        </Card>
    );
}

function ListingMix({ data }: { data: AdminData }) {
    const segments = (
        [
            ['Live', '#4361ee'],
            ['Under offer', '#e5484d'],
            ['Pending review', '#d9defa'],
        ] as const
    ).map(([status, color]) => ({
        status,
        color,
        count: data.listings.filter((listing) => listing.status === status)
            .length,
    }));
    const total =
        segments.reduce((sum, segment) => sum + segment.count, 0) || 1;
    const arcLength = Math.PI * 90;
    const gap = 30;
    let offset = 0;
    const arcs = segments.map((segment) => {
        const share = (segment.count / total) * arcLength;
        const arc = {
            ...segment,
            dash: `${Math.max(0.01, share - gap)} ${arcLength * 2}`,
            offset: -(offset + gap / 2),
        };
        offset += share;

        return arc;
    });

    return (
        <Card className="flex min-w-0 flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
                <CardTitle className="flex-1">Listing mix</CardTitle>
                <span className="rounded-lg border border-portal-line px-2.5 py-1.5 text-xs font-semibold text-portal-body">
                    Active listings
                </span>
            </div>
            <div className="relative mx-auto mt-1.5 w-60 max-w-full">
                <svg
                    viewBox="0 0 220 124"
                    width="100%"
                    className="block overflow-visible"
                    aria-hidden="true"
                >
                    {arcs.map((arc) => (
                        <path
                            key={arc.status}
                            d="M 20 110 A 90 90 0 0 1 200 110"
                            fill="none"
                            stroke={arc.color}
                            strokeWidth="22"
                            strokeLinecap="round"
                            strokeDasharray={arc.dash}
                            strokeDashoffset={arc.offset}
                        />
                    ))}
                </svg>
                <div className="absolute inset-x-0 bottom-1.5 flex flex-col items-center gap-0.5">
                    <span className="text-xs text-portal-subtle">
                        Live share
                    </span>
                    <span className="text-[30px] leading-[1.1] font-bold tracking-[-0.02em]">
                        {Math.round((segments[0].count / total) * 100)}%
                    </span>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {segments.map((segment) => (
                    <span
                        key={segment.status}
                        className="flex items-center gap-1.5 text-[13px]"
                    >
                        <span
                            className="size-[9px] rounded-[2px]"
                            style={{ background: segment.color }}
                        />
                        {segment.status}
                        <strong>{segment.count}</strong>
                    </span>
                ))}
            </div>
            <div className="mt-auto border-t border-portal-hair pt-3.5 text-center text-[13px] text-portal-head">
                <strong className="text-portal-ink">
                    {
                        data.listings.filter(
                            (listing) => listing.status === 'Sold',
                        ).length
                    }
                </strong>{' '}
                listings sold this quarter
            </div>
        </Card>
    );
}
