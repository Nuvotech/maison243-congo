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
    Invoice,
    LeadStatus,
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
    TextInput,
    Th,
    paginate,
    useFlash,
} from '@/components/portal/ui';
import { usePortalSection } from '@/hooks/use-portal-section';
import { isValidEmail, niceDate, shortDate, zar } from '@/lib/portal';
import type {
    SellerPlanId,
    SellerProperty,
    SellerPortalData,
} from '@/lib/seller-portal-data';
import {
    seedSellerPortal,
    sellerFaqs,
    sellerPlans,
} from '@/lib/seller-portal-data';
import { seller as sellerRoute } from '@/routes/portals';

type Section =
    | 'properties'
    | 'leads'
    | 'screenings'
    | 'performance'
    | 'profile'
    | 'billing'
    | 'help';

type SellerForm = ListingFields & { plan: SellerPlanId | '' };

const blankForm: SellerForm = {
    deal: 'Sale',
    type: 'House',
    street: '',
    unit: '',
    suburb: '',
    city: 'Pretoria',
    price: '',
    beds: '3',
    baths: '2',
    size: '',
    desc: '',
    plan: '',
};

const titles: Record<Section, string> = {
    properties: 'Properties',
    leads: 'Leads',
    screenings: 'Tenant screenings',
    performance: 'Performance',
    profile: 'Profile',
    billing: 'Billing',
    help: 'Help',
};

const crumbs: Record<Section, string> = {
    properties: 'My properties',
    leads: 'My properties',
    screenings: 'My properties',
    performance: 'My properties',
    profile: 'Account',
    billing: 'Account',
    help: 'Support',
};

const planById = (id: SellerPlanId | '' | null) =>
    sellerPlans.find((plan) => plan.id === id);

const addressOf = (property: SellerProperty): string =>
    (property.unit ? `${property.unit}, ` : '') + property.street;

const shortOf = (property: SellerProperty): string =>
    property.street +
    (property.unit ? ` (${property.unit.split(',')[0]})` : '');

const priceOf = (property: SellerProperty): string =>
    zar(property.price) + (property.deal === 'Rent' ? ' pm' : '');

type PublishDialog = {
    propertyId: string;
    kind: 'publish' | 'renew' | 'relist';
};

export default function SellerPortal({ section }: { section: Section }) {
    const goTo = usePortalSection<Section>((target) =>
        sellerRoute.url(target === 'properties' ? undefined : target),
    );
    const { message, flash } = useFlash();
    const [data, setData] = useState<SellerPortalData>(seedSellerPortal);
    const [invoiceSequence, setInvoiceSequence] = useState(24531);

    const [tab, setTab] = useState<'current' | 'form'>('current');
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<SellerForm>(blankForm);
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [learnMore, setLearnMore] = useState<SellerPlanId | null>(null);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const [publishDialog, setPublishDialog] = useState<PublishDialog | null>(
        null,
    );
    const [publishPlan, setPublishPlan] = useState<SellerPlanId>('Sale');
    const [publishError, setPublishError] = useState('');
    const [isRequestingScreening, setIsRequestingScreening] = useState(false);
    const [reportId, setReportId] = useState<string | null>(null);

    const [account, setAccount] = useState({
        first: 'Naledi',
        last: 'Mabaso',
        email: 'naledi.mabaso@gmail.com',
        phone: '072 418 3396',
    });
    const [accountError, setAccountError] = useState('');
    const [notifications, setNotifications] = useState<Record<string, boolean>>(
        { leads: true, wa: true, weekly: false },
    );

    const fullName = `${account.first} ${account.last}`;
    const findProperty = (id: string) =>
        data.properties.find((property) => property.id === id)!;
    const newLeads = data.leads.filter((lead) => lead.status === 'New').length;
    const dueInvoices = data.invoices.filter(
        (invoice) => invoice.status === 'Due',
    ).length;

    const updateProperty = (
        id: string,
        patch: Partial<SellerProperty>,
        toast?: string,
    ): void => {
        setData((current) => ({
            ...current,
            properties: current.properties.map((property) =>
                property.id === id
                    ? { ...property, ...patch, modifiedDaysAgo: 0 }
                    : property,
            ),
        }));

        if (toast) {
            flash(toast);
        }
    };

    const addInvoice = (description: string, amount: number): void => {
        const number = `INV-${invoiceSequence}`;
        setInvoiceSequence(invoiceSequence + 1);
        setData((current) => ({
            ...current,
            invoices: [
                { number, daysAgo: 0, description, amount, status: 'Paid' },
                ...current.invoices,
            ],
        }));
    };

    const navigate = (target: Section): void => {
        setPublishDialog(null);
        goTo(target);
    };

    const openForm = (id: string | null): void => {
        const existing = id ? findProperty(id) : null;
        setForm(
            existing
                ? {
                      deal: existing.deal,
                      type: existing.type,
                      street: existing.street,
                      unit: existing.unit,
                      suburb: existing.suburb,
                      city: existing.city,
                      price: String(existing.price),
                      beds: String(existing.beds),
                      baths: String(existing.baths),
                      size: String(existing.size),
                      desc: existing.desc,
                      plan:
                          existing.plan ??
                          (existing.deal === 'Rent' ? 'Rental' : 'Sale'),
                  }
                : blankForm,
        );
        setEditId(id);
        setFormErrors([]);
        setTab('form');

        if (section !== 'properties') {
            goTo('properties');
        }
    };

    const closeForm = (): void => {
        setTab('current');
        setEditId(null);
        setFormErrors([]);
    };

    const openPublish = (id: string, kind: PublishDialog['kind']): void => {
        const existing = findProperty(id);
        setPublishPlan(
            existing.plan ?? (existing.deal === 'Rent' ? 'Rental' : 'Sale'),
        );
        setPublishError('');
        setPublishDialog({ propertyId: id, kind });
    };

    const saveForm = (submit: boolean): void => {
        const plan = planById(form.plan);
        const errors = baseListingErrors(form);
        const isLand = form.type === 'Vacant land';

        if (plan?.max && Number(form.price) > plan.max) {
            errors.push(
                'Sale Listing (Lite) is for properties up to R 500 000. Change to Sale Listing for a higher price.',
            );
        }

        if (plan?.max && isLand) {
            errors.push('Sale Listing (Lite) does not cover vacant land.');
        }

        if (submit && form.desc.trim().length < minimumDescriptionLength) {
            errors.push(
                `Write a description of at least ${minimumDescriptionLength} characters before submitting.`,
            );
        }

        if (errors.length) {
            setFormErrors(errors);

            return;
        }

        const values = listingValues(form);

        if (editId) {
            updateProperty(
                editId,
                submit && plan
                    ? { ...values, status: 'Pending review', plan: plan.id }
                    : values,
                submit ? 'Submitted for review' : 'Changes saved',
            );

            if (submit && plan) {
                addInvoice(`${plan.name} · ${values.street}`, plan.price);
            }
        } else {
            const id = String(
                116250000 +
                    data.properties.length * 137 +
                    Math.floor(Math.random() * 90),
            );
            const created: SellerProperty = {
                id,
                ...values,
                status: submit ? 'Pending review' : 'Unpublished',
                modifiedDaysAgo: 0,
                plan: submit && plan ? plan.id : null,
                listedDaysAgo: null,
            };
            setData((current) => ({
                ...current,
                properties: [created, ...current.properties],
            }));

            if (submit && plan) {
                addInvoice(`${plan.name} · ${values.street}`, plan.price);
            }

            flash(
                submit
                    ? `Listing ${id} submitted for review`
                    : `Saved as draft ${id}`,
            );
        }

        closeForm();
        setForm(blankForm);
        setPage(1);
        setQuery('');
    };

    const rowActions = (property: SellerProperty): PortalAction[] => {
        const edit: PortalAction = {
            label: 'Edit',
            run: () => openForm(property.id),
        };

        switch (property.status) {
            case 'Unpublished':
                return [
                    {
                        label: 'Publish',
                        primary: true,
                        run: () => openPublish(property.id, 'publish'),
                    },
                    edit,
                ];
            case 'Expired':
                return [
                    {
                        label: 'Renew',
                        primary: true,
                        run: () => openPublish(property.id, 'renew'),
                    },
                    edit,
                ];
            case 'Live':
                return [
                    edit,
                    property.deal === 'Sale'
                        ? {
                              label: 'Under offer',
                              run: () =>
                                  updateProperty(
                                      property.id,
                                      { status: 'Under offer' },
                                      'Marked under offer',
                                  ),
                          }
                        : {
                              label: 'Mark let',
                              run: () =>
                                  updateProperty(
                                      property.id,
                                      { status: 'Let' },
                                      'Marked as let',
                                  ),
                          },
                    {
                        label: 'Unpublish',
                        run: () =>
                            updateProperty(
                                property.id,
                                { status: 'Unpublished' },
                                'Listing unpublished',
                            ),
                    },
                ];
            case 'Under offer':
                return [
                    {
                        label: 'Mark sold',
                        primary: true,
                        run: () =>
                            updateProperty(
                                property.id,
                                { status: 'Sold' },
                                'Marked as sold',
                            ),
                    },
                    {
                        label: 'Back to live',
                        run: () =>
                            updateProperty(
                                property.id,
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
                        run: () => openPublish(property.id, 'relist'),
                    },
                ];
        }
    };

    const seriesOf = (property: SellerProperty): number[] =>
        viewSeries({
            id: property.id,
            listedDaysAgo: property.listedDaysAgo,
            modifiedDaysAgo: property.modifiedDaysAgo,
            isOn: ['Live', 'Under offer'].includes(property.status),
            base:
                property.deal === 'Rent'
                    ? 44
                    : property.type === 'House'
                      ? 32
                      : 14,
            boostRecent: (day) => (day < 3 ? 1.25 : 1),
        });

    const navGroups: NavGroup<Section>[] = [
        {
            label: 'My properties',
            items: [
                { id: 'properties', label: 'Properties', icon: 'home' },
                {
                    id: 'leads',
                    label: 'Leads',
                    icon: 'inbox',
                    badge: newLeads || undefined,
                },
                {
                    id: 'screenings',
                    label: 'Tenant screenings',
                    icon: 'shield',
                    badge: 'New',
                    badgeTone: 'success',
                },
                { id: 'performance', label: 'Performance', icon: 'chart' },
            ],
        },
        {
            label: 'Account',
            items: [
                { id: 'profile', label: 'Profile', icon: 'user' },
                {
                    id: 'billing',
                    label: 'Billing',
                    icon: 'card',
                    badge: dueInvoices || undefined,
                },
            ],
        },
        {
            label: 'Support',
            items: [{ id: 'help', label: 'Help', icon: 'help' }],
        },
    ];

    const isForm = section === 'properties' && tab === 'form';
    const title = isForm
        ? editId
            ? `Edit listing ${editId}`
            : 'Add a property'
        : titles[section];

    const leadViews: LeadView[] = data.leads.map((lead) => {
        const property = findProperty(lead.propertyId);

        return {
            ...lead,
            propertyShort: shortOf(property),
            propertyAddress: addressOf(property),
            propertySub: `${property.suburb} · ${property.type} · ${property.deal === 'Rent' ? 'To rent' : 'For sale'}`,
            price: priceOf(property),
        };
    });

    const screeningViews: ScreeningView[] = data.screenings.map((screening) => {
        const property = findProperty(screening.propertyId);

        return {
            ...screening,
            propertyShort: shortOf(property),
            propertySub: `${property.suburb} · ${priceOf(property)}`,
        };
    });

    const reportScreening =
        screeningViews.find((screening) => screening.id === reportId) ?? null;
    const rentals = data.properties.filter(
        (property) => property.deal === 'Rent',
    );
    const defaultRental =
        rentals.find((property) => property.status === 'Live') ?? rentals[0];

    return (
        <>
            <Head title={`${title} · Seller portal`} />
            <PortalShell
                groups={navGroups}
                active={section}
                onNavigate={(target) => {
                    if (target === 'properties') {
                        closeForm();
                    }

                    navigate(target);
                }}
                crumb={crumbs[section]}
                title={title}
                toast={message}
                headerActions={
                    <>
                        <div className="hidden items-center gap-3.5 text-[13px] min-[1100px]:flex">
                            <span className="font-bold">Need help?</span>
                            <div className="flex flex-col gap-0.5 leading-[1.3]">
                                <a
                                    href="tel:+27102430243"
                                    className="text-portal-body"
                                >
                                    010 243 0243
                                </a>
                                <a
                                    href="mailto:sellers@maison243.co.za"
                                    className="text-portal-accent hover:text-portal-accent-strong"
                                >
                                    sellers@maison243.co.za
                                </a>
                            </div>
                        </div>
                        <span className="hidden h-7 w-px bg-portal-line min-[1100px]:block" />
                        <HeaderPerson
                            role="Private seller"
                            onProfile={() => navigate('profile')}
                        />
                    </>
                }
            >
                {section === 'properties' && (
                    <PropertiesSection
                        data={data}
                        editId={editId}
                        isForm={isForm}
                        form={form}
                        setForm={(next) => {
                            setForm(next);
                            setFormErrors([]);
                        }}
                        formErrors={formErrors}
                        learnMore={learnMore}
                        setLearnMore={setLearnMore}
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
                        onTabCurrent={closeForm}
                        onTabNew={() => !isForm && openForm(null)}
                        onCancel={closeForm}
                        onSave={saveForm}
                        rowActions={rowActions}
                        openForm={openForm}
                        findProperty={findProperty}
                    />
                )}

                {section === 'leads' && (
                    <LeadsView
                        leads={leadViews}
                        onOpenProperty={openForm}
                        onStatusChange={(
                            id: string,
                            status: LeadStatus,
                            toast: string,
                        ) => {
                            setData((current) => ({
                                ...current,
                                leads: current.leads.map((lead) =>
                                    lead.id === id ? { ...lead, status } : lead,
                                ),
                            }));
                            flash(toast);
                        }}
                    />
                )}

                {section === 'screenings' && (
                    <ScreeningsView
                        screenings={screeningViews}
                        onRequest={() => setIsRequestingScreening(true)}
                        onViewReport={setReportId}
                        onNudge={(screening) =>
                            flash(
                                `${screening.status === 'Invite sent' ? 'Invite resent to ' : 'Reminder sent to '}${screening.email}`,
                            )
                        }
                    />
                )}

                {section === 'performance' && (
                    <PerformanceView
                        allLabel="All listings"
                        savesRate={0.055}
                        listings={data.properties
                            .filter(
                                (property) => property.listedDaysAgo !== null,
                            )
                            .map((property): PerformanceListing => ({
                                id: property.id,
                                label: shortOf(property),
                                sub: `${property.suburb} · ${priceOf(property)}`,
                                status: property.status,
                                series: seriesOf(property),
                                leads: data.leads.filter(
                                    (lead) =>
                                        lead.propertyId === property.id &&
                                        lead.daysAgo < 30,
                                ).length,
                                newLeads: data.leads.filter(
                                    (lead) =>
                                        lead.propertyId === property.id &&
                                        lead.status === 'New',
                                ).length,
                            }))}
                    />
                )}

                {section === 'profile' && (
                    <div className="grid items-start gap-4 min-[1180px]:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
                        <Card className="flex flex-col gap-4 p-6">
                            <CardTitle>Personal details</CardTitle>
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
                                {(
                                    [
                                        ['first', 'First name', 'text'],
                                        ['last', 'Last name', 'text'],
                                        ['email', 'Email', 'email'],
                                        ['phone', 'Mobile', 'tel'],
                                    ] as const
                                ).map(([key, label, type]) => (
                                    <Field key={key} label={label}>
                                        <TextInput
                                            type={type}
                                            value={account[key]}
                                            onChange={(event) => {
                                                setAccount({
                                                    ...account,
                                                    [key]: event.target.value,
                                                });
                                                setAccountError('');
                                            }}
                                        />
                                    </Field>
                                ))}
                            </div>
                            {accountError && (
                                <div
                                    role="alert"
                                    className="text-[13px] font-semibold text-portal-error"
                                >
                                    {accountError}
                                </div>
                            )}
                            <NotificationToggles
                                values={notifications}
                                onToggle={(key) =>
                                    setNotifications({
                                        ...notifications,
                                        [key]: !notifications[key],
                                    })
                                }
                                settings={[
                                    {
                                        key: 'leads',
                                        label: 'Email me new enquiries',
                                        detail: 'Instant email for every lead',
                                    },
                                    {
                                        key: 'wa',
                                        label: 'WhatsApp alerts',
                                        detail: 'A WhatsApp message when someone asks for a viewing',
                                    },
                                    {
                                        key: 'weekly',
                                        label: 'Weekly performance report',
                                        detail: 'Views and enquiries every Monday morning',
                                    },
                                ]}
                            />
                            <div className="flex gap-2 border-t border-portal-hair pt-[18px]">
                                <Button
                                    size="lg"
                                    variant="primary"
                                    onClick={() => {
                                        if (
                                            !account.first.trim() ||
                                            !account.last.trim()
                                        ) {
                                            setAccountError(
                                                'First and last name are required.',
                                            );
                                        } else if (
                                            !isValidEmail(account.email)
                                        ) {
                                            setAccountError(
                                                'Enter a valid email address.',
                                            );
                                        } else {
                                            flash('Profile saved');
                                        }
                                    }}
                                >
                                    Save changes
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={() =>
                                        flash(
                                            `Password reset link sent to ${account.email}`,
                                        )
                                    }
                                >
                                    Change password
                                </Button>
                            </div>
                        </Card>
                        <ChecksCard
                            title="Verification"
                            checks={[
                                {
                                    title: 'ID verified',
                                    detail: 'Checked against Home Affairs · 14 Mar 2026',
                                },
                                {
                                    title: 'Proof of ownership',
                                    detail: 'Title deeds on file for 7 properties',
                                },
                            ]}
                            note="Verified sellers get a badge on every listing. To change your legal name or ID number, contact support."
                        />
                    </div>
                )}

                {section === 'billing' && (
                    <>
                        <div className="grid items-start gap-4 min-[1180px]:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
                            <Card className="overflow-hidden">
                                <div className="px-5 pt-[18px] pb-3">
                                    <CardTitle>Active packages</CardTitle>
                                </div>
                                <Table minWidth={560}>
                                    <thead>
                                        <tr>
                                            <Th>Listing</Th>
                                            <Th>Package</Th>
                                            <Th>Runs until</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.properties
                                            .filter(
                                                (property) =>
                                                    property.plan &&
                                                    [
                                                        'Live',
                                                        'Under offer',
                                                        'Pending review',
                                                    ].includes(property.status),
                                            )
                                            .map((property) => {
                                                const plan = planById(
                                                    property.plan,
                                                )!;
                                                const left =
                                                    property.listedDaysAgo ===
                                                    null
                                                        ? null
                                                        : plan.days -
                                                          property.listedDaysAgo;

                                                return (
                                                    <tr key={property.id}>
                                                        <Td>
                                                            <CellText
                                                                main={shortOf(
                                                                    property,
                                                                )}
                                                                sub={
                                                                    property.suburb
                                                                }
                                                                strong
                                                            />
                                                        </Td>
                                                        <Td>
                                                            {plan.name} ·{' '}
                                                            {zar(plan.price)}
                                                        </Td>
                                                        <Td>
                                                            <CellText
                                                                main={
                                                                    left ===
                                                                    null
                                                                        ? 'Starts when approved'
                                                                        : niceDate(
                                                                              -left,
                                                                          )
                                                                }
                                                                sub={
                                                                    left ===
                                                                    null
                                                                        ? `${plan.months} months`
                                                                        : `${left} days left`
                                                                }
                                                            />
                                                        </Td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </Table>
                            </Card>
                            <PaymentMethodCard
                                kind="Visa"
                                number="•••• •••• •••• 4821"
                                holder={fullName}
                                detail="08/28"
                                actionLabel="Update card"
                                onUpdate={() =>
                                    flash('Opening secure card form')
                                }
                            />
                        </div>
                        <InvoicesCard
                            invoices={data.invoices}
                            formatAmount={zar}
                            onPay={(invoice: Invoice) => {
                                setData((current) => ({
                                    ...current,
                                    invoices: current.invoices.map((item) =>
                                        item.number === invoice.number
                                            ? { ...item, status: 'Paid' }
                                            : item,
                                    ),
                                }));
                                flash(
                                    `Paid ${zar(invoice.amount)} with Visa •••• 4821`,
                                );
                            }}
                            onDownload={(invoice) =>
                                flash(`Downloading ${invoice.number}.pdf`)
                            }
                        />
                    </>
                )}

                {section === 'help' && (
                    <HelpView
                        faqs={sellerFaqs}
                        audience="seller"
                        email="sellers@maison243.co.za"
                    />
                )}
            </PortalShell>

            {publishDialog &&
                (() => {
                    const property = findProperty(publishDialog.propertyId);
                    const plan = planById(publishPlan)!;
                    const verb = {
                        publish: 'Publish',
                        renew: 'Renew',
                        relist: 'Relist',
                    }[publishDialog.kind];

                    return (
                        <PortalDialog
                            open
                            onClose={() => setPublishDialog(null)}
                            title={`${verb} ${shortOf(property)}`}
                            description="Pick a plan. We review the listing within one working day and the advertising period starts once it goes live."
                            error={publishError}
                            confirmLabel={`Pay ${zar(plan.price)} & submit`}
                            onConfirm={() => {
                                if (
                                    plan.max &&
                                    (property.price > plan.max ||
                                        property.type === 'Vacant land')
                                ) {
                                    setPublishError(
                                        'Sale Listing (Lite) is only for homes priced up to R 500 000.',
                                    );

                                    return;
                                }

                                updateProperty(
                                    property.id,
                                    {
                                        status: 'Pending review',
                                        plan: plan.id,
                                        listedDaysAgo: null,
                                    },
                                    `Submitted for review · paid ${zar(plan.price)}`,
                                );
                                addInvoice(
                                    `${plan.name} · ${property.street}`,
                                    plan.price,
                                );
                                setPublishDialog(null);
                            }}
                        >
                            <div
                                role="radiogroup"
                                aria-label="Listing plan"
                                className="flex flex-col gap-2.5"
                            >
                                {sellerPlans
                                    .filter(
                                        (option) =>
                                            option.deal === property.deal,
                                    )
                                    .map((option) => (
                                        <ChoiceCard
                                            key={option.id}
                                            selected={publishPlan === option.id}
                                            onSelect={() => {
                                                setPublishPlan(option.id);
                                                setPublishError('');
                                            }}
                                            title={option.name}
                                            price={zar(option.price)}
                                            meta={`Advertised for ${option.months} months · ${option.max ? 'residential up to R 500 000' : 'all property types and prices'}`}
                                        />
                                    ))}
                            </div>
                        </PortalDialog>
                    );
                })()}

            {isRequestingScreening && (
                <RequestScreeningDialog
                    open
                    onClose={() => setIsRequestingScreening(false)}
                    billingNote="We email the applicant a secure link. You pay R 250 only if they complete it."
                    defaultPropertyId={defaultRental?.id ?? ''}
                    rentals={rentals.map((property) => ({
                        value: property.id,
                        label: `${shortOf(property)} · ${priceOf(property)}`,
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
                        setIsRequestingScreening(false);
                        flash(`Invite sent to ${email}`);
                    }}
                />
            )}

            <ScreeningReportDialog
                screening={reportScreening}
                onClose={() => setReportId(null)}
                scores={{
                    good: '712 · Good',
                    goodAffordability: 'Rent is 24% of net income',
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

type PropertiesSectionProps = {
    data: SellerPortalData;
    editId: string | null;
    isForm: boolean;
    form: SellerForm;
    setForm: (form: SellerForm) => void;
    formErrors: string[];
    learnMore: SellerPlanId | null;
    setLearnMore: (id: SellerPlanId | null) => void;
    query: string;
    setQuery: (value: string) => void;
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
    onTabCurrent: () => void;
    onTabNew: () => void;
    onCancel: () => void;
    onSave: (submit: boolean) => void;
    rowActions: (property: SellerProperty) => PortalAction[];
    openForm: (id: string) => void;
    findProperty: (id: string) => SellerProperty;
};

function PropertiesSection(props: PropertiesSectionProps) {
    const { data, editId, isForm, form, setForm, query, page, pageSize } =
        props;
    const isPicker = isForm && !editId && !form.plan;

    const search = query.trim().toLowerCase();
    const matches = data.properties
        .filter(
            (property) =>
                !search ||
                [
                    property.id,
                    addressOf(property),
                    property.suburb,
                    property.city,
                    property.type,
                    property.deal,
                    property.status,
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(search),
        )
        .sort((a, b) => a.modifiedDaysAgo - b.modifiedDaysAgo);
    const { rows, page: currentPage } = paginate(matches, page, pageSize);

    const editing = editId ? props.findProperty(editId) : null;
    const canSubmit =
        !editing ||
        ['Unpublished', 'Expired', 'Sold', 'Let'].includes(editing.status);
    const plan = planById(form.plan) ?? sellerPlans[0];

    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <Segmented
                    label="Properties"
                    value={isForm ? 'form' : 'current'}
                    onChange={(value) =>
                        value === 'current'
                            ? props.onTabCurrent()
                            : props.onTabNew()
                    }
                    options={[
                        {
                            value: 'current',
                            label: 'Current',
                            count: data.properties.length,
                        },
                        {
                            value: 'form',
                            label: editId ? 'Edit listing' : 'Add new',
                        },
                    ]}
                />
                <span className="flex-1" />
                {!isForm && (
                    <SearchInput
                        value={query}
                        onChange={props.setQuery}
                        placeholder="Search number, address or type…"
                    />
                )}
            </div>

            {!isForm && (
                <Card className="overflow-hidden">
                    <Table minWidth={940}>
                        <thead>
                            <tr>
                                <Th>List no.</Th>
                                <Th>Address</Th>
                                <Th align="right">Price</Th>
                                <Th>Property type</Th>
                                <Th>Deal</Th>
                                <Th>Status</Th>
                                <Th>Modified</Th>
                                <Th />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((property) => (
                                <tr
                                    key={property.id}
                                    className="hover:bg-portal-row-hover"
                                >
                                    <Td>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                props.openForm(property.id)
                                            }
                                            className="cursor-pointer font-semibold text-portal-accent hover:underline"
                                        >
                                            {property.id}
                                        </button>
                                    </Td>
                                    <Td>
                                        <CellText
                                            main={addressOf(property)}
                                            sub={`${property.suburb}, ${property.city}`}
                                            strong
                                        />
                                    </Td>
                                    <Td
                                        align="right"
                                        className="font-semibold whitespace-nowrap"
                                    >
                                        {priceOf(property)}
                                    </Td>
                                    <Td>{property.type}</Td>
                                    <Td>{property.deal}</Td>
                                    <Td>
                                        <StatusBadge
                                            status={property.status}
                                            toneOverrides={portalToneOverrides}
                                        />
                                    </Td>
                                    <Td className="whitespace-nowrap text-portal-muted">
                                        {shortDate(property.modifiedDaysAgo)}
                                    </Td>
                                    <Td>
                                        <ActionButtons
                                            actions={props.rowActions(property)}
                                            className="flex-nowrap justify-end"
                                        />
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {!matches.length && (
                        <p className="px-4 py-8 text-portal-subtle">
                            No properties match your search.
                        </p>
                    )}
                    <Pagination
                        total={matches.length}
                        page={currentPage}
                        size={pageSize}
                        onPage={props.setPage}
                        onSize={props.setPageSize}
                    />
                </Card>
            )}

            {isPicker && (
                <>
                    <div className="flex flex-col gap-1">
                        <CardTitle>Choose a listing plan</CardTitle>
                        <p className="text-[13px] text-portal-subtle">
                            Once-off payment per listing, VAT included. You only
                            pay when you submit the listing for review.
                        </p>
                    </div>
                    <div className="grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-stretch gap-4">
                        {sellerPlans.map((option) => {
                            const isOpen = props.learnMore === option.id;

                            return (
                                <Card
                                    key={option.id}
                                    className="flex flex-col gap-[18px] p-[22px]"
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="flex-1 text-lg font-bold">
                                                {option.name}
                                            </span>
                                            <Badge
                                                tone={
                                                    option.deal === 'Rent'
                                                        ? 'success'
                                                        : 'info'
                                                }
                                            >
                                                {option.deal === 'Rent'
                                                    ? 'To rent'
                                                    : 'For sale'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[30px] leading-[1.1] font-bold tracking-[-0.02em]">
                                                {zar(option.price)}
                                            </span>
                                            <span className="text-[13px] text-portal-subtle">
                                                once-off
                                            </span>
                                        </div>
                                        <p className="text-[13px] leading-normal text-pretty text-portal-muted">
                                            {option.blurb}
                                        </p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        className="h-[42px] justify-center"
                                        onClick={() => {
                                            setForm({
                                                ...blankForm,
                                                plan: option.id,
                                                deal: option.deal,
                                            });
                                            props.setLearnMore(null);
                                        }}
                                    >
                                        Add now
                                    </Button>
                                    <ul className="flex flex-col gap-2.5 border-t border-portal-hair pt-4">
                                        {option.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start gap-2 text-[13px]"
                                            >
                                                <Icon
                                                    name="check"
                                                    size={15}
                                                    strokeWidth={2.6}
                                                    className="mt-px text-[#1f9d55]"
                                                />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    {isOpen && (
                                        <div className="flex flex-col gap-1.5 rounded-[10px] bg-portal-soft px-3.5 py-3 text-[13px] leading-normal text-portal-body">
                                            {option.more.map((line) => (
                                                <span key={line}>{line}</span>
                                            ))}
                                        </div>
                                    )}
                                    <Button
                                        className="mt-auto h-10 justify-center"
                                        aria-expanded={isOpen}
                                        onClick={() =>
                                            props.setLearnMore(
                                                isOpen ? null : option.id,
                                            )
                                        }
                                    >
                                        {isOpen ? 'Show less' : 'Learn more'}
                                    </Button>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {isForm && !isPicker && (
                <Card className="flex max-w-[960px] flex-col gap-[26px] p-6">
                    <div className="flex flex-wrap items-center gap-3.5 rounded-xl border border-portal-accent-line bg-portal-accent-wash px-4 py-3.5">
                        <span className="grid size-10 flex-none place-items-center rounded-[10px] bg-portal-accent text-white">
                            <Icon name="home" />
                        </span>
                        <div className="flex min-w-[200px] flex-1 flex-col gap-0.5">
                            <span className="text-xs text-portal-subtle">
                                Listing plan
                            </span>
                            <span className="text-[15px] font-bold">
                                {plan.name} · {zar(plan.price)}
                            </span>
                            <span className="text-xs text-portal-muted">
                                {plan.deal === 'Rent' ? 'To rent' : 'For sale'}{' '}
                                · advertised for {plan.months} months
                                {plan.max ? ' · up to R 500 000' : ''}
                                {editing && !canSubmit ? ' · already paid' : ''}
                            </span>
                        </div>
                        {!editId && (
                            <Button
                                onClick={() => setForm({ ...form, plan: '' })}
                            >
                                Change plan
                            </Button>
                        )}
                    </div>
                    <FormSection title="Listing type" first>
                        <Field label="Property type" className="w-60">
                            <SelectInput
                                value={form.type}
                                options={
                                    plan.max
                                        ? propertyTypes.filter(
                                              (type) => type !== 'Vacant land',
                                          )
                                        : propertyTypes
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        type: event.target.value,
                                    })
                                }
                            />
                        </Field>
                    </FormSection>
                    <ListingFormSections
                        form={form}
                        onChange={(key, value) =>
                            setForm({ ...form, [key]: value })
                        }
                        streetPlaceholder="e.g. 38 Rhino Rd"
                        unitPlaceholder="e.g. Unit 7, Acacia Gardens"
                        descriptionPlaceholder="What makes the property stand out? Mention the layout, finishes, security and what's nearby."
                        photoIntro="Drop photos into the slots. The first one is the cover image."
                    />
                    <ListingFormFooter
                        errors={props.formErrors}
                        onCancel={props.onCancel}
                        draftLabel={editing ? 'Save changes' : 'Save as draft'}
                        onSaveDraft={() => props.onSave(false)}
                        submitLabel={
                            canSubmit
                                ? `Pay ${zar(plan.price)} & submit`
                                : undefined
                        }
                        onSubmit={
                            canSubmit ? () => props.onSave(true) : undefined
                        }
                    />
                </Card>
            )}
        </>
    );
}
