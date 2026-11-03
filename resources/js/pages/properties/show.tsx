import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    AreaIcon,
    BathIcon,
    BedIcon,
    ChevronLeftIcon,
    GarageIcon,
    HeartIcon,
    HouseIcon,
    MapIcon,
    PlusIcon,
} from '@/components/site/icons';
import { bondTerms, useBondCalculator } from '@/hooks/use-bond-calculator';
import {
    agentPortrait,
    showcaseGallery,
    showcaseThumbnails,
} from '@/lib/listings';
import type { SearchMode } from '@/lib/listings';
import { index as propertiesIndex } from '@/routes/properties';

type PropertiesShowProps = {
    mode: SearchMode;
    reference: string;
};

const ShieldIcon = () => (
    <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
    </svg>
);

const lineIcon = (paths: ReactNode) => (
    <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {paths}
    </svg>
);

const features: { label: string; icon: ReactNode }[] = [
    {
        label: 'Fibre internet ready',
        icon: lineIcon(
            <>
                <path d="M5 13a10 10 0 0 1 14 0" />
                <path d="M8.5 16.5a5.5 5.5 0 0 1 7 0" />
                <circle cx="12" cy="20" r="1.2" />
            </>,
        ),
    },
    {
        label: 'Unfurnished',
        icon: lineIcon(
            <>
                <path d="M4 18v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
                <path d="M6 11V7h12v4" />
            </>,
        ),
    },
    {
        label: 'No pets allowed',
        icon: lineIcon(
            <>
                <circle cx="8" cy="9" r="2" />
                <circle cx="16" cy="9" r="2" />
                <path d="M12 20c-3 0-5-2-5-4s2-3 5-3 5 1 5 3-2 4-5 4Z" />
            </>,
        ),
    },
    { label: '24-hour access control', icon: <ShieldIcon /> },
    {
        label: 'Single garage',
        icon: lineIcon(
            <>
                <path d="M5 17h14" />
                <path d="M6 17v-4l2-5h8l2 5v4" />
            </>,
        ),
    },
    {
        label: 'En-suite main bedroom',
        icon: lineIcon(
            <>
                <path d="M3 18v-5h18v5" />
                <path d="M3 13V8" />
                <circle cx="7.5" cy="10" r="1.8" />
            </>,
        ),
    },
];

const card = 'rounded-lg border border-m243-line bg-white p-5 lg:p-[26px]';
const cardTitle =
    'text-[19px] font-extrabold tracking-[-.015em] text-m243-navy';
const field =
    'flex h-[50px] items-center gap-1.5 rounded-md border border-m243-line-strong px-3.5';
const fieldInput =
    'min-w-0 flex-1 border-0 bg-transparent text-[15.5px] font-medium text-m243-ink outline-none';

export default function PropertiesShow({
    mode,
    reference,
}: PropertiesShowProps) {
    const isRent = mode === 'rent';
    const [isSaved, setIsSaved] = useState(false);
    const bond = useBondCalculator();
    const resultsUrl = propertiesIndex.url(
        isRent ? { query: { mode: 'rent' } } : undefined,
    );
    const title = `3 bedroom apartment ${isRent ? 'to rent' : 'for sale'} in Raslouw`;
    const price = isRent ? 'R 11 250' : 'R 1 450 000';

    const details: { label: string; value: string; icon: ReactNode }[] = [
        {
            label: 'Listing number',
            value: reference,
            icon: lineIcon(
                <>
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <path d="M9 8h6M9 12h6M9 16h3" />
                </>,
            ),
        },
        {
            label: 'Property type',
            value: 'Apartment / flat',
            icon: <HouseIcon size={19} />,
        },
        {
            label: 'Listing date',
            value: '21 Sep 2026',
            icon: lineIcon(
                <>
                    <rect x="4" y="5" width="16" height="16" rx="2" />
                    <path d="M8 3v4M16 3v4M4 11h16" />
                </>,
            ),
        },
        { label: 'Floor size', value: '131 m²', icon: <AreaIcon size={19} /> },
        {
            label: isRent ? 'Deposit' : 'Rates and taxes',
            value: isRent ? 'R 11 250' : 'R 1 240 pm',
            icon: lineIcon(
                <>
                    <rect x="3" y="7" width="18" height="11" rx="2" />
                    <circle cx="12" cy="12.5" r="2.4" />
                </>,
            ),
        },
        {
            label: 'Levies',
            value: 'R 1 180',
            icon: lineIcon(
                <>
                    <path d="M4 20h16" />
                    <path d="M6 20V8l6-4 6 4v12" />
                </>,
            ),
        },
        {
            label: 'Occupation',
            value: '01 Nov 2026',
            icon: lineIcon(
                <>
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 8v4.5l3 2" />
                </>,
            ),
        },
        { label: 'Lifestyle', value: 'Security complex', icon: <ShieldIcon /> },
    ];

    return (
        <>
            <Head title={title} />
            <div className="border-b border-m243-line bg-white">
                <nav
                    aria-label="Breadcrumb"
                    className="mx-auto scrollbar-none flex max-w-[1320px] items-center gap-3 overflow-x-auto px-6 py-3 text-[14.5px] font-semibold whitespace-nowrap"
                >
                    <Link
                        href={resultsUrl}
                        className="flex items-center gap-[7px] font-bold text-m243-blue"
                    >
                        <ChevronLeftIcon size={17} strokeWidth={2.3} />
                        Back to results
                    </Link>
                    <span className="h-4 w-px bg-m243-line" />
                    <Link href={resultsUrl} className="text-m243-blue">
                        Property to {isRent ? 'Rent' : 'Buy'}
                    </Link>
                    {['Gauteng', 'Centurion', 'Raslouw'].map((crumb) => (
                        <span key={crumb} className="flex items-center gap-3">
                            <span className="text-m243-mist">&gt;</span>
                            <a href="#" className="text-m243-blue">
                                {crumb}
                            </a>
                        </span>
                    ))}
                    <span className="text-m243-mist">&gt;</span>
                    <span className="text-m243-steel" aria-current="page">
                        {reference}
                    </span>
                </nav>
            </div>

            <section className="bg-m243-soft px-3 pt-4 pb-12 lg:px-6 lg:pt-6 lg:pb-[72px]">
                <div className="mx-auto max-w-[1320px]">
                    <div className="grid gap-2 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
                        <img
                            src={showcaseGallery[0]}
                            alt={title}
                            className="h-60 w-full rounded-tl-lg rounded-tr-lg object-cover lg:h-[440px] lg:rounded-tr-none"
                        />
                        <div className="hidden h-[440px] grid-rows-2 gap-2 lg:grid">
                            <img
                                src={showcaseGallery[1]}
                                alt=""
                                className="size-full rounded-tr-lg object-cover"
                            />
                            <div className="relative overflow-hidden">
                                <img
                                    src={showcaseGallery[2]}
                                    alt=""
                                    className="size-full object-cover"
                                />
                                <span className="pointer-events-none absolute right-3 bottom-3 rounded-[5px] bg-white/94 px-[13px] py-2 text-[13.5px] font-bold text-m243-navy">
                                    See all 16 images
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-b-lg bg-m243-navy px-[18px] py-3 text-[14.5px]">
                        <span className="flex items-center gap-2 font-bold text-white">
                            <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#F7D618"
                                strokeWidth="1.9"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="2"
                                />
                                <path d="m6 16 4-5 3 3 2-2 3 4" />
                            </svg>
                            Photos (16)
                        </span>
                        <span className="flex items-center gap-2 font-semibold text-white/82">
                            <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.9"
                                aria-hidden="true"
                            >
                                <rect x="4" y="4" width="7" height="7" />
                                <rect x="13" y="4" width="7" height="7" />
                                <rect x="4" y="13" width="7" height="7" />
                                <rect x="13" y="13" width="7" height="7" />
                            </svg>
                            Photo grid
                        </span>
                        <span className="flex items-center gap-2 font-semibold text-white/82">
                            <MapIcon size={17} />
                            Map
                        </span>
                        <div className="ml-auto flex items-center gap-4">
                            <button
                                type="button"
                                className="flex cursor-pointer items-center gap-2 font-semibold text-white/90"
                            >
                                <svg
                                    width="17"
                                    height="17"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.9"
                                    strokeLinecap="round"
                                    aria-hidden="true"
                                >
                                    <path d="M12 15V4m0 0L8 8m4-4 4 4" />
                                    <path d="M5 14v5h14v-5" />
                                </svg>
                                Share
                            </button>
                            <button
                                type="button"
                                aria-pressed={isSaved}
                                onClick={() => setIsSaved(!isSaved)}
                                className="flex cursor-pointer items-center gap-2 font-bold text-white"
                            >
                                <HeartIcon size={18} filled={isSaved} />
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="flex min-w-0 flex-col gap-[18px]">
                            <div className={card}>
                                <div className="flex flex-wrap items-baseline justify-between gap-3">
                                    <div className="text-[28px] font-extrabold tracking-[-.025em] text-m243-blue lg:text-[34px]">
                                        {price}
                                        {isRent && (
                                            <span className="text-[17px] font-semibold text-m243-slate">
                                                {' '}
                                                / month
                                            </span>
                                        )}
                                    </div>
                                    <span className="rounded-full bg-m243-sky px-[13px] py-[7px] text-[11.5px] font-extrabold tracking-[.06em] text-m243-blue uppercase">
                                        {isRent
                                            ? 'Available now'
                                            : 'Immediate occupation'}
                                    </span>
                                </div>
                                <h1 className="mt-3.5 text-[22px] leading-tight font-extrabold tracking-[-.02em] text-pretty text-m243-navy lg:text-[26px]">
                                    {title}
                                </h1>
                                <div className="mt-2 text-base font-semibold text-m243-slate">
                                    258 Ephrams View, 1 Erasmus Avenue, Raslouw,
                                    Centurion
                                </div>
                                <div className="mt-[18px] flex flex-wrap gap-[22px] border-t border-m243-hair pt-[18px] text-base font-bold text-m243-navy">
                                    {(
                                        [
                                            [BedIcon, '3 beds'],
                                            [BathIcon, '2 baths'],
                                            [GarageIcon, '1 garage'],
                                            [AreaIcon, '131 m²'],
                                        ] as const
                                    ).map(([Icon, label]) => (
                                        <span
                                            key={label}
                                            className="flex items-center gap-2"
                                        >
                                            <Icon size={19} />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={card}>
                                <h2 className={cardTitle}>
                                    Secure three-bedroom apartment in a Raslouw
                                    complex
                                </h2>
                                <p className="mt-3.5 text-[16.5px] leading-[1.6] font-medium text-m243-slate">
                                    This well-appointed apartment offers
                                    comfortable living inside a secure Raslouw
                                    complex. With 131 m² of floor area it suits
                                    families and professionals who want space
                                    without leaving Centurion's main routes
                                    behind.
                                </p>
                                <p className="mt-3 text-[16.5px] leading-[1.6] font-medium text-m243-slate">
                                    The unit has an en-suite main bedroom, an
                                    open-plan lounge and dining area, a single
                                    garage and a fibre connection already
                                    installed. Access control runs 24 hours with
                                    security patrols on site.
                                </p>
                                <button
                                    type="button"
                                    className="mt-4 flex cursor-pointer items-center gap-2 text-base font-bold text-m243-blue"
                                >
                                    <PlusIcon size={17} strokeWidth={2.3} />
                                    Show more
                                </button>
                            </div>

                            <div className={card}>
                                <h2 className={cardTitle}>Property details</h2>
                                <dl className="mt-2 grid gap-x-8 lg:grid-cols-2">
                                    {details.map((detail) => (
                                        <div
                                            key={detail.label}
                                            className="flex items-start gap-3 border-b border-m243-hair py-3.5"
                                        >
                                            <span className="mt-px flex-none text-m243-blue">
                                                {detail.icon}
                                            </span>
                                            <dt className="flex-1 text-[15.5px] font-semibold text-m243-slate">
                                                {detail.label}
                                            </dt>
                                            <dd className="text-right text-[15.5px] font-extrabold text-m243-navy">
                                                {detail.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>

                            <div className={card}>
                                <h2 className={cardTitle}>Features</h2>
                                <ul className="mt-4 grid gap-x-6 gap-y-3.5 lg:grid-cols-2">
                                    {features.map((feature) => (
                                        <li
                                            key={feature.label}
                                            className="flex items-center gap-[11px]"
                                        >
                                            <span className="flex-none text-m243-blue">
                                                {feature.icon}
                                            </span>
                                            <span className="text-[15.5px] font-semibold text-m243-ink">
                                                {feature.label}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={card}>
                                <div className="flex items-baseline justify-between gap-4">
                                    <h2 className={cardTitle}>Photo gallery</h2>
                                    <a
                                        href="#"
                                        className="text-[15.5px] font-bold text-m243-blue"
                                    >
                                        View all
                                    </a>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                                    {showcaseThumbnails.map(
                                        (thumbnail, index) => (
                                            <div
                                                key={thumbnail}
                                                className="relative h-[110px] overflow-hidden rounded-md lg:h-[140px]"
                                            >
                                                <img
                                                    src={thumbnail}
                                                    alt=""
                                                    loading="lazy"
                                                    className="size-full object-cover"
                                                />
                                                {index ===
                                                    showcaseThumbnails.length -
                                                        1 && (
                                                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-m243-navy/62 text-xl font-extrabold text-white">
                                                        +8
                                                    </span>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            {!isRent && (
                                <div className={card}>
                                    <h2 className={cardTitle}>
                                        Bond calculator
                                    </h2>
                                    <div className="mt-4 grid items-start gap-[18px] lg:grid-cols-2">
                                        <div className="flex flex-col gap-3.5">
                                            {(
                                                [
                                                    [
                                                        'Purchase price',
                                                        bond.price,
                                                        bond.setPrice,
                                                    ],
                                                    [
                                                        'Deposit',
                                                        bond.deposit,
                                                        bond.setDeposit,
                                                    ],
                                                ] as const
                                            ).map(
                                                ([label, value, setValue]) => (
                                                    <label key={label}>
                                                        <span className="text-[14.5px] font-bold text-m243-slate">
                                                            {label}
                                                        </span>
                                                        <span
                                                            className={`mt-[7px] ${field}`}
                                                        >
                                                            <span className="text-[15.5px] font-bold text-m243-slate">
                                                                R
                                                            </span>
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                value={value}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setValue(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                className={
                                                                    fieldInput
                                                                }
                                                            />
                                                        </span>
                                                    </label>
                                                ),
                                            )}
                                            <div className="grid grid-cols-2 gap-3">
                                                <label>
                                                    <span className="text-[14.5px] font-bold text-m243-slate">
                                                        Interest rate
                                                    </span>
                                                    <span
                                                        className={`mt-[7px] ${field}`}
                                                    >
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            value={bond.rate}
                                                            onChange={(event) =>
                                                                bond.setRate(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={
                                                                fieldInput
                                                            }
                                                        />
                                                        <span className="text-[15.5px] font-bold text-m243-slate">
                                                            %
                                                        </span>
                                                    </span>
                                                </label>
                                                <label>
                                                    <span className="text-[14.5px] font-bold text-m243-slate">
                                                        Loan term
                                                    </span>
                                                    <select
                                                        value={bond.term}
                                                        onChange={(event) =>
                                                            bond.setTerm(
                                                                event.target
                                                                    .value as typeof bond.term,
                                                            )
                                                        }
                                                        className="mt-[7px] h-[50px] w-full cursor-pointer appearance-none rounded-md border border-m243-line-strong bg-white px-3 text-[15.5px] font-semibold text-m243-ink"
                                                    >
                                                        {bondTerms.map(
                                                            (term) => (
                                                                <option
                                                                    key={term}
                                                                    value={term}
                                                                >
                                                                    {term} years
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="rounded-md bg-m243-soft p-5">
                                            <div className="text-[13px] font-extrabold tracking-[.06em] text-m243-slate uppercase">
                                                Monthly repayment
                                            </div>
                                            <div
                                                className="mt-1.5 text-[32px] font-extrabold tracking-[-.025em] text-m243-navy"
                                                aria-live="polite"
                                            >
                                                {bond.monthlyLabel}
                                            </div>
                                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-m243-line pt-4">
                                                <span className="text-[15px] font-semibold text-m243-slate">
                                                    Loan value
                                                </span>
                                                <span className="text-[15.5px] font-extrabold text-m243-navy">
                                                    {bond.loanLabel}
                                                </span>
                                            </div>
                                            <div className="mt-2.5 flex items-center justify-between gap-3">
                                                <span className="text-[15px] font-semibold text-m243-slate">
                                                    Term
                                                </span>
                                                <span className="text-[15.5px] font-extrabold text-m243-navy">
                                                    {bond.term} years
                                                </span>
                                            </div>
                                            <a
                                                href="#"
                                                className="mt-4 inline-block text-[15.5px] font-bold text-m243-blue"
                                            >
                                                Can I afford this?
                                            </a>
                                        </div>
                                    </div>
                                    <p className="mt-3.5 text-[13.5px] leading-normal font-medium text-m243-slate">
                                        Estimate only, at the current prime rate
                                        and excluding rates, levies and
                                        insurance.
                                    </p>
                                </div>
                            )}
                        </div>

                        <aside className="flex min-w-0 flex-col gap-[18px]">
                            <div className="rounded-lg border border-m243-line bg-white p-[22px]">
                                <div className="flex items-center gap-3.5">
                                    <img
                                        src={agentPortrait}
                                        alt="Megan Kruger"
                                        className="size-[58px] rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="text-[13px] font-extrabold tracking-[.06em] text-m243-slate uppercase">
                                            Contact agent
                                        </div>
                                        <div className="mt-[3px] text-[17.5px] font-extrabold text-m243-navy">
                                            Megan Kruger
                                        </div>
                                        <div className="text-[14.5px] font-semibold text-m243-slate">
                                            Keystone Properties
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-[18px] flex flex-col gap-2.5">
                                    <button
                                        type="button"
                                        className="flex h-[50px] cursor-pointer items-center justify-center gap-[9px] rounded-md border border-m243-blue bg-white text-[15.5px] font-bold text-m243-blue hover:bg-m243-sky"
                                    >
                                        <svg
                                            width="17"
                                            height="17"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.9"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Z" />
                                        </svg>
                                        Show contact number
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-[50px] cursor-pointer items-center justify-center gap-[9px] rounded-md border border-m243-line-strong bg-white text-[15.5px] font-bold text-m243-navy hover:border-m243-blue hover:text-m243-blue"
                                    >
                                        <svg
                                            width="17"
                                            height="17"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.9"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.2-4.6A9 9 0 1 1 21 12Z" />
                                        </svg>
                                        Chat on WhatsApp
                                    </button>
                                </div>
                                <form
                                    onSubmit={(event) => event.preventDefault()}
                                    className="mt-[18px] flex flex-col gap-2.5 border-t border-m243-hair pt-[18px]"
                                >
                                    {(
                                        [
                                            [
                                                'Your name',
                                                'text',
                                                lineIcon(
                                                    <>
                                                        <circle
                                                            cx="12"
                                                            cy="9"
                                                            r="3.2"
                                                        />
                                                        <path d="M5 20c0-3.3 3-5.5 7-5.5s7 2.2 7 5.5" />
                                                    </>,
                                                ),
                                            ],
                                            [
                                                'Your email',
                                                'email',
                                                lineIcon(
                                                    <>
                                                        <rect
                                                            x="3"
                                                            y="6"
                                                            width="18"
                                                            height="12"
                                                            rx="2"
                                                        />
                                                        <path d="m4 8 8 5 8-5" />
                                                    </>,
                                                ),
                                            ],
                                            [
                                                'Your mobile number',
                                                'tel',
                                                lineIcon(
                                                    <>
                                                        <rect
                                                            x="7"
                                                            y="3"
                                                            width="10"
                                                            height="18"
                                                            rx="2"
                                                        />
                                                        <path d="M11 18h2" />
                                                    </>,
                                                ),
                                            ],
                                        ] as const
                                    ).map(([placeholder, type, icon]) => (
                                        <label
                                            key={placeholder}
                                            className={`${field} gap-2.5`}
                                        >
                                            <span className="flex-none text-m243-steel">
                                                {icon}
                                            </span>
                                            <input
                                                type={type}
                                                placeholder={placeholder}
                                                aria-label={placeholder}
                                                className={fieldInput}
                                            />
                                        </label>
                                    ))}
                                    <textarea
                                        rows={3}
                                        aria-label="Message"
                                        defaultValue="I'm interested in this property, please get in touch."
                                        className="w-full resize-y rounded-md border border-m243-line-strong px-3.5 py-3 text-[15.5px] font-medium text-m243-ink"
                                    />
                                    <button
                                        type="submit"
                                        className="h-[52px] cursor-pointer rounded-md bg-m243-red text-[16.5px] font-bold text-white hover:bg-m243-red-dark"
                                    >
                                        Send message
                                    </button>
                                    <p className="text-[12.5px] leading-normal font-medium text-m243-slate">
                                        By sending this message you accept our{' '}
                                        <a
                                            href="#"
                                            className="font-bold text-m243-blue"
                                        >
                                            terms
                                        </a>{' '}
                                        and{' '}
                                        <a
                                            href="#"
                                            className="font-bold text-m243-blue"
                                        >
                                            privacy policy
                                        </a>
                                        .
                                    </p>
                                </form>
                            </div>

                            <div className="flex flex-col gap-3.5 rounded-lg border border-m243-line bg-white p-[22px]">
                                <div className="flex h-14 items-center justify-center rounded-md bg-m243-sky text-[17px] font-extrabold tracking-[-.01em] text-m243-blue">
                                    Keystone Properties
                                </div>
                                <div className="text-[14.5px] font-semibold text-m243-slate">
                                    Letting specialists in Centurion and
                                    Pretoria East since 2011 · 64 active
                                    listings
                                </div>
                                <a
                                    href="#"
                                    className="text-[15.5px] font-bold text-m243-blue"
                                >
                                    View agency listings
                                </a>
                            </div>

                            <div className="flex flex-col gap-3.5 rounded-lg border border-m243-line bg-white p-[22px] text-[15.5px] font-bold text-m243-blue">
                                {(
                                    [
                                        [
                                            'Report this listing',
                                            <path
                                                key="p"
                                                d="M5 21V4h9l1 2h5v9h-6l-1-2H5"
                                            />,
                                        ],
                                        [
                                            'Listing quality score',
                                            <path
                                                key="p"
                                                d="M4 19V9M10 19V5M16 19v-7M22 19H2"
                                            />,
                                        ],
                                        [
                                            'Print or download brochure',
                                            <>
                                                <path d="M7 9V4h10v5" />
                                                <rect
                                                    x="5"
                                                    y="9"
                                                    width="14"
                                                    height="7"
                                                    rx="1"
                                                />
                                                <path d="M7 16v4h10v-4" />
                                            </>,
                                        ],
                                    ] as const
                                ).map(([label, icon]) => (
                                    <a
                                        key={label}
                                        href="#"
                                        className="flex items-center gap-2.5"
                                    >
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.9"
                                            strokeLinecap="round"
                                            aria-hidden="true"
                                        >
                                            {icon}
                                        </svg>
                                        {label}
                                    </a>
                                ))}
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
