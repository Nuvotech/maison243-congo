import * as Dialog from '@radix-ui/react-dialog';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AdminOverview from '@/components/portal/admin/overview';
import type { PlanCollection } from '@/components/portal/admin/plans-pricing';
import PlansPricing from '@/components/portal/admin/plans-pricing';
import type {
    ActionKey,
    AdminRecord,
    Cell,
} from '@/components/portal/admin/records';
import {
    actionsFor,
    columnsFor,
    drawerFor,
    findRecord,
    isAccountKind,
    matchesSearch,
    recordTitle,
    recordsOf,
    relativeOrDate,
    statusesFor,
} from '@/components/portal/admin/records';
import type { NavGroup } from '@/components/portal/portal-shell';
import PortalShell, { HeaderPerson } from '@/components/portal/portal-shell';
import {
    Button,
    Card,
    Field,
    Icon,
    PortalDialog,
    SearchInput,
    Segmented,
    SelectInput,
    StatusBadge,
    TextArea,
    TextInput,
    useFlash,
} from '@/components/portal/ui';
import { usePortalSection } from '@/hooks/use-portal-section';
import type {
    AccountKind,
    AdminData,
    AgencyPlanRecord,
    ListingPack,
    RecordKind,
} from '@/lib/admin-portal-data';
import {
    activeStatus,
    adminCities,
    pendingStatus,
    seedAdminData,
    singular,
} from '@/lib/admin-portal-data';
import { isValidEmail } from '@/lib/portal';
import { cn } from '@/lib/utils';
import {
    admin as adminRoute,
    agency as agencyRoute,
    seller as sellerRoute,
} from '@/routes/portals';

type Section = 'overview' | RecordKind | 'plans';

const titles: Record<Section, string> = {
    overview: 'Overview',
    listings: 'Listings',
    sellers: 'Private sellers',
    agents: 'Agents',
    agencies: 'Agencies',
    screenings: 'Tenant screenings',
    payments: 'Payments',
    plans: 'Plans & pricing',
};

const pluralLabel: Record<RecordKind, string> = {
    listings: 'listings',
    sellers: 'private sellers',
    agents: 'agents',
    agencies: 'agencies',
    screenings: 'screenings',
    payments: 'invoices',
};

const adminToneOverrides = {
    Archived: 'neutral',
    Cancelled: 'neutral',
    Refunded: 'neutral',
    Sold: 'neutral',
} as const;

type ConfirmDialog = {
    mode: 'confirm';
    title: string;
    body: string;
    confirmLabel: string;
    run: (reason: string) => void;
};
type AddDialog = { mode: 'add'; kind: AccountKind };
type PlanDialog = {
    mode: 'plan';
    collection: PlanCollection;
    item: AgencyPlanRecord | ListingPack | null;
};
type AdminDialog = ConfirmDialog | AddDialog | PlanDialog | null;

export default function AdminPortal({ section }: { section: Section }) {
    const goTo = usePortalSection<Section>((target) =>
        adminRoute.url(target === 'overview' ? undefined : target),
    );
    const { message, flash } = useFlash();
    const [data, setData] = useState<AdminData>(seedAdminData);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const [sort, setSort] = useState<{ key: string | null; direction: 1 | -1 }>(
        { key: null, direction: 1 },
    );
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [openRecord, setOpenRecord] = useState<{
        kind: RecordKind;
        id: string;
    } | null>(null);
    const [dialog, setDialog] = useState<AdminDialog>(null);
    const [reason, setReason] = useState('');
    const [form, setForm] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState('');

    const isTable = section !== 'overview' && section !== 'plans';

    const open = (target: Section, nextFilter = 'All'): void => {
        setFilter(nextFilter);
        setQuery('');
        setSelected({});
        setSort({ key: null, direction: 1 });
        setOpenRecord(null);
        goTo(target);
    };

    const updateRecords = (
        kind: RecordKind,
        ids: string[],
        status: string | null,
        note: string,
    ): void => {
        const targets = new Set(ids);
        setData((current) => ({
            ...current,
            [kind]: (current[kind] as AdminRecord[]).map((record) =>
                targets.has(record.id)
                    ? {
                          ...record,
                          status: status ?? record.status,
                          ...('updated' in record ? { updated: 0 } : {}),
                          log: [{ daysAgo: 0, text: note }, ...record.log],
                      }
                    : record,
            ),
        }));
    };

    const doAction = (
        kind: RecordKind,
        ids: string[],
        action: ActionKey,
    ): void => {
        const label =
            ids.length > 1
                ? `${ids.length} ${singular[kind]}s`
                : recordTitle(kind, findRecord(data, kind, ids[0])!);
        const apply =
            (status: string | null, note: string, toast: string) =>
            (given = '') => {
                updateRecords(
                    kind,
                    ids,
                    status,
                    note + (given ? ` — “${given}”` : ''),
                );
                flash(toast);
            };
        const confirm = (
            title: string,
            body: string,
            confirmLabel: string,
            run: (given: string) => void,
        ) => {
            setReason('');
            setDialog({ mode: 'confirm', title, body, confirmLabel, run });
        };
        const account = kind as AccountKind;

        switch (action) {
            case 'approve':
                apply('Live', 'Approved and published', `Published ${label}`)();
                break;
            case 'offer':
                apply(
                    'Under offer',
                    'Marked under offer',
                    'Marked under offer',
                )();
                break;
            case 'sold':
                apply('Sold', 'Marked sold', 'Marked sold')();
                break;
            case 'relive':
                apply('Live', 'Returned to live', 'Back to live')();
                break;
            case 'restore':
                apply(
                    'Pending review',
                    'Restored to review queue',
                    `Restored ${label}`,
                )();
                break;
            case 'reject':
                confirm(
                    `Remove ${label}?`,
                    'The listing comes off the site immediately. The lister can resubmit after editing.',
                    'Remove listing',
                    apply('Removed', 'Removed by admin', `Removed ${label}`),
                );
                break;
            case 'verify':
                apply(
                    activeStatus[account],
                    kind === 'agents'
                        ? 'FFC verified with PPRA'
                        : kind === 'sellers'
                          ? 'ID and proof of ownership verified'
                          : 'CIPC registration verified',
                    `Verified ${label}`,
                )();
                break;
            case 'reinstate':
                apply(
                    activeStatus[account],
                    'Account reinstated',
                    `Reinstated ${label}`,
                )();
                break;
            case 'cancel':
                confirm(
                    `Cancel ${label}?`,
                    'The applicant link stops working and nobody is charged.',
                    'Cancel screening',
                    apply(
                        'Cancelled',
                        'Cancelled by admin',
                        `Cancelled ${label}`,
                    ),
                );
                break;
            case 'resend':
                apply(null, 'Invite resent by admin', 'Invite resent')();
                break;
            case 'markpaid':
                apply(
                    'Paid',
                    'Marked paid by admin (EFT received)',
                    `Marked ${label} as paid`,
                )();
                break;
            case 'remind':
                apply(null, 'Payment reminder sent', 'Reminder sent')();
                break;
            case 'refund':
                confirm(
                    `Refund ${label}?`,
                    'The full amount goes back to the original payment method within 5 working days.',
                    'Refund payment',
                    apply('Refunded', 'Refunded by admin', `Refunded ${label}`),
                );
                break;
            case 'suspend':
                confirm(
                    `Suspend ${label}?`,
                    'They will be signed out and blocked from publishing. Existing listings stay hidden until the account is reinstated.',
                    'Suspend account',
                    apply(
                        'Suspended',
                        'Account suspended',
                        `Suspended ${label}`,
                    ),
                );
                break;
        }

        if (ids.length > 1) {
            setSelected({});
        }
    };

    const openPlanForm = (
        collection: PlanCollection,
        item: AgencyPlanRecord | ListingPack | null,
    ): void => {
        const blank: Record<string, string> =
            collection === 'plans'
                ? {
                      name: '',
                      price: '',
                      seats: '',
                      listings: '',
                      featured: '0',
                      analytics: 'Basic',
                  }
                : {
                      name: '',
                      deal: 'Sale',
                      price: '',
                      months: '6',
                      photos: '20',
                      max: '0',
                  };
        setForm(
            item
                ? Object.fromEntries(
                      Object.keys(blank).map((key) => [
                          key,
                          String(item[key as keyof typeof item]),
                      ]),
                  )
                : blank,
        );
        setFormError('');
        setDialog({ mode: 'plan', collection, item });
    };

    const pendingCount = (kind: AccountKind) =>
        data[kind].filter((account) => account.status === pendingStatus[kind])
            .length;

    const navGroups: NavGroup<Section>[] = [
        {
            label: 'Menu',
            items: [
                { id: 'overview', label: 'Overview', icon: 'grid' },
                {
                    id: 'listings',
                    label: 'Listings',
                    icon: 'home',
                    badge:
                        data.listings.filter(
                            (listing) => listing.status === 'Pending review',
                        ).length || undefined,
                },
                {
                    id: 'sellers',
                    label: 'Private sellers',
                    icon: 'user',
                    badge: pendingCount('sellers') || undefined,
                },
                {
                    id: 'agents',
                    label: 'Agents',
                    icon: 'briefcase',
                    badge: pendingCount('agents') || undefined,
                },
                {
                    id: 'agencies',
                    label: 'Agencies',
                    icon: 'building',
                    badge: pendingCount('agencies') || undefined,
                },
                {
                    id: 'screenings',
                    label: 'Tenant screenings',
                    icon: 'shield',
                },
                {
                    id: 'payments',
                    label: 'Payments',
                    icon: 'card',
                    badge:
                        data.payments.filter(
                            (payment) => payment.status === 'Overdue',
                        ).length || undefined,
                },
            ],
        },
        {
            label: 'Settings',
            items: [{ id: 'plans', label: 'Plans & pricing', icon: 'rand' }],
        },
    ];

    const drawerRecord = openRecord
        ? findRecord(data, openRecord.kind, openRecord.id)
        : undefined;

    return (
        <>
            <Head title={`${titles[section]} · Admin`} />
            <PortalShell
                groups={navGroups}
                active={section}
                onNavigate={(target) => open(target)}
                collapsible={false}
                showFooter={false}
                title={titles[section]}
                toast={message}
                headerActions={
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Plans & pricing"
                            onClick={() => open('plans')}
                            className="grid size-[38px] cursor-pointer place-items-center rounded-full border border-portal-line bg-white text-portal-ink hover:bg-portal-soft"
                        >
                            <Icon name="settings" size={17} />
                        </button>
                        <button
                            type="button"
                            aria-label="Listings awaiting review"
                            onClick={() => open('listings', 'Pending review')}
                            className="relative grid size-[38px] cursor-pointer place-items-center rounded-full border border-portal-line bg-white text-portal-ink hover:bg-portal-soft"
                        >
                            <Icon name="bell" size={17} />
                            <span className="absolute top-2 right-[9px] size-[7px] rounded-full border-[1.5px] border-white bg-portal-danger" />
                        </button>
                        <span className="mx-1 h-7 w-px bg-portal-line" />
                        <HeaderPerson role="Super admin" />
                    </div>
                }
            >
                {section === 'overview' && (
                    <AdminOverview
                        data={data}
                        openTable={(kind, nextFilter) => open(kind, nextFilter)}
                        openRecord={(kind, id) => setOpenRecord({ kind, id })}
                        approve={(id) => doAction('listings', [id], 'approve')}
                        reject={(id) => doAction('listings', [id], 'reject')}
                        verify={(kind, id) => doAction(kind, [id], 'verify')}
                    />
                )}

                {section === 'plans' && (
                    <PlansPricing
                        data={data}
                        onEdit={openPlanForm}
                        onToggle={(collection, item) => {
                            const status =
                                item.status === 'Active'
                                    ? 'Archived'
                                    : 'Active';
                            setData((current) => ({
                                ...current,
                                [collection]: (
                                    current[collection] as (
                                        | AgencyPlanRecord
                                        | ListingPack
                                    )[]
                                ).map((entry) =>
                                    entry.id === item.id
                                        ? { ...entry, status }
                                        : entry,
                                ),
                            }));
                            flash(
                                `${status === 'Archived' ? 'Archived' : 'Restored'} ${item.name}`,
                            );
                        }}
                        onFeeChange={(fee, value) =>
                            setData((current) => ({
                                ...current,
                                fees: { ...current.fees, [fee]: value },
                            }))
                        }
                    />
                )}

                {isTable && (
                    <RecordsTable
                        data={data}
                        kind={section}
                        query={query}
                        setQuery={(value) => {
                            setQuery(value);
                            setSelected({});
                        }}
                        filter={filter}
                        setFilter={(value) => {
                            setFilter(value);
                            setSelected({});
                        }}
                        sort={sort}
                        setSort={setSort}
                        selected={selected}
                        setSelected={setSelected}
                        openId={openRecord?.id ?? null}
                        onOpen={(id) => setOpenRecord({ kind: section, id })}
                        onAdd={
                            isAccountKind(section)
                                ? () => {
                                      setForm({
                                          city: adminCities[0],
                                          companyId: data.agencies[0].id,
                                      });
                                      setFormError('');
                                      setDialog({ mode: 'add', kind: section });
                                  }
                                : undefined
                        }
                        doAction={doAction}
                    />
                )}
            </PortalShell>

            <Dialog.Root
                open={openRecord !== null && drawerRecord !== undefined}
                onOpenChange={(isOpen) => !isOpen && setOpenRecord(null)}
            >
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-20 bg-portal-ink/28" />
                    {openRecord && drawerRecord && (
                        <RecordDrawer
                            data={data}
                            kind={openRecord.kind}
                            record={drawerRecord}
                            onOpen={(kind, id) => setOpenRecord({ kind, id })}
                            onAction={(action) =>
                                doAction(
                                    openRecord.kind,
                                    [drawerRecord.id],
                                    action,
                                )
                            }
                        />
                    )}
                </Dialog.Portal>
            </Dialog.Root>

            {dialog?.mode === 'confirm' && (
                <PortalDialog
                    open
                    width={460}
                    onClose={() => setDialog(null)}
                    title={dialog.title}
                    description={dialog.body}
                    confirmLabel={dialog.confirmLabel}
                    onConfirm={() => {
                        dialog.run(reason.trim());
                        setDialog(null);
                    }}
                >
                    <Field label="Reason (sent to the account holder)">
                        <TextArea
                            className="h-[88px]"
                            value={reason}
                            placeholder="e.g. Photos don't match the address"
                            onChange={(event) => setReason(event.target.value)}
                        />
                    </Field>
                </PortalDialog>
            )}

            {dialog?.mode === 'add' && (
                <AddAccountDialog
                    kind={dialog.kind}
                    data={data}
                    form={form}
                    setForm={(next) => {
                        setForm(next);
                        setFormError('');
                    }}
                    error={formError}
                    onClose={() => setDialog(null)}
                    onCreate={() => {
                        const kind = dialog.kind;

                        if (!(form.name ?? '').trim()) {
                            setFormError('Name is required.');

                            return;
                        }

                        if (!isValidEmail(form.email ?? '')) {
                            setFormError('Enter a valid email address.');

                            return;
                        }

                        const id =
                            kind[0].toUpperCase() +
                            String(data[kind].length + 1).padStart(2, '0');
                        const base = {
                            id,
                            name: form.name.trim(),
                            email: form.email.trim(),
                            phone: form.phone || '—',
                            city: form.city,
                            status: pendingStatus[kind],
                            joined: 0,
                            log: [
                                {
                                    daysAgo: 0,
                                    text: 'Created by admin · invitation sent',
                                },
                            ],
                        };

                        setData((current) => {
                            if (kind === 'agents') {
                                return {
                                    ...current,
                                    agents: [
                                        {
                                            ...base,
                                            companyId: form.companyId,
                                            ffc: 'Awaiting',
                                            role: 'Agent' as const,
                                        },
                                        ...current.agents,
                                    ],
                                };
                            }

                            if (kind === 'agencies') {
                                return {
                                    ...current,
                                    agencies: [
                                        {
                                            ...base,
                                            reg: form.reg || 'Awaiting',
                                            plan: 'Starter',
                                        },
                                        ...current.agencies,
                                    ],
                                };
                            }

                            return {
                                ...current,
                                sellers: [base, ...current.sellers],
                            };
                        });
                        setDialog(null);
                        setFilter('All');
                        setQuery('');
                        flash(`Invitation sent to ${base.email}`);
                    }}
                />
            )}

            {dialog?.mode === 'plan' && (
                <PlanFormDialog
                    dialog={dialog}
                    data={data}
                    form={form}
                    setForm={(next) => {
                        setForm(next);
                        setFormError('');
                    }}
                    error={formError}
                    onClose={() => setDialog(null)}
                    onSave={() => {
                        const { collection, item } = dialog;
                        const name = (form.name ?? '').trim();
                        const existing = data[collection] as (
                            | AgencyPlanRecord
                            | ListingPack
                        )[];

                        if (!name) {
                            setFormError('Name is required.');

                            return;
                        }

                        if (
                            existing.some(
                                (entry) =>
                                    entry.name.toLowerCase() ===
                                        name.toLowerCase() &&
                                    (!item || entry.id !== item.id),
                            )
                        ) {
                            setFormError('That name is already in use.');

                            return;
                        }

                        const numericKeys =
                            collection === 'plans'
                                ? ['price', 'seats', 'listings', 'featured']
                                : ['price', 'months', 'photos', 'max'];

                        if (
                            numericKeys.some(
                                (key) =>
                                    form[key] === '' ||
                                    form[key] === undefined ||
                                    isNaN(Number(form[key])) ||
                                    Number(form[key]) < 0,
                            )
                        ) {
                            setFormError(
                                'Enter a number of 0 or more for every numeric field.',
                            );

                            return;
                        }

                        if (collection === 'packs' && Number(form.months) < 1) {
                            setFormError(
                                'A listing plan must run for at least 1 month.',
                            );

                            return;
                        }

                        const record = {
                            ...(item ?? {
                                id:
                                    collection === 'plans'
                                        ? name
                                        : `PK${data.packs.length + 1}`,
                                status: 'Active',
                            }),
                            ...form,
                            name,
                            ...Object.fromEntries(
                                numericKeys.map((key) => [
                                    key,
                                    Number(form[key]),
                                ]),
                            ),
                        } as AgencyPlanRecord & ListingPack;

                        setData((current) => ({
                            ...current,
                            [collection]: item
                                ? (
                                      current[collection] as (
                                          | AgencyPlanRecord
                                          | ListingPack
                                      )[]
                                  ).map((entry) =>
                                      entry.id === item.id ? record : entry,
                                  )
                                : [...current[collection], record],
                            agencies:
                                collection === 'plans' &&
                                item &&
                                item.name !== name
                                    ? current.agencies.map((agency) =>
                                          agency.plan === item.name
                                              ? { ...agency, plan: name }
                                              : agency,
                                      )
                                    : current.agencies,
                        }));
                        setDialog(null);
                        flash(`${item ? 'Saved' : 'Created'} ${name}`);
                    }}
                />
            )}
        </>
    );
}

function CellContent({ cell }: { cell: Cell }) {
    return (
        <>
            {cell.text && (
                <div
                    className={cn(
                        'whitespace-nowrap',
                        cell.strong && 'font-semibold',
                    )}
                >
                    {cell.text}
                </div>
            )}
            {cell.sub && (
                <div className="mt-0.5 text-xs whitespace-nowrap text-portal-subtle">
                    {cell.sub}
                </div>
            )}
            {cell.tag && (
                <StatusBadge
                    status={cell.tag}
                    toneOverrides={adminToneOverrides}
                />
            )}
        </>
    );
}

function RecordsTable(props: {
    data: AdminData;
    kind: RecordKind;
    query: string;
    setQuery: (value: string) => void;
    filter: string;
    setFilter: (value: string) => void;
    sort: { key: string | null; direction: 1 | -1 };
    setSort: (sort: { key: string | null; direction: 1 | -1 }) => void;
    selected: Record<string, boolean>;
    setSelected: (selected: Record<string, boolean>) => void;
    openId: string | null;
    onOpen: (id: string) => void;
    onAdd?: () => void;
    doAction: (kind: RecordKind, ids: string[], action: ActionKey) => void;
}) {
    const { data, kind, sort, selected } = props;
    const columns = columnsFor(data, kind);
    const all = recordsOf(data, kind).filter((record) =>
        matchesSearch(data, kind, record, props.query),
    );
    let rows =
        props.filter === 'All'
            ? all
            : all.filter((record) => record.status === props.filter);

    if (sort.key) {
        const column = columns.find((item) => item.key === sort.key)!;
        rows = [...rows].sort((a, b) => {
            const first = column.value(a);
            const second = column.value(b);

            return (
                (first > second ? 1 : first < second ? -1 : 0) * sort.direction
            );
        });
    } else if (kind === 'listings') {
        rows = [...rows].sort((a, b) =>
            'updated' in a && 'updated' in b ? a.updated - b.updated : 0,
        );
    }

    const selectedRows = rows.filter((record) => selected[record.id]);
    const allSelected = rows.length > 0 && selectedRows.length === rows.length;
    const bulk = (
        label: string,
        action: ActionKey,
        applies: (record: AdminRecord) => boolean,
    ) => {
        const ids = selectedRows.filter(applies).map((record) => record.id);

        return ids.length
            ? {
                  label: `${label} ${ids.length}`,
                  run: () => props.doAction(kind, ids, action),
              }
            : null;
    };
    const bulkActions = (
        kind === 'listings'
            ? [
                  bulk(
                      'Approve',
                      'approve',
                      (record) => record.status === 'Pending review',
                  ),
                  bulk(
                      'Remove',
                      'reject',
                      (record) => record.status !== 'Removed',
                  ),
              ]
            : kind === 'screenings'
              ? [
                    bulk('Cancel', 'cancel', (record) =>
                        ['Invite sent', 'In progress'].includes(record.status),
                    ),
                ]
              : kind === 'payments'
                ? [
                      bulk('Mark paid', 'markpaid', (record) =>
                          ['Due', 'Overdue'].includes(record.status),
                      ),
                      bulk('Remind', 'remind', (record) =>
                          ['Due', 'Overdue'].includes(record.status),
                      ),
                  ]
                : [
                      bulk(
                          'Verify',
                          'verify',
                          (record) =>
                              record.status ===
                              pendingStatus[kind as AccountKind],
                      ),
                      bulk(
                          'Suspend',
                          'suspend',
                          (record) => record.status !== 'Suspended',
                      ),
                      bulk(
                          'Reinstate',
                          'reinstate',
                          (record) => record.status === 'Suspended',
                      ),
                  ]
    ).filter((item) => item !== null);

    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <Segmented
                    label="Filter by status"
                    value={props.filter}
                    onChange={props.setFilter}
                    options={['All', ...statusesFor(kind)].map((status) => ({
                        value: status,
                        label: status,
                        count:
                            status === 'All'
                                ? all.length
                                : all.filter(
                                      (record) => record.status === status,
                                  ).length,
                    }))}
                />
                <span className="flex-1" />
                <SearchInput
                    value={props.query}
                    onChange={props.setQuery}
                    placeholder={`Search ${pluralLabel[kind] === 'private sellers' ? 'sellers' : pluralLabel[kind]}…`}
                />
                {props.onAdd && (
                    <Button
                        variant="primary"
                        className="h-10"
                        onClick={props.onAdd}
                    >
                        <Icon name="plus" size={15} strokeWidth={2.2} />
                        Add {singular[kind]}
                    </Button>
                )}
            </div>
            <Card className="overflow-hidden">
                {selectedRows.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-portal-accent-line bg-portal-accent-tint px-4 py-2.5">
                        <span className="mr-1.5 text-[13px] font-bold text-portal-accent-text">
                            {selectedRows.length} selected
                        </span>
                        {bulkActions.map((action) => (
                            <Button
                                key={action.label}
                                size="sm"
                                onClick={action.run}
                            >
                                {action.label}
                            </Button>
                        ))}
                        <span className="flex-1" />
                        <Button
                            size="sm"
                            className="px-2.5"
                            onClick={() => props.setSelected({})}
                        >
                            <Icon name="close" size={14} strokeWidth={2.2} />
                            Clear
                        </Button>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] border-collapse text-sm">
                        <thead>
                            <tr className="bg-portal-thead">
                                <th className="w-11 border-b border-[#eef0f3] px-3.5 py-3.5 text-left">
                                    <input
                                        type="checkbox"
                                        aria-label="Select all"
                                        checked={allSelected}
                                        onChange={() =>
                                            props.setSelected(
                                                allSelected
                                                    ? {}
                                                    : Object.fromEntries(
                                                          rows.map((record) => [
                                                              record.id,
                                                              true,
                                                          ]),
                                                      ),
                                            )
                                        }
                                        className="size-4 cursor-pointer accent-portal-accent"
                                    />
                                </th>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        aria-sort={
                                            sort.key === column.key
                                                ? sort.direction > 0
                                                    ? 'ascending'
                                                    : 'descending'
                                                : undefined
                                        }
                                        className="border-b border-[#eef0f3] px-3.5 py-3.5 text-left whitespace-nowrap"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                props.setSort({
                                                    key: column.key,
                                                    direction:
                                                        sort.key === column.key
                                                            ? (-sort.direction as
                                                                  | 1
                                                                  | -1)
                                                            : 1,
                                                })
                                            }
                                            className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-portal-head"
                                        >
                                            {column.label}
                                            <span className="text-portal-accent">
                                                {sort.key === column.key
                                                    ? sort.direction > 0
                                                        ? '↑'
                                                        : '↓'
                                                    : ''}
                                            </span>
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((record) => (
                                <tr
                                    key={record.id}
                                    onClick={() => props.onOpen(record.id)}
                                    className={cn(
                                        'cursor-pointer hover:bg-portal-row-hover',
                                        selected[record.id]
                                            ? 'bg-[#f1f4ff]'
                                            : props.openId === record.id &&
                                                  'bg-[#f7f8fa]',
                                    )}
                                >
                                    <td
                                        className="border-b border-portal-hair px-3.5 py-3.5 align-middle"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            aria-label={`Select ${recordTitle(kind, record)}`}
                                            checked={!!selected[record.id]}
                                            onChange={() =>
                                                props.setSelected({
                                                    ...selected,
                                                    [record.id]:
                                                        !selected[record.id],
                                                })
                                            }
                                            className="size-4 cursor-pointer accent-portal-accent"
                                        />
                                    </td>
                                    {columns.map((column, index) => (
                                        <td
                                            key={column.key}
                                            className="border-b border-portal-hair px-3.5 py-3.5 align-middle"
                                        >
                                            {index === 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        props.onOpen(record.id);
                                                    }}
                                                    className="cursor-pointer text-left text-portal-ink"
                                                >
                                                    <CellContent
                                                        cell={column.cell(
                                                            record,
                                                        )}
                                                    />
                                                </button>
                                            ) : (
                                                <CellContent
                                                    cell={column.cell(record)}
                                                />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!rows.length && (
                    <p className="px-4 py-8 text-portal-subtle">
                        No results. Clear the search or pick another status.
                    </p>
                )}
                <div className="px-4 py-3 text-[13px] text-portal-subtle">
                    Showing {rows.length} of {recordsOf(data, kind).length}{' '}
                    {pluralLabel[kind]}
                </div>
            </Card>
        </>
    );
}

function RecordDrawer({
    data,
    kind,
    record,
    onOpen,
    onAction,
}: {
    data: AdminData;
    kind: RecordKind;
    record: AdminRecord;
    onOpen: (kind: RecordKind, id: string) => void;
    onAction: (action: ActionKey) => void;
}) {
    const content = drawerFor(data, kind, record, {
        seller: sellerRoute.url(),
        agency: agencyRoute.url(),
    });
    const actions = actionsFor(kind, record);

    return (
        <Dialog.Content className="fixed inset-y-0 right-0 z-21 flex w-[min(520px,100vw)] flex-col rounded-l-2xl bg-white font-jakarta text-sm text-portal-ink shadow-[-12px_0_40px_rgba(20,22,27,.14)]">
            <div className="flex items-start gap-3 border-b border-[#eef0f3] px-6 py-5">
                <div className="min-w-0 flex-1">
                    <div className="text-xs text-portal-subtle first-letter:uppercase">
                        {content.kicker}
                    </div>
                    <Dialog.Title className="mt-1.5 mb-2.5 text-[22px] font-bold tracking-[-0.02em] text-pretty">
                        {content.title}
                    </Dialog.Title>
                    <Dialog.Description className="sr-only">
                        Details, related records and activity for this{' '}
                        {singular[kind]}.
                    </Dialog.Description>
                    <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge
                            status={content.status}
                            toneOverrides={adminToneOverrides}
                        />
                        {content.portal && (
                            <a
                                href={content.portal.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[13px] font-semibold text-portal-accent hover:text-portal-accent-strong"
                            >
                                {content.portal.label}
                                <Icon
                                    name="external"
                                    size={13}
                                    strokeWidth={2.2}
                                />
                            </a>
                        )}
                    </div>
                </div>
                <Dialog.Close
                    aria-label="Close"
                    className="grid size-9 cursor-pointer place-items-center rounded-full border border-portal-line bg-white text-portal-ink hover:bg-portal-soft"
                >
                    <Icon name="close" size={16} strokeWidth={2.2} />
                </Dialog.Close>
            </div>
            <div className="flex flex-1 flex-col gap-[22px] overflow-y-auto px-6 py-5">
                {content.isListing && (
                    <div className="grid h-[220px] place-items-center rounded-xl bg-[#eef0f4] text-portal-subtle">
                        <Icon name="home" size={36} strokeWidth={1.4} />
                    </div>
                )}
                <dl className="grid grid-cols-2 gap-x-4">
                    {content.fields.map((field) => (
                        <div
                            key={field.label}
                            className="border-t border-portal-hair py-2.5"
                        >
                            <dt className="text-xs text-portal-subtle">
                                {field.label}
                            </dt>
                            <dd className="mt-0.5 font-semibold">
                                {field.value}
                            </dd>
                        </div>
                    ))}
                </dl>
                {content.related.map((group) => (
                    <section key={group.title} className="flex flex-col gap-2">
                        <h3 className="font-bold">{group.title}</h3>
                        {group.items.map((item) => (
                            <button
                                key={`${item.kind}-${item.id}`}
                                type="button"
                                onClick={() => onOpen(item.kind, item.id)}
                                className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] border border-portal-line bg-white px-3 py-2.5 text-left text-portal-ink hover:border-portal-accent-ring hover:bg-[#fafbff]"
                            >
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span className="font-semibold">
                                        {item.title}
                                    </span>
                                    <span className="text-xs text-portal-subtle">
                                        {item.sub}
                                    </span>
                                </span>
                                <StatusBadge
                                    status={item.status}
                                    toneOverrides={adminToneOverrides}
                                />
                            </button>
                        ))}
                        {!group.items.length && (
                            <p className="text-[13px] text-portal-subtle">
                                None yet.
                            </p>
                        )}
                    </section>
                ))}
                <section className="flex flex-col">
                    <h3 className="mb-2 font-bold">Activity</h3>
                    {content.log.map((entry, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-[96px_1fr] gap-3 border-t border-portal-hair py-[9px] text-[13px]"
                        >
                            <span className="text-portal-subtle">
                                {relativeOrDate(entry.daysAgo)}
                            </span>
                            <span>{entry.text}</span>
                        </div>
                    ))}
                </section>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[#eef0f3] px-6 py-4">
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant={action.primary ? 'primary' : 'secondary'}
                        className="h-10 min-w-[120px] justify-center px-[18px]"
                        onClick={() => onAction(action.action)}
                    >
                        {action.label}
                    </Button>
                ))}
                {!actions.length && (
                    <span className="text-[13px] text-portal-subtle">
                        No actions available for this status.
                    </span>
                )}
            </div>
        </Dialog.Content>
    );
}

function AddAccountDialog({
    kind,
    data,
    form,
    setForm,
    error,
    onClose,
    onCreate,
}: {
    kind: AccountKind;
    data: AdminData;
    form: Record<string, string>;
    setForm: (form: Record<string, string>) => void;
    error: string;
    onClose: () => void;
    onCreate: () => void;
}) {
    const text = (
        key: string,
        label: string,
        type: string,
        placeholder: string,
    ) => (
        <Field key={key} label={label}>
            <TextInput
                type={type}
                value={form[key] ?? ''}
                placeholder={placeholder}
                onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                }
            />
        </Field>
    );

    return (
        <PortalDialog
            open
            width={460}
            onClose={onClose}
            title={`Add ${singular[kind]}`}
            description={`The account is created as pending and receives an email to finish ${kind === 'agents' ? 'FFC' : kind === 'sellers' ? 'ID' : 'company'} verification.`}
            error={error}
            confirmLabel={`Create ${singular[kind]}`}
            onConfirm={onCreate}
        >
            <div className="flex flex-col gap-3">
                {text(
                    'name',
                    kind === 'agencies' ? 'Agency name' : 'Full name',
                    'text',
                    kind === 'agencies'
                        ? 'e.g. Karoo Country Realty'
                        : 'e.g. Ntombi Radebe',
                )}
                {text('email', 'Email', 'email', 'name@domain.co.za')}
                {text('phone', 'Phone', 'tel', '082 000 0000')}
                {kind === 'agents' && (
                    <Field label="Agency">
                        <SelectInput
                            value={form.companyId}
                            options={data.agencies.map((agency) => ({
                                value: agency.id,
                                label: agency.name,
                            }))}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    companyId: event.target.value,
                                })
                            }
                        />
                    </Field>
                )}
                {kind === 'agencies' &&
                    text(
                        'reg',
                        'CIPC registration no.',
                        'text',
                        '2026/123456/07',
                    )}
                <Field label={kind === 'agencies' ? 'Head office' : 'City'}>
                    <SelectInput
                        value={form.city}
                        options={adminCities}
                        onChange={(event) =>
                            setForm({ ...form, city: event.target.value })
                        }
                    />
                </Field>
            </div>
        </PortalDialog>
    );
}

function PlanFormDialog({
    dialog,
    data,
    form,
    setForm,
    error,
    onClose,
    onSave,
}: {
    dialog: PlanDialog;
    data: AdminData;
    form: Record<string, string>;
    setForm: (form: Record<string, string>) => void;
    error: string;
    onClose: () => void;
    onSave: () => void;
}) {
    const { collection, item } = dialog;
    const isPlans = collection === 'plans';
    const subscribers = item
        ? isPlans
            ? data.agencies.filter((agency) => agency.plan === item.name).length
            : data.listings.filter((listing) => listing.plan === item.id).length
        : 0;
    const text = (
        key: string,
        label: string,
        type: string,
        placeholder: string,
    ) => (
        <Field key={key} label={label}>
            <TextInput
                type={type}
                value={form[key] ?? ''}
                placeholder={placeholder}
                onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                }
            />
        </Field>
    );
    const select = (key: string, label: string, options: string[]) => (
        <Field key={key} label={label}>
            <SelectInput
                value={form[key] ?? ''}
                options={options}
                onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                }
            />
        </Field>
    );

    return (
        <PortalDialog
            open
            width={460}
            onClose={onClose}
            title={`${item ? 'Edit' : 'New'} ${isPlans ? 'agency plan' : 'seller listing plan'}`}
            description={
                item
                    ? `${subscribers} ${isPlans ? 'agencies' : 'listings'} currently on ${item.name}. A new price applies from their next ${isPlans ? 'renewal' : 'listing or renewal'}.`
                    : `New ${isPlans ? 'plans' : 'listing plans'} are live for sign-up as soon as you create them.`
            }
            error={error}
            confirmLabel={item ? 'Save changes' : 'Create'}
            onConfirm={onSave}
        >
            <div className="flex flex-col gap-3">
                {isPlans
                    ? [
                          text('name', 'Plan name', 'text', 'e.g. Growth'),
                          text(
                              'price',
                              'Monthly price, excl. VAT (R)',
                              'number',
                              '0',
                          ),
                          text(
                              'seats',
                              'Agent seats (0 = unlimited)',
                              'number',
                              '0',
                          ),
                          text(
                              'listings',
                              'Active listings (0 = unlimited)',
                              'number',
                              '0',
                          ),
                          text(
                              'featured',
                              'Featured credits per month',
                              'number',
                              '0',
                          ),
                          select('analytics', 'Analytics', [
                              'Basic',
                              'Full',
                              'Full + API',
                          ]),
                      ]
                    : [
                          text(
                              'name',
                              'Plan name',
                              'text',
                              'e.g. Rental Listing (Lite)',
                          ),
                          select('deal', 'Deal', ['Sale', 'Rent']),
                          text(
                              'price',
                              'Price per listing, incl. VAT (R)',
                              'number',
                              '0',
                          ),
                          text(
                              'months',
                              'Advertised for (months)',
                              'number',
                              '6',
                          ),
                          text('photos', 'Max photos', 'number', '20'),
                          text(
                              'max',
                              'Max asking price, R (0 = no limit)',
                              'number',
                              '0',
                          ),
                      ]}
            </div>
        </PortalDialog>
    );
}
