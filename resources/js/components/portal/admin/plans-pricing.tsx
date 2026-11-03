import { useState } from 'react';
import {
    Button,
    Card,
    CardTitle,
    Field,
    Icon,
    Segmented,
    StatusBadge,
    Table,
    Td,
    TextInput,
    Th,
} from '@/components/portal/ui';
import type {
    AdminData,
    AgencyPlanRecord,
    ListingPack,
} from '@/lib/admin-portal-data';
import { zar, zarCents } from '@/lib/portal';
import { cn } from '@/lib/utils';

export type PlanCollection = 'plans' | 'packs';

type PlansPricingProps = {
    data: AdminData;
    onEdit: (
        collection: PlanCollection,
        item: AgencyPlanRecord | ListingPack | null,
    ) => void;
    onToggle: (
        collection: PlanCollection,
        item: AgencyPlanRecord | ListingPack,
    ) => void;
    onFeeChange: (fee: 'screening' | 'credit', value: string) => void;
};

export default function PlansPricing({
    data,
    onEdit,
    onToggle,
    onFeeChange,
}: PlansPricingProps) {
    const [vat, setVat] = useState<'excl' | 'incl'>('excl');
    const [annualDiscount, setAnnualDiscount] = useState('10');

    const withVat = (amount: number) =>
        vat === 'incl' ? amount * 1.15 : amount;
    const discount = Math.min(50, Math.max(0, Number(annualDiscount) || 0));
    const limit = (value: number) => (value ? String(value) : 'Unlimited');
    const completedScreenings = data.screenings.filter(
        (screening) => screening.status === 'Complete',
    ).length;
    const screeningRevenue = data.payments
        .filter(
            (payment) =>
                payment.desc.startsWith('Tenant screening') &&
                payment.status === 'Paid',
        )
        .reduce((sum, payment) => sum + payment.amt, 0);

    return (
        <>
            <Card className="flex flex-wrap items-end gap-6 p-5">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-semibold text-portal-body">
                        Show prices
                    </span>
                    <Segmented
                        label="Show prices"
                        value={vat}
                        onChange={setVat}
                        options={[
                            { value: 'excl', label: 'Excl. VAT' },
                            { value: 'incl', label: 'Incl. VAT' },
                        ]}
                    />
                </div>
                <Field
                    label="Annual billing discount (%)"
                    className="w-[200px]"
                >
                    <TextInput
                        type="number"
                        min="0"
                        max="50"
                        value={annualDiscount}
                        onChange={(event) =>
                            setAnnualDiscount(event.target.value)
                        }
                    />
                </Field>
                <p className="mb-1 max-w-[520px] min-w-[240px] flex-1 text-[13px] leading-normal text-portal-head">
                    Agency plans are priced excl. 15% VAT; seller listing plans
                    and fees include VAT. Price changes apply to new purchases
                    right away and to existing subscribers at their next
                    renewal.
                </p>
            </Card>

            <section className="flex flex-col gap-3.5">
                <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="flex-1">
                        Agency subscriptions{' '}
                        <span className="ml-1.5 text-[13px] font-medium text-portal-subtle">
                            Billed monthly per agency
                        </span>
                    </CardTitle>
                    <Button
                        variant="primary"
                        onClick={() => onEdit('plans', null)}
                    >
                        <Icon name="plus" size={15} strokeWidth={2.2} />
                        Add plan
                    </Button>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
                    {data.plans.map((plan) => {
                        const subscribers = data.agencies.filter(
                            (agency) => agency.plan === plan.name,
                        ).length;
                        const specs = [
                            ['Agencies on plan', String(subscribers)],
                            ['Agent seats', limit(plan.seats)],
                            ['Active listings', limit(plan.listings)],
                            ['Featured credits / month', String(plan.featured)],
                            ['Analytics', plan.analytics],
                        ];

                        return (
                            <Card
                                key={plan.id}
                                className={cn(
                                    'flex flex-col gap-4 p-5',
                                    plan.status !== 'Active' && 'opacity-55',
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="flex-1 text-[17px] font-bold">
                                        {plan.name}
                                    </span>
                                    <StatusBadge
                                        status={plan.status}
                                        toneOverrides={{
                                            Active: 'success',
                                            Archived: 'neutral',
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[30px] leading-none font-bold tracking-[-0.02em]">
                                            {zar(withVat(plan.price))}
                                        </span>
                                        <span className="text-[13px] text-portal-subtle">
                                            / month
                                        </span>
                                    </div>
                                    <div className="mt-1.5 text-xs text-portal-subtle">
                                        {zar(
                                            withVat(plan.price) *
                                                12 *
                                                (1 - discount / 100),
                                        )}{' '}
                                        / year billed annually
                                        {discount ? ` (${discount}% off)` : ''}
                                        {vat === 'incl'
                                            ? ' incl. VAT'
                                            : ' excl. VAT'}
                                    </div>
                                </div>
                                <dl className="flex flex-col">
                                    {specs.map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="flex gap-3 border-t border-portal-hair py-2 text-[13px]"
                                        >
                                            <dt className="flex-1 text-portal-head">
                                                {label}
                                            </dt>
                                            <dd className="font-semibold">
                                                {value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                                <div className="mt-auto flex gap-2">
                                    <Button
                                        variant="primary"
                                        className="flex-1 justify-center"
                                        onClick={() => onEdit('plans', plan)}
                                    >
                                        Edit plan
                                    </Button>
                                    <Button
                                        onClick={() => onToggle('plans', plan)}
                                    >
                                        {plan.status === 'Active'
                                            ? 'Archive'
                                            : 'Restore'}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>

            <section className="flex flex-col gap-3.5">
                <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="flex-1">
                        Private seller listing plans{' '}
                        <span className="ml-1.5 text-[13px] font-medium text-portal-subtle">
                            Once-off per listing · VAT included
                        </span>
                    </CardTitle>
                    <Button
                        variant="primary"
                        onClick={() => onEdit('packs', null)}
                    >
                        <Icon name="plus" size={15} strokeWidth={2.2} />
                        Add listing plan
                    </Button>
                </div>
                <Card className="overflow-hidden">
                    <Table minWidth={860}>
                        <thead>
                            <tr>
                                <Th>Plan</Th>
                                <Th>Deal</Th>
                                <Th>Price</Th>
                                <Th>Advertised for</Th>
                                <Th>Max asking price</Th>
                                <Th>Photos</Th>
                                <Th>Listings</Th>
                                <Th>Status</Th>
                                <Th />
                            </tr>
                        </thead>
                        <tbody>
                            {data.packs.map((pack) => (
                                <tr
                                    key={pack.id}
                                    className={cn(
                                        pack.status !== 'Active' &&
                                            'opacity-55',
                                    )}
                                >
                                    <Td className="font-semibold">
                                        {pack.name}
                                    </Td>
                                    <Td>
                                        {pack.deal === 'Rent'
                                            ? 'To rent'
                                            : 'For sale'}
                                    </Td>
                                    <Td className="font-semibold whitespace-nowrap">
                                        {zar(pack.price)}
                                    </Td>
                                    <Td>{pack.months} months</Td>
                                    <Td>
                                        {pack.max ? zar(pack.max) : 'No limit'}
                                    </Td>
                                    <Td>Up to {pack.photos}</Td>
                                    <Td>
                                        {
                                            data.listings.filter(
                                                (listing) =>
                                                    listing.plan === pack.id,
                                            ).length
                                        }
                                    </Td>
                                    <Td>
                                        <StatusBadge
                                            status={pack.status}
                                            toneOverrides={{
                                                Active: 'success',
                                                Archived: 'neutral',
                                            }}
                                        />
                                    </Td>
                                    <Td>
                                        <div className="flex justify-end gap-1.5">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    onEdit('packs', pack)
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    onToggle('packs', pack)
                                                }
                                            >
                                                {pack.status === 'Active'
                                                    ? 'Archive'
                                                    : 'Restore'}
                                            </Button>
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            </section>

            <section className="flex flex-col gap-3.5">
                <CardTitle>
                    Other fees{' '}
                    <span className="ml-1.5 text-[13px] font-medium text-portal-subtle">
                        VAT included · applies to sellers and agencies
                    </span>
                </CardTitle>
                <Card className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 p-5">
                    <Field
                        label="Tenant screening (R, per completed screening)"
                        hint={`${completedScreenings} completed screenings · ${zarCents(screeningRevenue)} collected`}
                    >
                        <TextInput
                            type="number"
                            min="0"
                            value={data.fees.screening}
                            onChange={(event) =>
                                onFeeChange('screening', event.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="Featured credit top-up (R, per credit)"
                        hint="Agencies buy extra credits once their monthly credits run out."
                    >
                        <TextInput
                            type="number"
                            min="0"
                            value={data.fees.credit}
                            onChange={(event) =>
                                onFeeChange('credit', event.target.value)
                            }
                        />
                    </Field>
                </Card>
            </section>
        </>
    );
}
