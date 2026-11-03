import type {
    AccountKind,
    AdminData,
    AdminListing,
    AdminPayment,
    AdminScreening,
    Agency,
    Agent,
    LogEntry,
    RecordKind,
    Seller,
} from '@/lib/admin-portal-data';
import {
    activeStatus,
    packNames,
    pendingStatus,
    provinceOf,
    singular,
} from '@/lib/admin-portal-data';
import { niceDate, relativeDays, zar, zarCents } from '@/lib/portal';

export type AdminRecord =
    | AdminListing
    | Seller
    | Agent
    | Agency
    | AdminScreening
    | AdminPayment;

export type ActionKey =
    | 'approve'
    | 'offer'
    | 'sold'
    | 'relive'
    | 'restore'
    | 'reject'
    | 'verify'
    | 'reinstate'
    | 'cancel'
    | 'resend'
    | 'markpaid'
    | 'remind'
    | 'refund'
    | 'suspend';

export type RecordAction = {
    label: string;
    action: ActionKey;
    primary?: boolean;
};

export type Cell = {
    text: string;
    sub?: string;
    tag?: string;
    strong?: boolean;
};

export type Column = {
    key: string;
    label: string;
    cell: (record: AdminRecord) => Cell;
    value: (record: AdminRecord) => string | number;
};

export const isAccountKind = (kind: RecordKind): kind is AccountKind =>
    ['sellers', 'agents', 'agencies'].includes(kind);

export const recordsOf = (data: AdminData, kind: RecordKind): AdminRecord[] =>
    data[kind];

/** Relative date that switches to a full date after a month. */
export const relativeOrDate = (days: number): string =>
    days < 30 ? relativeDays(days) : niceDate(days);

export const priceText = (listing: AdminListing): string =>
    zar(listing.price) + (listing.sale ? '' : ' pm');

export const listingTitle = (listing: AdminListing): string =>
    `${listing.beds ? `${listing.beds} bed ` : ''}${listing.type.toLowerCase()} in ${listing.suburb}`;

export function recordTitle(kind: RecordKind, record: AdminRecord): string {
    if (kind === 'listings') {
        return listingTitle(record as AdminListing);
    }

    if (kind === 'payments') {
        return `${record.id} · ${(record as AdminPayment).desc}`;
    }

    if (kind === 'screenings') {
        return `Screening for ${(record as AdminScreening).name}`;
    }

    return (record as Seller).name;
}

export const findRecord = (
    data: AdminData,
    kind: RecordKind,
    id: string,
): AdminRecord | undefined =>
    recordsOf(data, kind).find((record) => record.id === id);

export const listerOf = (
    data: AdminData,
    listing: AdminListing,
): Agent | Seller =>
    (listing.listerKind === 'agents' ? data.agents : data.sellers).find(
        (person) => person.id === listing.listerId,
    )!;

export const accountOf = (
    data: AdminData,
    payment: AdminPayment,
): Agency | Seller =>
    (payment.accKind === 'agencies' ? data.agencies : data.sellers).find(
        (account) => account.id === payment.accId,
    )!;

export const agencyOf = (data: AdminData, agent: Agent): Agency =>
    data.agencies.find((agency) => agency.id === agent.companyId)!;

export function listingsOf(
    data: AdminData,
    kind: AccountKind,
    id: string,
): AdminListing[] {
    if (kind === 'agencies') {
        const agentIds = new Set(
            data.agents
                .filter((agent) => agent.companyId === id)
                .map((agent) => agent.id),
        );

        return data.listings.filter(
            (listing) =>
                listing.listerKind === 'agents' &&
                agentIds.has(listing.listerId),
        );
    }

    return data.listings.filter(
        (listing) => listing.listerKind === kind && listing.listerId === id,
    );
}

export const lastChanged = (record: AdminRecord): number =>
    'updated' in record ? record.updated : record.joined;

export function statusesFor(kind: RecordKind): string[] {
    if (kind === 'screenings') {
        return ['Invite sent', 'In progress', 'Complete', 'Cancelled'];
    }

    if (kind === 'payments') {
        return ['Paid', 'Due', 'Overdue', 'Refunded'];
    }

    if (kind === 'listings') {
        return ['Pending review', 'Live', 'Under offer', 'Sold', 'Removed'];
    }

    return [activeStatus[kind], pendingStatus[kind], 'Suspended'];
}

export function matchesSearch(
    data: AdminData,
    kind: RecordKind,
    record: AdminRecord,
    query: string,
): boolean {
    const search = query.trim().toLowerCase();

    if (!search) {
        return true;
    }

    let haystack: string[];

    if (kind === 'listings') {
        const listing = record as AdminListing;
        haystack = [
            listingTitle(listing),
            listing.ref,
            listing.suburb,
            listing.city,
            listerOf(data, listing).name,
        ];
    } else if (kind === 'screenings') {
        const screening = record as AdminScreening;
        haystack = [
            screening.name,
            screening.email,
            data.listings.find((listing) => listing.id === screening.listingId)!
                .ref,
        ];
    } else if (kind === 'payments') {
        const payment = record as AdminPayment;
        haystack = [payment.id, payment.desc, accountOf(data, payment).name];
    } else {
        const account = record as Seller & Partial<Agent> & Partial<Agency>;
        haystack = [
            account.name,
            account.email,
            account.city,
            account.ffc ?? '',
            account.reg ?? '',
        ];
    }

    return haystack.join(' ').toLowerCase().includes(search);
}

export function actionsFor(
    kind: RecordKind,
    record: AdminRecord,
): RecordAction[] {
    const action = (
        label: string,
        key: ActionKey,
        primary = false,
    ): RecordAction => ({ label, action: key, primary });

    if (kind === 'listings') {
        const byStatus: Record<string, RecordAction[]> = {
            'Pending review': [
                action('Approve', 'approve', true),
                action('Reject', 'reject'),
            ],
            Live: [
                action('Mark under offer', 'offer'),
                action('Remove', 'reject'),
            ],
            'Under offer': [
                action('Mark sold', 'sold', true),
                action('Back to live', 'relive'),
                action('Remove', 'reject'),
            ],
            Sold: [action('Remove', 'reject')],
            Removed: [action('Restore to review', 'restore')],
        };

        return byStatus[record.status] ?? [];
    }

    if (kind === 'screenings') {
        return ['Invite sent', 'In progress'].includes(record.status)
            ? [action('Resend invite', 'resend'), action('Cancel', 'cancel')]
            : [];
    }

    if (kind === 'payments') {
        if (['Due', 'Overdue'].includes(record.status)) {
            return [
                action('Mark paid', 'markpaid', true),
                action('Send reminder', 'remind'),
            ];
        }

        return record.status === 'Paid' ? [action('Refund', 'refund')] : [];
    }

    if (record.status === pendingStatus[kind]) {
        return [action('Verify', 'verify', true), action('Suspend', 'suspend')];
    }

    return record.status === 'Suspended'
        ? [action('Reinstate', 'reinstate', true)]
        : [action('Suspend', 'suspend')];
}

export function columnsFor(data: AdminData, kind: RecordKind): Column[] {
    const cell = (
        text: string,
        sub?: string,
        tag?: string,
        strong = false,
    ): Cell => ({ text, sub, tag, strong });
    const status: Column = {
        key: 'status',
        label: 'Status',
        cell: (record) => cell('', undefined, record.status),
        value: (record) => record.status,
    };

    if (kind === 'listings') {
        const listing = (record: AdminRecord) => record as AdminListing;

        return [
            {
                key: 'title',
                label: 'Listing',
                cell: (record) =>
                    cell(
                        listingTitle(listing(record)),
                        listing(record).ref,
                        undefined,
                        true,
                    ),
                value: (record) => listingTitle(listing(record)),
            },
            {
                key: 'location',
                label: 'Location',
                cell: (record) =>
                    cell(
                        listing(record).suburb,
                        `${listing(record).city}, ${listing(record).province}`,
                    ),
                value: (record) =>
                    listing(record).city + listing(record).suburb,
            },
            {
                key: 'price',
                label: 'Price',
                cell: (record) =>
                    cell(
                        priceText(listing(record)),
                        listing(record).sale ? 'For sale' : 'To rent',
                        undefined,
                        true,
                    ),
                value: (record) =>
                    listing(record).sale
                        ? listing(record).price
                        : listing(record).price * 200,
            },
            {
                key: 'lister',
                label: 'Listed by',
                cell: (record) => {
                    const lister = listerOf(data, listing(record));

                    return cell(
                        lister.name,
                        listing(record).listerKind === 'agents'
                            ? `Agent · ${agencyOf(data, lister as Agent).name}`
                            : 'Private seller',
                    );
                },
                value: (record) => listerOf(data, listing(record)).name,
            },
            {
                key: 'plan',
                label: 'Plan / mandate',
                cell: (record) => {
                    const item = listing(record);

                    if (item.listerKind === 'sellers') {
                        return cell(
                            packNames[item.plan!],
                            'Private listing plan',
                        );
                    }

                    return cell(
                        `${item.mandate} mandate`,
                        `${item.mandDays! < 0 ? 'Expired ' : 'Until '}${niceDate(-item.mandDays!)}${item.featured ? ' · Featured' : ''}`,
                    );
                },
                value: (record) =>
                    listing(record).plan ?? listing(record).mandate ?? '',
            },
            status,
            {
                key: 'updated',
                label: 'Updated',
                cell: (record) => cell(relativeOrDate(listing(record).updated)),
                value: (record) => listing(record).updated,
            },
        ];
    }

    if (kind === 'screenings') {
        const screening = (record: AdminRecord) => record as AdminScreening;
        const listingFor = (record: AdminRecord) =>
            data.listings.find(
                (item) => item.id === screening(record).listingId,
            )!;

        return [
            {
                key: 'title',
                label: 'Applicant',
                cell: (record) =>
                    cell(
                        screening(record).name,
                        screening(record).email,
                        undefined,
                        true,
                    ),
                value: (record) => screening(record).name,
            },
            {
                key: 'listing',
                label: 'Property',
                cell: (record) =>
                    cell(
                        listingTitle(listingFor(record)),
                        `${listingFor(record).ref} · ${priceText(listingFor(record))}`,
                    ),
                value: (record) => screening(record).listingId,
            },
            {
                key: 'by',
                label: 'Requested by',
                cell: (record) => {
                    const lister = listerOf(data, listingFor(record));

                    return cell(
                        lister.name,
                        listingFor(record).listerKind === 'agents'
                            ? `Agent · ${agencyOf(data, lister as Agent).name}`
                            : 'Private seller',
                    );
                },
                value: (record) => listerOf(data, listingFor(record)).name,
            },
            status,
            {
                key: 'result',
                label: 'Result',
                cell: (record) =>
                    screening(record).result
                        ? cell('', undefined, screening(record).result)
                        : cell('—'),
                value: (record) => screening(record).result,
            },
            {
                key: 'updated',
                label: 'Updated',
                cell: (record) =>
                    cell(relativeOrDate(screening(record).updated)),
                value: (record) => screening(record).updated,
            },
        ];
    }

    if (kind === 'payments') {
        const payment = (record: AdminRecord) => record as AdminPayment;

        return [
            {
                key: 'title',
                label: 'Invoice',
                cell: (record) =>
                    cell(
                        record.id,
                        niceDate(payment(record).updated),
                        undefined,
                        true,
                    ),
                value: (record) => record.id,
            },
            {
                key: 'account',
                label: 'Account',
                cell: (record) => {
                    const account = accountOf(data, payment(record));

                    return cell(
                        account.name,
                        payment(record).accKind === 'agencies'
                            ? `Agency · ${(account as Agency).plan} plan`
                            : 'Private seller',
                    );
                },
                value: (record) => accountOf(data, payment(record)).name,
            },
            {
                key: 'desc',
                label: 'Description',
                cell: (record) => cell(payment(record).desc),
                value: (record) => payment(record).desc,
            },
            {
                key: 'amount',
                label: 'Amount (incl. VAT)',
                cell: (record) =>
                    cell(
                        zarCents(payment(record).amt),
                        undefined,
                        undefined,
                        true,
                    ),
                value: (record) => payment(record).amt,
            },
            status,
        ];
    }

    const account = (record: AdminRecord) =>
        record as Seller & Partial<Agent> & Partial<Agency>;
    const owned = (record: AdminRecord) => listingsOf(data, kind, record.id);
    const listingsColumn: Column = {
        key: 'listings',
        label: 'Listings',
        cell: (record) =>
            cell(
                String(owned(record).length),
                `${owned(record).filter((listing) => listing.status === 'Live').length} live`,
            ),
        value: (record) => owned(record).length,
    };
    const joined: Column = {
        key: 'joined',
        label: 'Joined',
        cell: (record) => cell(niceDate(account(record).joined)),
        value: (record) => account(record).joined,
    };
    const name: Column = {
        key: 'title',
        label: 'Name',
        cell: (record) =>
            cell(account(record).name, account(record).email, undefined, true),
        value: (record) => account(record).name,
    };

    if (kind === 'sellers') {
        return [
            name,
            {
                key: 'location',
                label: 'Location',
                cell: (record) =>
                    cell(
                        account(record).city,
                        provinceOf[account(record).city],
                    ),
                value: (record) => account(record).city,
            },
            {
                key: 'phone',
                label: 'Phone',
                cell: (record) => cell(account(record).phone),
                value: (record) => account(record).phone,
            },
            listingsColumn,
            status,
            joined,
        ];
    }

    if (kind === 'agents') {
        return [
            name,
            {
                key: 'agency',
                label: 'Agency',
                cell: (record) =>
                    cell(
                        agencyOf(data, record as Agent).name,
                        account(record).city,
                    ),
                value: (record) => agencyOf(data, record as Agent).name,
            },
            {
                key: 'ffc',
                label: 'FFC number',
                cell: (record) => cell(account(record).ffc ?? ''),
                value: (record) => account(record).ffc ?? '',
            },
            listingsColumn,
            status,
            joined,
        ];
    }

    const agentCount = (record: AdminRecord) =>
        data.agents.filter((agent) => agent.companyId === record.id).length;

    return [
        {
            key: 'title',
            label: 'Agency',
            cell: (record) =>
                cell(
                    account(record).name,
                    `Reg. ${account(record).reg}`,
                    undefined,
                    true,
                ),
            value: (record) => account(record).name,
        },
        {
            key: 'location',
            label: 'Head office',
            cell: (record) =>
                cell(account(record).city, provinceOf[account(record).city]),
            value: (record) => account(record).city,
        },
        {
            key: 'plan',
            label: 'Plan',
            cell: (record) => cell(account(record).plan ?? ''),
            value: (record) => account(record).plan ?? '',
        },
        {
            key: 'agents',
            label: 'Agents',
            cell: (record) => cell(String(agentCount(record))),
            value: agentCount,
        },
        listingsColumn,
        status,
    ];
}

/* ---------------------------------------------------------------- Drawer */

export type RelatedItem = {
    kind: RecordKind;
    id: string;
    title: string;
    sub: string;
    status: string;
};

export type DrawerContent = {
    kicker: string;
    title: string;
    status: string;
    isListing: boolean;
    fields: { label: string; value: string }[];
    related: { title: string; items: RelatedItem[] }[];
    log: LogEntry[];
    portal?: { label: string; href: string };
};

export function drawerFor(
    data: AdminData,
    kind: RecordKind,
    record: AdminRecord,
    portalLinks: { seller: string; agency: string },
): DrawerContent {
    const field = (label: string, value: string | number) => ({
        label,
        value: String(value),
    });
    const item = (itemKind: RecordKind, target: AdminRecord): RelatedItem => {
        let sub: string;

        if (itemKind === 'listings') {
            sub = `${priceText(target as AdminListing)} · ${(target as AdminListing).suburb}`;
        } else if (itemKind === 'agents') {
            sub = (target as Agent).email;
        } else if (itemKind === 'payments') {
            sub = `${zarCents((target as AdminPayment).amt)} · ${niceDate((target as AdminPayment).updated)}`;
        } else if (itemKind === 'screenings') {
            sub = `${(target as AdminScreening).email} · ${relativeOrDate((target as AdminScreening).updated)}`;
        } else {
            sub = (target as Seller).city;
        }

        return {
            kind: itemKind,
            id: target.id,
            title: recordTitle(itemKind, target),
            sub,
            status: target.status,
        };
    };
    const group = (
        title: string,
        itemKind: RecordKind,
        records: AdminRecord[],
    ) => ({
        title: `${title} (${records.length})`,
        items: records.map((target) => item(itemKind, target)),
    });
    const screeningsFor = (listings: AdminListing[]) => {
        const ids = new Set(listings.map((listing) => listing.id));

        return data.screenings.filter((screening) =>
            ids.has(screening.listingId),
        );
    };

    let fields: DrawerContent['fields'];
    let related: DrawerContent['related'];
    let base: LogEntry[];
    let portal: DrawerContent['portal'];

    if (kind === 'screenings') {
        const screening = record as AdminScreening;
        const listing = data.listings.find(
            (target) => target.id === screening.listingId,
        )!;
        const lister = listerOf(data, listing);
        const isRecommended = screening.result === 'Recommended';
        fields = [
            field('Applicant', screening.name),
            field('Email', screening.email),
            field('Status', screening.status),
            field('Result', screening.result || '—'),
            field(
                'Fee',
                `${zarCents(Number(data.fees.screening) || 0)} if completed`,
            ),
            field('Requested by', lister.name),
        ];

        if (screening.status === 'Complete') {
            fields.push(
                field(
                    'Credit score',
                    isRecommended ? 'Good (690+)' : 'Poor (under 580)',
                ),
                field(
                    'Affordability',
                    isRecommended
                        ? 'Rent under 30% of income'
                        : 'Rent over 40% of income',
                ),
            );
        }

        related = [
            group('Property', 'listings', [listing]),
            group('Requested by', listing.listerKind, [lister]),
        ];
        base = [
            {
                daysAgo: screening.updated + 1,
                text: `Invite sent to ${screening.email}`,
            },
        ];
    } else if (kind === 'payments') {
        const payment = record as AdminPayment;
        const account = accountOf(data, payment);
        fields = [
            field('Invoice', payment.id),
            field('Date', niceDate(payment.updated)),
            field('Description', payment.desc),
            field('Amount incl. VAT', zarCents(payment.amt)),
            field('VAT (15%)', zarCents(payment.amt - payment.amt / 1.15)),
            field(
                'Method',
                payment.accKind === 'agencies' ? 'Debit order' : 'Card',
            ),
            field('Status', payment.status),
            field('Account', account.name),
        ];
        related = [group('Account', payment.accKind, [account])];
        base = [{ daysAgo: payment.updated, text: 'Invoice issued' }];
    } else if (kind === 'listings') {
        const listing = record as AdminListing;
        const lister = listerOf(data, listing);
        fields = [
            field('Reference', listing.ref),
            field('Deal', listing.sale ? 'For sale' : 'To rent'),
            field('Price', priceText(listing)),
            field('Type', listing.type),
            field('Bedrooms', listing.beds || '—'),
            field('Bathrooms', listing.baths || '—'),
            field(
                listing.type === 'Vacant land' ? 'Erf size' : 'Floor size',
                `${listing.size} m²`,
            ),
            field('Suburb', listing.suburb),
            field('City', listing.city),
            field('Province', listing.province),
            ...(listing.listerKind === 'sellers'
                ? [field('Plan', packNames[listing.plan!])]
                : [
                      field('Mandate', listing.mandate!),
                      field(
                          'Mandate expires',
                          `${listing.mandDays! < 0 ? 'Expired ' : ''}${niceDate(-listing.mandDays!)}`,
                      ),
                      field(
                          'Featured',
                          listing.featured ? 'Yes · 7 days' : 'No',
                      ),
                  ]),
        ];
        related = [group('Listed by', listing.listerKind, [lister])];

        if (!listing.sale) {
            related.push(
                group(
                    'Tenant screenings',
                    'screenings',
                    screeningsFor([listing]),
                ),
            );
        }

        if (listing.listerKind === 'agents') {
            related.push(
                group('Agency', 'agencies', [agencyOf(data, lister as Agent)]),
            );
        }

        base = [
            {
                daysAgo: listing.updated + 2,
                text: `Submitted by ${lister.name}`,
            },
        ];
    } else {
        const account = record as Seller & Partial<Agent> & Partial<Agency>;
        const owned = listingsOf(data, kind as AccountKind, record.id);
        fields = [field('Email', account.email), field('Phone', account.phone)];

        if (kind === 'sellers') {
            fields.push(
                field(
                    'Location',
                    `${account.city}, ${provinceOf[account.city]}`,
                ),
                field(
                    'ID verification',
                    account.status === 'ID pending'
                        ? 'Documents uploaded'
                        : account.status === 'Verified'
                          ? 'Verified'
                          : '—',
                ),
            );
        }

        if (kind === 'agents') {
            const agent = record as Agent;
            fields.push(
                field('Agency', agencyOf(data, agent).name),
                field('Role', agent.role),
                field('Branch', agent.city),
                field('FFC number', agent.ffc),
                field('FFC valid until', '31 Dec 2026'),
            );
        }

        if (kind === 'agencies') {
            const agency = record as Agency;
            const plan = data.plans.find(
                (option) => option.name === agency.plan,
            );
            const limit = (value?: number) =>
                value ? ` / ${value}` : ' · unlimited';
            const seats = data.agents.filter(
                (agent) =>
                    agent.companyId === agency.id &&
                    agent.status !== 'Suspended',
            ).length;
            const active = owned.filter((listing) =>
                ['Live', 'Under offer', 'Pending review'].includes(
                    listing.status,
                ),
            ).length;
            fields.push(
                field('Registration', agency.reg),
                field(
                    'Head office',
                    `${agency.city}, ${provinceOf[agency.city]}`,
                ),
                field('Plan', agency.plan),
                field('Seats used', seats + limit(plan?.seats)),
                field('Active listings', active + limit(plan?.listings)),
                field(
                    'Featured live',
                    `${owned.filter((listing) => listing.featured).length} of ${plan?.featured ?? 0} credits`,
                ),
            );
        }

        fields.push(
            field('Joined', niceDate(account.joined)),
            field(
                'Listings',
                `${owned.length} (${owned.filter((listing) => listing.status === 'Live').length} live)`,
            ),
        );
        related = [];

        if (kind === 'agents') {
            related.push(
                group('Agency', 'agencies', [agencyOf(data, record as Agent)]),
            );
        }

        if (kind === 'agencies') {
            related.push(
                group(
                    'Agents',
                    'agents',
                    data.agents.filter(
                        (agent) => agent.companyId === record.id,
                    ),
                ),
            );
        }

        related.push(group('Listings', 'listings', owned));

        if (kind === 'sellers') {
            related.push(
                group('Tenant screenings', 'screenings', screeningsFor(owned)),
            );
        }

        if (kind !== 'agents') {
            related.push(
                group(
                    'Payments',
                    'payments',
                    data.payments.filter(
                        (payment) =>
                            payment.accKind === kind &&
                            payment.accId === record.id,
                    ),
                ),
            );
        }

        portal =
            kind === 'sellers'
                ? { label: 'Open seller portal', href: portalLinks.seller }
                : { label: 'Open agency portal', href: portalLinks.agency };
        base = [
            {
                daysAgo: account.joined,
                text:
                    kind === 'agencies'
                        ? 'Agency account created'
                        : 'Account created',
            },
        ];
    }

    return {
        kicker: `${singular[kind]} · ${record.id}`,
        title: recordTitle(kind, record),
        status: record.status,
        isListing: kind === 'listings',
        fields,
        related,
        log: [...record.log, ...base],
        portal,
    };
}
