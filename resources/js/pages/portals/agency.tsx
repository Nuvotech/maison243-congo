import { Head } from '@inertiajs/react';
import { useState } from 'react';
import type { ListingFields } from '@/components/portal/listing-form';
import {
    FormSection,
    ListingFormFooter,
    ListingFormSections,
    baseListingErrors,
    listingValues,
    minimumDescriptionLength,
    propertyTypes,
} from '@/components/portal/listing-form';
import type { NavGroup } from '@/components/portal/portal-shell';
import PortalShell, { HeaderPerson } from '@/components/portal/portal-shell';
import type {
    LeadView,
    PerformanceListing,
    ScreeningView,
} from '@/components/portal/shared-views';
import {
    ChecksCard,
    HelpView,
    InvoicesCard,
    LeadsView,
    NotificationToggles,
    PaymentMethodCard,
    PerformanceView,
    RequestScreeningDialog,
    ScreeningReportDialog,
    ScreeningsView,
    portalToneOverrides,
    viewSeries,
} from '@/components/portal/shared-views';
import type { PortalAction } from '@/components/portal/ui';
import {
    ActionButtons,
    Avatar,
    Badge,
    Button,
    Card,
    CardTitle,
    CellText,
    ChoiceCard,
    Field,
    Icon,
    Pagination,
    PortalDialog,
    SearchInput,
    Segmented,
    SelectInput,
    StatusBadge,
    Table,
    Td,
    TextArea,
    TextInput,
    Th,
    paginate,
    useFlash,
} from '@/components/portal/ui';
import { usePortalSection } from '@/hooks/use-portal-section';
import type {
    AgencyListing,
    AgencyPlanId,
    AgencyPortalData,
    TeamMember,
} from '@/lib/agency-portal-data';
import {
    activeStatuses,
    agencyFaqs,
    agencyPlans,
    firstReplyTimes,
    seedAgencyPortal,
} from '@/lib/agency-portal-data';
import {
    daysUntil,
    formatCount,
    formatIsoDate,
    initials,
    isValidEmail,
    isoInDays,
    niceDate,
    shortDate,
    zar,
    zarInclVat,
} from '@/lib/portal';
import { cn } from '@/lib/utils';
import { agency as agencyRoute } from '@/routes/portals';

type Section =
    | 'listings'
    | 'leads'
    | 'screenings'
    | 'performance'
    | 'team'
    | 'agency'
    | 'profile'
    | 'billing'
    | 'help';
type Role = 'principal' | 'agent';

type AgencyForm = ListingFields & {
    agentId: string;
    mandate: 'Sole' | 'Open';
    mandateExpires: string;
};

const blankForm = (agentId: string): AgencyForm => ({
    deal: 'Sale',
    type: 'House',
    agentId,
    mandate: 'Sole',
    mandateExpires: isoInDays(90),
    street: '',
    unit: '',
    suburb: '',
    city: 'Pretoria',
    price: '',
    beds: '3',
    baths: '2',
    size: '',
    desc: '',
});

const titles: Record<Section, string> = {
    listings: 'Listings',
    leads: 'Leads',
    screenings: 'Tenant screenings',
    performance: 'Performance',
    team: 'Team',
    agency: 'Agency profile',
    profile: 'My profile',
    billing: 'Plan & billing',
    help: 'Help',
};

const crumbs: Record<Section, string> = {
    listings: 'Work',
    leads: 'Work',
    screenings: 'Work',
    performance: 'Work',
    team: 'Agency',
    agency: 'Agency',
    billing: 'Agency',
    profile: 'Account',
    help: 'Support',
};

const statusGroups: Record<string, AgencyListing['status'][] | null> = {
    All: null,
    Live: ['Live'],
    'In review': ['Pending review'],
    Drafts: ['Draft'],
    'Under offer': ['Under offer'],
    Expired: ['Expired'],
    Closed: ['Sold', 'Let', 'Withdrawn'],
};

const addressOf = (listing: AgencyListing): string =>
    (listing.unit ? `${listing.unit}, ` : '') + listing.street;
const shortOf = (listing: AgencyListing): string =>
    listing.street + (listing.unit ? ` (${listing.unit.split(',')[0]})` : '');
const priceOf = (listing: AgencyListing): string =>
    zar(listing.price) + (listing.deal === 'Rent' ? ' pm' : '');

type Dialog =
    | { mode: 'plan' }
    | { mode: 'invite' }
    | { mode: 'screen' }
    | { mode: 'report'; id: string }
    | null;

export default function AgencyPortal({
    section,
    role,
}: {
    section: Section;
    role: Role;
}) {
    const isPrincipal = role === 'principal';
    const meId = isPrincipal ? 'A1' : 'A2';
    const goTo = usePortalSection<Section>((target) =>
        agencyRoute.url(
            target === 'listings' ? undefined : target,
            isPrincipal ? undefined : { query: { role: 'agent' } },
        ),
    );
    const { message, flash } = useFlash(2800);
    const [data, setData] = useState<AgencyPortalData>(seedAgencyPortal);
    const [plan, setPlan] = useState<AgencyPlanId>('Pro');
    const [creditsUsed, setCreditsUsed] = useState(3);

    const [tab, setTab] = useState<'current' | 'form'>('current');
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<AgencyForm>(() => blankForm(meId));
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [agentFilter, setAgentFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [dialog, setDialog] = useState<Dialog>(null);
    const [dialogError, setDialogError] = useState('');
    const [planChoice, setPlanChoice] = useState<AgencyPlanId>('Pro');
    const [invite, setInvite] = useState({
        name: '',
        email: '',
        ffc: '',
        role: 'Agent',
    });

    const [profileEdits, setProfileEdits] = useState<Record<string, string>>(
        {},
    );
    const [about, setAbout] = useState<string | null>(null);
    const [profileError, setProfileError] = useState('');
    const [notifications, setNotifications] = useState<Record<string, boolean>>(
        { leads: true, wa: true, weekly: true },
    );

    const currentPlan = agencyPlans.find((option) => option.id === plan)!;
    const member = (id: string): TeamMember =>
        data.team.find((person) => person.id === id)!;
    const findListing = (id: string): AgencyListing =>
        data.listings.find((item) => item.id === id)!;
    const me = member(meId);
    const mine = isPrincipal
        ? data.listings
        : data.listings.filter((item) => item.agentId === meId);
    const myIds = new Set(mine.map((item) => item.id));
    const myLeads = data.leads.filter(
        (lead) => isPrincipal || lead.agentId === meId,
    );
    const activeCount = data.listings.filter((item) =>
        activeStatuses.includes(item.status),
    ).length;
    const hasQuota =
        !currentPlan.listings || activeCount < currentPlan.listings;
    const seatsUsed = data.team.filter(
        (person) => person.status !== 'Deactivated',
    ).length;
    const hasFreeSeat = !currentPlan.seats || seatsUsed < currentPlan.seats;
    const dueInvoices = data.invoices.filter(
        (invoice) => invoice.status === 'Due',
    ).length;

    const agentOptions = data.team
        .filter(
            (person) =>
                ['Active', 'FFC pending'].includes(person.status) &&
                person.role !== 'Admin',
        )
        .map((person) => ({
            value: person.id,
            label:
                person.name +
                (person.status === 'FFC pending' ? ' (FFC pending)' : ''),
        }));

    const updateListing = (
        id: string,
        patch: Partial<AgencyListing>,
        toast?: string,
    ): void => {
        setData((current) => ({
            ...current,
            listings: current.listings.map((item) =>
                item.id === id
                    ? { ...item, ...patch, modifiedDaysAgo: 0 }
                    : item,
            ),
        }));

        if (toast) {
            flash(toast);
        }
    };

    const updateMember = (
        id: string,
        patch: Partial<TeamMember>,
        toast: string,
    ): void => {
        setData((current) => ({
            ...current,
            team: current.team.map((person) =>
                person.id === id ? { ...person, ...patch } : person,
            ),
        }));
        flash(toast);
    };

    const openForm = (id: string | null): void => {
        const existing = id ? findListing(id) : null;
        setForm(
            existing
                ? {
                      deal: existing.deal,
                      type: existing.type,
                      agentId: existing.agentId,
                      mandate: existing.mandate,
                      mandateExpires: existing.mandateExpires,
                      street: existing.street,
                      unit: existing.unit,
                      suburb: existing.suburb,
                      city: existing.city,
                      price: String(existing.price),
                      beds: String(existing.beds),
                      baths: String(existing.baths),
                      size: String(existing.size),
                      desc: existing.desc,
                  }
                : blankForm(meId),
        );
        setEditId(id);
        setFormErrors([]);
        setTab('form');

        if (section !== 'listings') {
            goTo('listings');
        }
    };

    const closeForm = (): void => {
        setTab('current');
        setEditId(null);
        setFormErrors([]);
    };

    const submitListing = (id: string): void => {
        const listing = findListing(id);
        const agent = member(listing.agentId);

        if (agent.status !== 'Active') {
            flash(
                `${agent.name.split(' ')[0]}'s FFC is still being checked. Keep it as a draft for now.`,
            );
        } else if (!hasQuota) {
            flash(
                'Listing quota reached. Upgrade your plan or close a listing first.',
            );
        } else if (daysUntil(listing.mandateExpires) < 1) {
            openForm(id);
        } else {
            updateListing(
                id,
                { status: 'Pending review', listedDaysAgo: null },
                'Submitted for review',
            );
        }
    };

    const featureListing = (listing: AgencyListing): void => {
        if (creditsUsed >= currentPlan.credits) {
            flash(
                currentPlan.credits
                    ? 'No featured credits left this month.'
                    : 'Your plan has no featured credits.',
            );

            return;
        }

        setCreditsUsed(creditsUsed + 1);
        updateListing(
            listing.id,
            { featured: true },
            `Featured for 7 days · ${currentPlan.credits - creditsUsed - 1} credits left`,
        );
    };

    const saveForm = (submit: boolean): void => {
        const errors = baseListingErrors(form);
        const agent = data.team.find((person) => person.id === form.agentId);

        if (submit) {
            if (!form.mandateExpires || daysUntil(form.mandateExpires) < 1) {
                errors.push('The mandate expiry date must be in the future.');
            }

            if (form.desc.trim().length < minimumDescriptionLength) {
                errors.push(
                    `Write a description of at least ${minimumDescriptionLength} characters.`,
                );
            }

            if (agent && agent.status !== 'Active') {
                errors.push(
                    `${agent.name}'s FFC is still being checked with the PPRA. Save as a draft for now.`,
                );
            }

            const editing = editId ? findListing(editId) : null;

            if (
                !(editing && activeStatuses.includes(editing.status)) &&
                !hasQuota
            ) {
                errors.push("Your plan's listing quota is full.");
            }
        }

        if (errors.length) {
            setFormErrors(errors);

            return;
        }

        const values = {
            ...listingValues(form),
            agentId: form.agentId || meId,
            mandate: form.mandate,
            mandateExpires: form.mandateExpires,
        };

        if (editId) {
            updateListing(
                editId,
                submit
                    ? {
                          ...values,
                          status: 'Pending review',
                          listedDaysAgo: null,
                      }
                    : values,
                submit ? 'Submitted for review' : 'Changes saved',
            );
        } else {
            const id = String(
                117406000 +
                    data.listings.length * 113 +
                    Math.floor(Math.random() * 90),
            );
            const created: AgencyListing = {
                id,
                ...values,
                status: submit ? 'Pending review' : 'Draft',
                modifiedDaysAgo: 0,
                featured: false,
                listedDaysAgo: null,
            };
            setData((current) => ({
                ...current,
                listings: [created, ...current.listings],
            }));
            flash(
                submit
                    ? `Listing ${id} submitted for review`
                    : `Saved as draft ${id}`,
            );
        }

        closeForm();
        setForm(blankForm(meId));
        setPage(1);
        setQuery('');
        setStatusFilter('All');
    };

    const rowActions = (listing: AgencyListing): PortalAction[] => {
        const edit: PortalAction = {
            label: 'Edit',
            run: () => openForm(listing.id),
        };

        switch (listing.status) {
            case 'Draft':
                return [
                    {
                        label: 'Submit',
                        primary: true,
                        run: () => submitListing(listing.id),
                    },
                    edit,
                ];
            case 'Expired':
                return [
                    {
                        label: 'Renew',
                        primary: true,
                        run: () => openForm(listing.id),
                    },
                ];
            case 'Live':
                return [
                    edit,
                    ...(listing.featured
                        ? []
                        : [
                              {
                                  label: 'Feature',
                                  run: () => featureListing(listing),
                              },
                          ]),
                    listing.deal === 'Sale'
                        ? {
                              label: 'Under offer',
                              run: () =>
                                  updateListing(
                                      listing.id,
                                      {
                                          status: 'Under offer',
                                          featured: false,
                                      },
                                      'Marked under offer',
                                  ),
                          }
                        : {
                              label: 'Mark let',
                              run: () =>
                                  updateListing(
                                      listing.id,
                                      { status: 'Let', featured: false },
                                      'Marked as let',
                                  ),
                          },
                    {
                        label: 'Withdraw',
                        run: () =>
                            updateListing(
                                listing.id,
                                { status: 'Withdrawn', featured: false },
                                'Listing withdrawn',
                            ),
                    },
                ];
            case 'Under offer':
                return [
                    {
                        label: 'Mark sold',
                        primary: true,
                        run: () =>
                            updateListing(
                                listing.id,
                                { status: 'Sold' },
                                'Marked as sold',
                            ),
                    },
                    {
                        label: 'Back to live',
                        run: () =>
                            updateListing(
                                listing.id,
                                { status: 'Live' },
                                'Back to live',
                            ),
                    },
                ];
            case 'Pending review':
                return [edit];
            default:
                return [
                    {
                        label: 'Relist',
                        primary: true,
                        run: () =>
                            updateListing(
                                listing.id,
                                {
                                    status: 'Draft',
                                    mandateExpires: isoInDays(90),
                                },
                                'Moved to drafts',
                            ),
                    },
                ];
        }
    };

    const seriesOf = (listing: AgencyListing): number[] =>
        viewSeries({
            id: listing.id,
            listedDaysAgo: listing.listedDaysAgo,
            modifiedDaysAgo: listing.modifiedDaysAgo,
            isOn: ['Live', 'Under offer'].includes(listing.status),
            base:
                listing.deal === 'Rent'
                    ? 48
                    : listing.type === 'House'
                      ? 30
                      : 12,
            boostRecent: (day) => (listing.featured && day < 7 ? 1.8 : 1),
        });

    const navGroups: NavGroup<Section>[] = [
        {
            label: 'Work',
            items: [
                { id: 'listings', label: 'Listings', icon: 'home' },
                {
                    id: 'leads',
                    label: 'Leads',
                    icon: 'inbox',
                    badge:
                        myLeads.filter((lead) => lead.status === 'New')
                            .length || undefined,
                },
                {
                    id: 'screenings',
                    label: 'Tenant screenings',
                    icon: 'shield',
                },
                { id: 'performance', label: 'Performance', icon: 'chart' },
            ],
        },
        isPrincipal
            ? {
                  label: 'Agency',
                  items: [
                      { id: 'team', label: 'Team', icon: 'team' },
                      {
                          id: 'agency',
                          label: 'Agency profile',
                          icon: 'building',
                      },
                      {
                          id: 'billing',
                          label: 'Plan & billing',
                          icon: 'card',
                          badge: dueInvoices || undefined,
                      },
                  ],
              }
            : {
                  label: 'Account',
                  items: [{ id: 'profile', label: 'My profile', icon: 'user' }],
              },
        {
            label: 'Support',
            items: [{ id: 'help', label: 'Help', icon: 'help' }],
        },
    ];

    const isForm = section === 'listings' && tab === 'form';
    const title = isForm
        ? editId
            ? `Edit listing ${editId}`
            : 'New listing'
        : titles[section];

    const leadViews: LeadView[] = myLeads.map((lead) => {
        const listing = findListing(lead.propertyId);

        return {
            ...lead,
            propertyShort:
                shortOf(listing) +
                (isPrincipal
                    ? ` · ${member(lead.agentId).name.split(' ')[0]}`
                    : ''),
            propertyAddress: addressOf(listing),
            propertySub: `${listing.suburb} · ${listing.type} · ${listing.deal === 'Rent' ? 'To rent' : 'For sale'}`,
            price: priceOf(listing),
        };
    });

    const screeningViews: ScreeningView[] = data.screenings
        .filter((screening) => myIds.has(screening.propertyId))
        .map((screening) => {
            const listing = findListing(screening.propertyId);

            return {
                ...screening,
                propertyShort: shortOf(listing),
                propertySub: `${listing.suburb} · ${priceOf(listing)}`,
            };
        });

    const reportScreening =
        dialog?.mode === 'report'
            ? (screeningViews.find((screening) => screening.id === dialog.id) ??
              null)
            : null;
    const myRentals = mine.filter((item) => item.deal === 'Rent');

    return (
        <>
            <Head title={`${title} · Agency portal`} />
            <PortalShell
                groups={navGroups}
                active={section}
                onNavigate={(target) => {
                    if (target === 'listings') {
                        closeForm();
                    }

                    setDialog(null);
                    goTo(target);
                }}
                brandTagline="for agents"
                crumb={crumbs[section]}
                title={title}
                toast={message}
                headerActions={
                    <>
                        <div className="hidden items-center gap-2.5 rounded-[10px] border border-portal-line py-1.5 pr-3 pl-1.5 min-[1100px]:flex">
                            <span className="grid size-[30px] place-items-center rounded-lg bg-[#7a3fbf] text-xs font-extrabold text-white">
                                JE
                            </span>
                            <span className="flex flex-col leading-[1.2]">
                                <span className="text-[13px] font-bold">
                                    Jacaranda Estates
                                </span>
                                <span className="text-[11px] text-portal-subtle">
                                    {plan} plan · {seatsUsed} members
                                </span>
                            </span>
                        </div>
                        <HeaderPerson
                            role={
                                isPrincipal
                                    ? 'Principal'
                                    : `Agent · FFC ${me.ffc}`
                            }
                            onProfile={() =>
                                goTo(isPrincipal ? 'agency' : 'profile')
                            }
                        />
                    </>
                }
            >
                {section === 'listings' && (
                    <>
                        <div className="flex flex-wrap items-center gap-3">
                            <Segmented
                                label="Listings"
                                value={isForm ? 'form' : 'current'}
                                onChange={(value) =>
                                    value === 'current'
                                        ? closeForm()
                                        : !isForm && openForm(null)
                                }
                                options={[
                                    {
                                        value: 'current',
                                        label: isPrincipal
                                            ? 'All listings'
                                            : 'My listings',
                                        count: mine.length,
                                    },
                                    {
                                        value: 'form',
                                        label: editId
                                            ? 'Edit listing'
                                            : 'New listing',
                                    },
                                ]}
                            />
                            <span className="flex-1" />
                            {!isForm && (
                                <span className="text-[13px] text-portal-muted">
                                    {currentPlan.listings
                                        ? `${activeCount} of ${currentPlan.listings} active listings`
                                        : 'Unlimited listings'}
                                    {' · '}
                                    {currentPlan.credits
                                        ? `${Math.max(0, currentPlan.credits - creditsUsed)} featured credits left`
                                        : 'no featured credits'}
                                </span>
                            )}
                        </div>
                        {isForm ? (
                            <ListingForm
                                form={form}
                                setForm={(next) => {
                                    setForm(next);
                                    setFormErrors([]);
                                }}
                                errors={formErrors}
                                isPrincipal={isPrincipal}
                                agentOptions={agentOptions}
                                editing={editId ? findListing(editId) : null}
                                quotaNote={
                                    currentPlan.listings
                                        ? `Uses 1 of your ${currentPlan.listings} active listings (${activeCount} in use)`
                                        : 'Included in your plan'
                                }
                                onCancel={closeForm}
                                onSave={saveForm}
                            />
                        ) : (
                            <ListingsTable
                                listings={mine}
                                team={data.team}
                                isPrincipal={isPrincipal}
                                statusFilter={statusFilter}
                                setStatusFilter={(value) => {
                                    setStatusFilter(value);
                                    setPage(1);
                                }}
                                agentFilter={agentFilter}
                                setAgentFilter={(value) => {
                                    setAgentFilter(value);
                                    setPage(1);
                                }}
                                query={query}
                                setQuery={(value) => {
                                    setQuery(value);
                                    setPage(1);
                                }}
                                page={page}
                                setPage={setPage}
                                pageSize={pageSize}
                                setPageSize={(size) => {
                                    setPageSize(size);
                                    setPage(1);
                                }}
                                rowActions={rowActions}
                                openForm={openForm}
                            />
                        )}
                    </>
                )}

                {section === 'leads' && (
                    <LeadsView
                        leads={leadViews}
                        onOpenProperty={openForm}
                        onStatusChange={(id, status, toast) => {
                            setData((current) => ({
                                ...current,
                                leads: current.leads.map((lead) =>
                                    lead.id === id ? { ...lead, status } : lead,
                                ),
                            }));
                            flash(toast);
                        }}
                        assign={
                            isPrincipal
                                ? {
                                      options: agentOptions,
                                      onAssign: (leadId, agentId) => {
                                          setData((current) => ({
                                              ...current,
                                              leads: current.leads.map(
                                                  (lead) =>
                                                      lead.id === leadId
                                                          ? { ...lead, agentId }
                                                          : lead,
                                              ),
                                          }));
                                          flash(
                                              `Lead assigned to ${member(agentId).name}`,
                                          );
                                      },
                                  }
                                : undefined
                        }
                    />
                )}

                {section === 'screenings' && (
                    <ScreeningsView
                        screenings={screeningViews}
                        onRequest={() => setDialog({ mode: 'screen' })}
                        onViewReport={(id) => setDialog({ mode: 'report', id })}
                        onNudge={(screening) =>
                            flash(
                                `${screening.status === 'Invite sent' ? 'Invite resent to ' : 'Reminder sent to '}${screening.email}`,
                            )
                        }
                    />
                )}

                {section === 'performance' && (
                    <PerformanceView
                        allLabel={
                            isPrincipal
                                ? 'All agency listings'
                                : 'All my listings'
                        }
                        savesRate={0.05}
                        viewsChange="+14% on the previous 30 days"
                        listings={mine
                            .filter((item) => item.listedDaysAgo !== null)
                            .map((item): PerformanceListing => ({
                                id: item.id,
                                label: shortOf(item),
                                sub:
                                    (isPrincipal
                                        ? `${member(item.agentId).name} · `
                                        : '') + priceOf(item),
                                status: item.status,
                                series: seriesOf(item),
                                leads: data.leads.filter(
                                    (lead) =>
                                        lead.propertyId === item.id &&
                                        lead.daysAgo < 30,
                                ).length,
                                newLeads: data.leads.filter(
                                    (lead) =>
                                        lead.propertyId === item.id &&
                                        lead.status === 'New',
                                ).length,
                            }))}
                    >
                        {isPrincipal && (
                            <Leaderboard data={data} seriesOf={seriesOf} />
                        )}
                    </PerformanceView>
                )}

                {section === 'team' && (
                    <>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex max-w-[420px] min-w-[240px] flex-1 flex-col gap-1.5">
                                <span className="text-[13px] font-semibold text-portal-body">
                                    {currentPlan.seats
                                        ? `${seatsUsed} of ${currentPlan.seats} seats used`
                                        : `${seatsUsed} seats · unlimited on ${plan}`}
                                </span>
                                <div className="h-2 overflow-hidden rounded bg-portal-line">
                                    <div
                                        className="h-full rounded bg-portal-accent"
                                        style={{
                                            width: currentPlan.seats
                                                ? `${Math.min(100, (seatsUsed / currentPlan.seats) * 100)}%`
                                                : '20%',
                                        }}
                                    />
                                </div>
                            </div>
                            <span className="flex-1" />
                            <Button
                                variant="primary"
                                className="h-10"
                                onClick={() => {
                                    if (!hasFreeSeat) {
                                        flash(
                                            `All ${currentPlan.seats} seats are in use. Upgrade or deactivate someone first.`,
                                        );

                                        return;
                                    }

                                    setInvite({
                                        name: '',
                                        email: '',
                                        ffc: '',
                                        role: 'Agent',
                                    });
                                    setDialogError('');
                                    setDialog({ mode: 'invite' });
                                }}
                            >
                                <Icon name="plus" size={15} strokeWidth={2.2} />
                                Invite agent
                            </Button>
                        </div>
                        <Card className="overflow-hidden">
                            <Table minWidth={960}>
                                <thead>
                                    <tr>
                                        <Th>Name</Th>
                                        <Th>Role</Th>
                                        <Th>FFC number</Th>
                                        <Th align="right">Active listings</Th>
                                        <Th align="right">Leads (30 days)</Th>
                                        <Th>Status</Th>
                                        <Th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.team.map((person) => {
                                        const owned = data.listings.filter(
                                            (item) =>
                                                item.agentId === person.id,
                                        );
                                        let actions: PortalAction[] = [];

                                        if (person.role !== 'Principal') {
                                            if (person.status === 'Invited') {
                                                actions = [
                                                    {
                                                        label: 'Resend',
                                                        run: () =>
                                                            flash(
                                                                `Invite resent to ${person.email}`,
                                                            ),
                                                    },
                                                    {
                                                        label: 'Cancel invite',
                                                        run: () => {
                                                            setData(
                                                                (current) => ({
                                                                    ...current,
                                                                    team: current.team.filter(
                                                                        (
                                                                            item,
                                                                        ) =>
                                                                            item.id !==
                                                                            person.id,
                                                                    ),
                                                                }),
                                                            );
                                                            flash(
                                                                'Invite cancelled',
                                                            );
                                                        },
                                                    },
                                                ];
                                            } else if (
                                                person.status === 'Deactivated'
                                            ) {
                                                actions = [
                                                    {
                                                        label: 'Reactivate',
                                                        run: () =>
                                                            hasFreeSeat
                                                                ? updateMember(
                                                                      person.id,
                                                                      {
                                                                          status: 'Active',
                                                                      },
                                                                      `${person.name} reactivated`,
                                                                  )
                                                                : flash(
                                                                      'No free seats. Upgrade your plan first.',
                                                                  ),
                                                    },
                                                ];
                                            } else {
                                                actions = [
                                                    {
                                                        label: 'Deactivate',
                                                        run: () =>
                                                            updateMember(
                                                                person.id,
                                                                {
                                                                    status: 'Deactivated',
                                                                },
                                                                `${person.name} deactivated · seat freed`,
                                                            ),
                                                    },
                                                ];
                                            }
                                        }

                                        return (
                                            <tr
                                                key={person.id}
                                                className={cn(
                                                    person.status ===
                                                        'Deactivated' &&
                                                        'opacity-60',
                                                )}
                                            >
                                                <Td>
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar
                                                            initials={initials(
                                                                person.name,
                                                            )}
                                                            size="sm"
                                                        />
                                                        <CellText
                                                            main={person.name}
                                                            sub={person.email}
                                                            strong
                                                        />
                                                    </div>
                                                </Td>
                                                <Td>{person.role}</Td>
                                                <Td>
                                                    <CellText
                                                        main={person.ffc || '—'}
                                                        sub={
                                                            person.status ===
                                                            'FFC pending'
                                                                ? 'Checking with PPRA'
                                                                : person.ffc
                                                                  ? `Valid until 31 Dec ${person.ffc.slice(0, 4)}`
                                                                  : person.role ===
                                                                      'Admin'
                                                                    ? 'Not required'
                                                                    : ''
                                                        }
                                                    />
                                                </Td>
                                                <Td align="right">
                                                    {
                                                        owned.filter((item) =>
                                                            activeStatuses.includes(
                                                                item.status,
                                                            ),
                                                        ).length
                                                    }
                                                </Td>
                                                <Td align="right">
                                                    {
                                                        data.leads.filter(
                                                            (lead) =>
                                                                lead.agentId ===
                                                                    person.id &&
                                                                lead.daysAgo <
                                                                    30,
                                                        ).length
                                                    }
                                                </Td>
                                                <Td>
                                                    <StatusBadge
                                                        status={person.status}
                                                    />
                                                </Td>
                                                <Td>
                                                    <ActionButtons
                                                        actions={actions}
                                                        className="flex-nowrap justify-end"
                                                    />
                                                </Td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card>
                    </>
                )}

                {(section === 'agency' || section === 'profile') && (
                    <ProfileSection
                        isAgency={section === 'agency'}
                        me={me}
                        edits={profileEdits}
                        setEdits={(next) => {
                            setProfileEdits(next);
                            setProfileError('');
                        }}
                        about={about}
                        setAbout={setAbout}
                        error={profileError}
                        notifications={notifications}
                        toggleNotification={(key) =>
                            setNotifications({
                                ...notifications,
                                [key]: !notifications[key],
                            })
                        }
                        onSave={(values) => {
                            if (!isValidEmail(values.email)) {
                                setProfileError('Enter a valid email address.');
                            } else if (
                                section === 'agency' &&
                                !values.name.trim()
                            ) {
                                setProfileError('Trading name is required.');
                            } else {
                                flash(
                                    section === 'agency'
                                        ? 'Agency profile saved'
                                        : 'Profile saved',
                                );
                            }
                        }}
                    />
                )}

                {section === 'billing' && (
                    <>
                        <div className="grid items-start gap-4 min-[1180px]:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
                            <Card className="flex flex-col gap-[18px] p-[22px]">
                                <div className="flex flex-wrap items-start gap-3">
                                    <div className="min-w-[200px] flex-1">
                                        <div className="text-[13px] text-portal-subtle">
                                            Current plan
                                        </div>
                                        <div className="mt-1 flex items-baseline gap-2.5">
                                            <span className="text-[26px] font-bold tracking-[-0.02em]">
                                                {plan}
                                            </span>
                                            <span className="text-[15px] font-semibold">
                                                {zar(currentPlan.price)}
                                            </span>
                                            <span className="text-[13px] text-portal-subtle">
                                                / month excl. VAT
                                            </span>
                                        </div>
                                        <div className="mt-1 text-[13px] text-portal-muted">
                                            Renews 1 Nov 2026 · debit order
                                        </div>
                                    </div>
                                    <Button
                                        variant="primary"
                                        className="h-10"
                                        onClick={() => {
                                            setPlanChoice(plan);
                                            setDialogError('');
                                            setDialog({ mode: 'plan' });
                                        }}
                                    >
                                        Change plan
                                    </Button>
                                </div>
                                <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
                                    {[
                                        {
                                            label: 'Seats',
                                            used: seatsUsed,
                                            limit: currentPlan.seats,
                                        },
                                        {
                                            label: 'Active listings',
                                            used: activeCount,
                                            limit: currentPlan.listings,
                                        },
                                        ...(currentPlan.credits
                                            ? [
                                                  {
                                                      label: 'Featured credits used',
                                                      used: creditsUsed,
                                                      limit: currentPlan.credits,
                                                  },
                                              ]
                                            : []),
                                    ].map((usage) => (
                                        <UsageMeter
                                            key={usage.label}
                                            {...usage}
                                        />
                                    ))}
                                    {!currentPlan.credits && (
                                        <UsageMeter
                                            label="Featured credits"
                                            used={0}
                                            limit={0}
                                            value="Not included"
                                        />
                                    )}
                                </div>
                            </Card>
                            <PaymentMethodCard
                                kind="Debit order"
                                number="FNB Business •••• 6610"
                                holder="Jacaranda Estates (Pty) Ltd"
                                detail="1st of month"
                                actionLabel="Update bank details"
                                onUpdate={() =>
                                    flash('Opening secure debit order form')
                                }
                            />
                        </div>
                        <InvoicesCard
                            invoices={data.invoices}
                            formatAmount={zarInclVat}
                            onPay={(invoice) => {
                                setData((current) => ({
                                    ...current,
                                    invoices: current.invoices.map((item) =>
                                        item.number === invoice.number
                                            ? { ...item, status: 'Paid' }
                                            : item,
                                    ),
                                }));
                                flash(`Paid ${zarInclVat(invoice.amount)}`);
                            }}
                            onDownload={(invoice) =>
                                flash(`Downloading ${invoice.number}.pdf`)
                            }
                        />
                    </>
                )}

                {section === 'help' && (
                    <HelpView
                        faqs={agencyFaqs}
                        audience="agency support"
                        email="agents@maison243.co.za"
                    />
                )}
            </PortalShell>

            {dialog?.mode === 'plan' && (
                <PortalDialog
                    open
                    onClose={() => setDialog(null)}
                    title="Change plan"
                    description="Upgrades apply immediately and are pro-rated. Downgrades apply from your next billing date. Prices exclude VAT."
                    error={dialogError}
                    confirmLabel={
                        planChoice === plan
                            ? 'Keep current plan'
                            : `Switch to ${planChoice}`
                    }
                    onConfirm={() => {
                        if (planChoice === plan) {
                            setDialog(null);

                            return;
                        }

                        const next = agencyPlans.find(
                            (option) => option.id === planChoice,
                        )!;

                        if (next.seats && seatsUsed > next.seats) {
                            setDialogError(
                                `You have ${seatsUsed} seats in use. ${next.id} allows ${next.seats}. Deactivate members first.`,
                            );
                        } else if (
                            next.listings &&
                            activeCount > next.listings
                        ) {
                            setDialogError(
                                `You have ${activeCount} active listings. ${next.id} allows ${next.listings}.`,
                            );
                        } else {
                            setPlan(next.id);
                            setCreditsUsed(Math.min(creditsUsed, next.credits));
                            setDialog(null);
                            flash(`Plan changed to ${next.id}`);
                        }
                    }}
                >
                    <div
                        role="radiogroup"
                        aria-label="Plan"
                        className="flex flex-col gap-2.5"
                    >
                        {agencyPlans.map((option) => (
                            <ChoiceCard
                                key={option.id}
                                selected={planChoice === option.id}
                                onSelect={() => {
                                    setPlanChoice(option.id);
                                    setDialogError('');
                                }}
                                title={
                                    option.id +
                                    (option.id === plan ? ' (current)' : '')
                                }
                                price={`${zar(option.price)} pm`}
                                meta={`${option.seats || 'Unlimited'} seats · ${option.listings || 'unlimited'} active listings · ${option.credits} featured credits`}
                            />
                        ))}
                    </div>
                </PortalDialog>
            )}

            {dialog?.mode === 'invite' && (
                <PortalDialog
                    open
                    onClose={() => setDialog(null)}
                    title="Invite a team member"
                    description="They get an email to set a password. Agents can publish once we have checked their FFC with the PPRA."
                    error={dialogError}
                    confirmLabel="Send invite"
                    onConfirm={() => {
                        if (!invite.name.trim()) {
                            setDialogError('Enter their name.');
                        } else if (!isValidEmail(invite.email)) {
                            setDialogError('Enter a valid email address.');
                        } else if (
                            invite.role === 'Agent' &&
                            !/^\d{4}\s?\d{7}$/.test(invite.ffc.trim())
                        ) {
                            setDialogError(
                                'Enter an 11-digit FFC number, e.g. 2026 1234567.',
                            );
                        } else {
                            const invited: TeamMember = {
                                id: `A${Date.now()}`,
                                name: invite.name.trim(),
                                role: invite.role as TeamMember['role'],
                                email: invite.email.trim(),
                                phone: '—',
                                ffc:
                                    invite.role === 'Agent'
                                        ? invite.ffc.trim()
                                        : '',
                                status: 'Invited',
                            };
                            setData((current) => ({
                                ...current,
                                team: [...current.team, invited],
                            }));
                            setDialog(null);
                            flash(`Invite sent to ${invited.email}`);
                        }
                    }}
                >
                    <div className="flex flex-col gap-3">
                        {(
                            [
                                [
                                    'name',
                                    'Full name',
                                    'text',
                                    'e.g. Kagiso Molefe',
                                ],
                                [
                                    'email',
                                    'Work email',
                                    'email',
                                    'name@jacaranda.co.za',
                                ],
                                [
                                    'ffc',
                                    'FFC number (agents only)',
                                    'text',
                                    'e.g. 2026 1234567',
                                ],
                            ] as const
                        ).map(([key, label, type, placeholder]) => (
                            <Field key={key} label={label}>
                                <TextInput
                                    type={type}
                                    value={invite[key]}
                                    placeholder={placeholder}
                                    onChange={(event) => {
                                        setInvite({
                                            ...invite,
                                            [key]: event.target.value,
                                        });
                                        setDialogError('');
                                    }}
                                />
                            </Field>
                        ))}
                        <Field label="Role">
                            <SelectInput
                                value={invite.role}
                                onChange={(event) =>
                                    setInvite({
                                        ...invite,
                                        role: event.target.value,
                                    })
                                }
                                options={[
                                    {
                                        value: 'Agent',
                                        label: 'Agent: lists properties and handles leads',
                                    },
                                    {
                                        value: 'Admin',
                                        label: 'Admin: manages listings for the whole agency',
                                    },
                                ]}
                            />
                        </Field>
                    </div>
                </PortalDialog>
            )}

            {dialog?.mode === 'screen' && (
                <RequestScreeningDialog
                    open
                    onClose={() => setDialog(null)}
                    billingNote="We email the applicant a secure link. R 250 per completed screening, billed to the agency."
                    defaultPropertyId={
                        (
                            myRentals.find((item) => item.status === 'Live') ??
                            myRentals[0]
                        )?.id ?? ''
                    }
                    rentals={myRentals.map((item) => ({
                        value: item.id,
                        label: `${shortOf(item)} · ${priceOf(item)}`,
                    }))}
                    onSend={({ name, email, propertyId }) => {
                        setData((current) => ({
                            ...current,
                            screenings: [
                                {
                                    id: `SC${Date.now()}`,
                                    name,
                                    email,
                                    propertyId,
                                    daysAgo: 0,
                                    status: 'Invite sent',
                                    result: '',
                                },
                                ...current.screenings,
                            ],
                        }));
                        setDialog(null);
                        flash(`Invite sent to ${email}`);
                    }}
                />
            )}

            <ScreeningReportDialog
                screening={reportScreening}
                onClose={() => setDialog(null)}
                scores={{
                    good: '698 · Good',
                    goodAffordability: 'Rent is 27% of net income',
                }}
                completedLabel={
                    reportScreening
                        ? `Screening for ${reportScreening.propertyShort} · completed ${niceDate(Math.max(0, reportScreening.daysAgo - 1))}`
                        : ''
                }
            />
        </>
    );
}

function UsageMeter({
    label,
    used,
    limit,
    value,
}: {
    label: string;
    used: number;
    limit: number;
    value?: string;
}) {
    const isNearLimit = limit > 0 && used / limit > 0.85;

    return (
        <div className="flex flex-col gap-2 rounded-xl border border-portal-line p-3.5">
            <span className="text-[13px] font-semibold text-portal-body">
                {label}
            </span>
            <span className="text-xl font-bold">
                {value ??
                    (limit ? `${used} / ${limit}` : `${used} · unlimited`)}
            </span>
            <div className="h-1.5 overflow-hidden rounded-[3px] bg-portal-line">
                <div
                    className={cn(
                        'h-full rounded-[3px]',
                        isNearLimit ? 'bg-portal-danger' : 'bg-portal-accent',
                    )}
                    style={{
                        width: value
                            ? '0%'
                            : limit
                              ? `${Math.min(100, (used / limit) * 100)}%`
                              : '12%',
                    }}
                />
            </div>
        </div>
    );
}

function ListingsTable(props: {
    listings: AgencyListing[];
    team: TeamMember[];
    isPrincipal: boolean;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    agentFilter: string;
    setAgentFilter: (value: string) => void;
    query: string;
    setQuery: (value: string) => void;
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
    rowActions: (listing: AgencyListing) => PortalAction[];
    openForm: (id: string) => void;
}) {
    const { isPrincipal } = props;
    const memberName = (id: string) =>
        props.team.find((person) => person.id === id)?.name ?? '';
    const byAgent = props.listings.filter(
        (item) =>
            props.agentFilter === 'all' || item.agentId === props.agentFilter,
    );
    const group = statusGroups[props.statusFilter];
    const search = props.query.trim().toLowerCase();
    const matches = byAgent
        .filter(
            (item) =>
                (!group || group.includes(item.status)) &&
                (!search ||
                    [
                        item.id,
                        addressOf(item),
                        item.suburb,
                        item.city,
                        item.type,
                    ]
                        .join(' ')
                        .toLowerCase()
                        .includes(search)),
        )
        .sort((a, b) => a.modifiedDaysAgo - b.modifiedDaysAgo);
    const { rows, page } = paginate(matches, props.page, props.pageSize);

    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <Segmented
                    label="Filter by status"
                    value={props.statusFilter}
                    onChange={props.setStatusFilter}
                    options={Object.entries(statusGroups).map(
                        ([label, statuses]) => ({
                            value: label,
                            label,
                            count: statuses
                                ? byAgent.filter((item) =>
                                      statuses.includes(item.status),
                                  ).length
                                : byAgent.length,
                        }),
                    )}
                />
                <span className="flex-1" />
                {isPrincipal && (
                    <SelectInput
                        aria-label="Filter by agent"
                        value={props.agentFilter}
                        onChange={(event) =>
                            props.setAgentFilter(event.target.value)
                        }
                        className="w-[200px]"
                        options={[
                            { value: 'all', label: 'All agents' },
                            ...props.team
                                .filter(
                                    (person) =>
                                        person.role !== 'Admin' &&
                                        person.status !== 'Invited',
                                )
                                .map((person) => ({
                                    value: person.id,
                                    label: person.name,
                                })),
                        ]}
                    />
                )}
                <SearchInput
                    value={props.query}
                    onChange={props.setQuery}
                    placeholder="Search number, address…"
                    className="w-[260px]"
                />
            </div>
            <Card className="overflow-hidden">
                <Table minWidth={1040}>
                    <thead>
                        <tr>
                            <Th>List no.</Th>
                            <Th>Address</Th>
                            <Th align="right">Price</Th>
                            {isPrincipal && <Th>Agent</Th>}
                            <Th>Mandate</Th>
                            <Th>Status</Th>
                            <Th>Modified</Th>
                            <Th />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item) => {
                            const days = daysUntil(item.mandateExpires);
                            const isClosed = [
                                'Sold',
                                'Let',
                                'Withdrawn',
                            ].includes(item.status);

                            return (
                                <tr
                                    key={item.id}
                                    className="hover:bg-portal-row-hover"
                                >
                                    <Td>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                props.openForm(item.id)
                                            }
                                            className="cursor-pointer font-semibold text-portal-accent hover:underline"
                                        >
                                            {item.id}
                                        </button>
                                    </Td>
                                    <Td>
                                        <CellText
                                            main={addressOf(item)}
                                            sub={`${item.suburb} · ${item.type} · ${item.deal === 'Rent' ? 'To rent' : 'For sale'}`}
                                            strong
                                        />
                                    </Td>
                                    <Td
                                        align="right"
                                        className="font-semibold whitespace-nowrap"
                                    >
                                        {priceOf(item)}
                                    </Td>
                                    {isPrincipal && (
                                        <Td className="whitespace-nowrap">
                                            {memberName(item.agentId)}
                                        </Td>
                                    )}
                                    <Td>
                                        <div className="whitespace-nowrap">
                                            {item.mandate} mandate
                                        </div>
                                        <div
                                            className={cn(
                                                'mt-0.5 text-xs whitespace-nowrap',
                                                !isClosed && days < 30
                                                    ? 'text-portal-error'
                                                    : 'text-portal-subtle',
                                            )}
                                        >
                                            {isClosed
                                                ? 'Closed'
                                                : days < 0
                                                  ? `Expired ${formatIsoDate(item.mandateExpires)}`
                                                  : `Until ${formatIsoDate(item.mandateExpires)}`}
                                        </div>
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-1.5">
                                            <StatusBadge
                                                status={item.status}
                                                toneOverrides={
                                                    portalToneOverrides
                                                }
                                            />
                                            {item.featured && (
                                                <Badge tone="dark">
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>
                                    </Td>
                                    <Td className="whitespace-nowrap text-portal-muted">
                                        {shortDate(item.modifiedDaysAgo)}
                                    </Td>
                                    <Td>
                                        <ActionButtons
                                            actions={props.rowActions(item)}
                                            className="flex-nowrap justify-end"
                                        />
                                    </Td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
                {!matches.length && (
                    <p className="px-4 py-8 text-portal-subtle">
                        No listings match these filters.
                    </p>
                )}
                <Pagination
                    total={matches.length}
                    page={page}
                    size={props.pageSize}
                    onPage={props.setPage}
                    onSize={props.setPageSize}
                />
            </Card>
        </>
    );
}

function ListingForm(props: {
    form: AgencyForm;
    setForm: (form: AgencyForm) => void;
    errors: string[];
    isPrincipal: boolean;
    agentOptions: { value: string; label: string }[];
    editing: AgencyListing | null;
    quotaNote: string;
    onCancel: () => void;
    onSave: (submit: boolean) => void;
}) {
    const { form, setForm, editing } = props;
    const canSubmit = !editing || ['Draft', 'Expired'].includes(editing.status);

    return (
        <Card className="flex max-w-[980px] flex-col gap-[26px] p-6">
            <FormSection title="Listing & mandate" first>
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1.5 text-[13px] font-semibold text-portal-body">
                        Deal
                        <Segmented
                            label="Deal"
                            value={form.deal}
                            onChange={(deal) => setForm({ ...form, deal })}
                            options={[
                                { value: 'Sale', label: 'For sale' },
                                { value: 'Rent', label: 'To rent' },
                            ]}
                        />
                    </div>
                    <Field label="Property type" className="w-[200px]">
                        <SelectInput
                            value={form.type}
                            options={propertyTypes}
                            onChange={(event) =>
                                setForm({ ...form, type: event.target.value })
                            }
                        />
                    </Field>
                    {props.isPrincipal && (
                        <Field label="Listing agent" className="w-[220px]">
                            <SelectInput
                                value={form.agentId}
                                options={props.agentOptions}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        agentId: event.target.value,
                                    })
                                }
                            />
                        </Field>
                    )}
                    <div className="flex flex-col gap-1.5 text-[13px] font-semibold text-portal-body">
                        Mandate
                        <Segmented
                            label="Mandate"
                            value={form.mandate}
                            onChange={(mandate) =>
                                setForm({ ...form, mandate })
                            }
                            options={[
                                { value: 'Sole', label: 'Sole' },
                                { value: 'Open', label: 'Open' },
                            ]}
                        />
                    </div>
                    <Field label="Mandate expires" className="w-[180px]">
                        <TextInput
                            type="date"
                            value={form.mandateExpires}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    mandateExpires: event.target.value,
                                })
                            }
                        />
                    </Field>
                </div>
            </FormSection>
            <ListingFormSections
                form={form}
                onChange={(key, value) => setForm({ ...form, [key]: value })}
                streetPlaceholder="e.g. 12 Albert St"
                unitPlaceholder="e.g. Unit 4, The Oaks"
                descriptionPlaceholder="Layout, finishes, security, schools and transport nearby."
                photoIntro="The first photo is the cover image."
            />
            <ListingFormFooter
                errors={props.errors}
                onCancel={props.onCancel}
                note={
                    canSubmit
                        ? props.quotaNote
                        : 'Edits to live listings publish straight away'
                }
                draftLabel={editing ? 'Save changes' : 'Save as draft'}
                onSaveDraft={() => props.onSave(false)}
                submitLabel={canSubmit ? 'Submit for review' : undefined}
                onSubmit={canSubmit ? () => props.onSave(true) : undefined}
            />
        </Card>
    );
}

function Leaderboard({
    data,
    seriesOf,
}: {
    data: AgencyPortalData;
    seriesOf: (listing: AgencyListing) => number[];
}) {
    const rows = data.team
        .filter(
            (person) => person.role !== 'Admin' && person.status !== 'Invited',
        )
        .map((person) => {
            const owned = data.listings.filter(
                (item) => item.agentId === person.id,
            );

            return {
                person,
                active: owned.filter((item) =>
                    activeStatuses.includes(item.status),
                ).length,
                views: owned.reduce(
                    (sum, item) =>
                        sum +
                        seriesOf(item).reduce(
                            (total, value) => total + value,
                            0,
                        ),
                    0,
                ),
                leads: data.leads.filter(
                    (lead) => lead.agentId === person.id && lead.daysAgo < 30,
                ).length,
                closed: owned.filter(
                    (item) =>
                        ['Sold', 'Let'].includes(item.status) &&
                        item.modifiedDaysAgo < 90,
                ).length,
            };
        })
        .sort((a, b) => b.views - a.views);

    return (
        <Card className="overflow-hidden">
            <div className="px-5 pt-[18px] pb-3">
                <CardTitle>Agent leaderboard</CardTitle>
            </div>
            <Table minWidth={760}>
                <thead>
                    <tr>
                        <Th>Agent</Th>
                        <Th align="right">Active listings</Th>
                        <Th align="right">Views</Th>
                        <Th align="right">Enquiries</Th>
                        <Th align="right">Avg. first reply</Th>
                        <Th align="right">Sold or let (90 days)</Th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.person.id}>
                            <Td>
                                <div className="flex items-center gap-2.5">
                                    <Avatar
                                        initials={initials(row.person.name)}
                                        size="sm"
                                    />
                                    <span className="font-semibold">
                                        {row.person.name}
                                    </span>
                                </div>
                            </Td>
                            <Td align="right">{row.active}</Td>
                            <Td align="right" className="font-semibold">
                                {formatCount(row.views)}
                            </Td>
                            <Td align="right">{row.leads}</Td>
                            <Td align="right">
                                {firstReplyTimes[row.person.id] ?? '—'}
                            </Td>
                            <Td align="right">{row.closed}</Td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    );
}

function ProfileSection(props: {
    isAgency: boolean;
    me: TeamMember;
    edits: Record<string, string>;
    setEdits: (edits: Record<string, string>) => void;
    about: string | null;
    setAbout: (about: string) => void;
    error: string;
    notifications: Record<string, boolean>;
    toggleNotification: (key: string) => void;
    onSave: (values: Record<string, string>) => void;
}) {
    const { isAgency, me } = props;
    const defaults: Record<string, string> = isAgency
        ? {
              name: 'Jacaranda Estates',
              reg: '2009/214577/07',
              ffc: '2026 0091124',
              vat: '4870261193',
              addr: '412 Lois Ave, Waterkloof Glen, Pretoria',
              phone: '012 460 1180',
              email: 'info@jacaranda.co.za',
              web: 'jacaranda.co.za',
          }
        : {
              first: me.name.split(' ')[0],
              last: me.name.split(' ').slice(1).join(' '),
              email: me.email,
              phone: me.phone,
              ffc: me.ffc,
              branch: 'Waterkloof Glen',
          };
    const values = { ...defaults, ...props.edits };

    const fields: [string, string, string, boolean][] = isAgency
        ? [
              ['name', 'Trading name', 'text', false],
              ['reg', 'CIPC registration no.', 'text', true],
              ['ffc', 'PPRA firm FFC', 'text', true],
              ['vat', 'VAT number', 'text', false],
              ['addr', 'Office address', 'text', false],
              ['phone', 'Office phone', 'tel', false],
              ['email', 'Public email', 'email', false],
              ['web', 'Website', 'text', false],
          ]
        : [
              ['first', 'First name', 'text', false],
              ['last', 'Last name', 'text', false],
              ['email', 'Email', 'email', false],
              ['phone', 'Mobile', 'tel', false],
              ['ffc', 'FFC number', 'text', true],
              ['branch', 'Branch', 'text', true],
          ];

    const about =
        props.about ??
        (isAgency
            ? 'Family-owned agency selling homes in the eastern suburbs of Pretoria since 2009. Specialists in Waterkloof, Brooklyn and Menlo Park.'
            : 'Fifteen years selling family homes in Waterkloof and Groenkloof. Fluent in English, Afrikaans and isiZulu.');

    return (
        <div className="grid items-start gap-4 min-[1180px]:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
            <Card className="flex flex-col gap-[18px] p-6">
                <div className="flex flex-wrap items-center gap-[18px]">
                    <div
                        className={cn(
                            'grid size-24 flex-none place-items-center overflow-hidden bg-[#eef0f4] text-[13px] font-semibold text-portal-subtle',
                            isAgency ? 'rounded-[14px]' : 'rounded-full',
                        )}
                    >
                        {isAgency ? 'Logo' : initials(me.name)}
                    </div>
                    <div className="flex flex-col gap-1">
                        <CardTitle>
                            {isAgency
                                ? values.name
                                : `${values.first} ${values.last}`}
                        </CardTitle>
                        <span className="text-[13px] text-portal-subtle">
                            {isAgency
                                ? 'Shown on every listing and your agency page'
                                : 'Agent at Jacaranda Estates · shown on your listings'}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
                    {fields.map(([key, label, type, isLocked]) => (
                        <Field key={key} label={label}>
                            <TextInput
                                type={type}
                                value={values[key]}
                                disabled={isLocked}
                                onChange={(event) =>
                                    props.setEdits({
                                        ...props.edits,
                                        [key]: event.target.value,
                                    })
                                }
                            />
                        </Field>
                    ))}
                </div>
                <Field label={isAgency ? 'About the agency' : 'Short bio'}>
                    <TextArea
                        value={about}
                        onChange={(event) => props.setAbout(event.target.value)}
                    />
                </Field>
                {!isAgency && (
                    <NotificationToggles
                        values={props.notifications}
                        onToggle={props.toggleNotification}
                        settings={[
                            {
                                key: 'leads',
                                label: 'Email me new enquiries',
                                detail: 'Instant email for every lead on my listings',
                            },
                            {
                                key: 'wa',
                                label: 'WhatsApp alerts',
                                detail: 'When someone asks for a viewing',
                            },
                            {
                                key: 'weekly',
                                label: 'Weekly performance report',
                                detail: 'Views and enquiries every Monday',
                            },
                        ]}
                    />
                )}
                {props.error && (
                    <div
                        role="alert"
                        className="text-[13px] font-semibold text-portal-error"
                    >
                        {props.error}
                    </div>
                )}
                <div className="flex gap-2 border-t border-portal-hair pt-[18px]">
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => props.onSave(values)}
                    >
                        Save changes
                    </Button>
                </div>
            </Card>
            <ChecksCard
                title="Compliance"
                checks={
                    isAgency
                        ? [
                              {
                                  title: 'CIPC registration verified',
                                  detail: 'Jacaranda Estates (Pty) Ltd',
                              },
                              {
                                  title: 'PPRA firm certificate',
                                  detail: 'Valid until 31 Dec 2026',
                              },
                              {
                                  title: 'Trust account audit',
                                  detail: 'FY2026 audit report received',
                              },
                          ]
                        : [
                              {
                                  title: 'Fidelity Fund Certificate',
                                  detail: 'Valid until 31 Dec 2026',
                              },
                              {
                                  title: 'Linked to Jacaranda Estates',
                                  detail: 'Approved by Johan van der Merwe',
                              },
                          ]
                }
                note={
                    isAgency
                        ? 'Registration and FFC details are locked once verified. Contact support to change them.'
                        : 'Your FFC number is managed by your principal. Ask them to update it if your certificate is renewed.'
                }
            />
        </div>
    );
}
