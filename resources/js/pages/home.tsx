import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import {
    ArrowRightIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CloseIcon,
    MapIcon,
    SearchIcon,
} from '@/components/site/icons';
import {
    BuyIllustration,
    RentIllustration,
    SellIllustration,
} from '@/components/site/illustrations';
import { ListingStats, SaveButton } from '@/components/site/listing-parts';
import SearchModal from '@/components/site/search-modal';
import SiteFooter from '@/components/site/site-footer';
import { bondTerms, useBondCalculator } from '@/hooks/use-bond-calculator';
import {
    agents,
    articles,
    developments,
    featuredForSale,
    featuredToRent,
    heroImage,
    popularAreas,
    sellImage,
} from '@/lib/listings';
import type { ListingSummary, SearchMode } from '@/lib/listings';
import { cn } from '@/lib/utils';
import { index as propertiesIndex } from '@/routes/properties';

const heroTabs = ['Buy', 'Rent', 'Developments', 'Agents', 'Sold Prices'];

const initialAreas = ['Garsfontein', 'Waterkloof', 'Menlyn', 'Faerie Glen'];

const quickLinks: { label: string; icon: ReactNode }[] = [
    {
        label: 'Property advice',
        icon: (
            <>
                <path d="M20 15a3 3 0 0 1-3 3H9l-4 3v-6a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3Z" />
                <path d="M12.5 9.5 9 6.2A2 2 0 1 1 12.5 4a2 2 0 1 1 3.5 2.2L12.5 9.5Z" />
            </>
        ),
    },
    {
        label: 'Bond calculator',
        icon: (
            <>
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M8 7h8" />
                <path d="M8.5 11.5h0M12 11.5h0M15.5 11.5h0M8.5 15h0M12 15h0M15.5 15h0M8.5 18.5h4" />
            </>
        ),
    },
    {
        label: 'Find an agent',
        icon: (
            <>
                <circle cx="10" cy="9" r="3.5" />
                <path d="M4 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
                <path d="m17.5 15.5 3 3" />
            </>
        ),
    },
    {
        label: 'Property guides',
        icon: (
            <>
                <path d="M5 4h8a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
                <path d="M16 7h3v13H8" />
                <path d="M8.5 8.5h4M8.5 12h4" />
            </>
        ),
    },
    {
        label: 'Neighbourhoods',
        icon: (
            <>
                <path d="M8 3 3 5v16l5-2 8 2 5-2V3l-5 2-8-2Z" />
                <path d="M8 3v16M16 5v16" />
            </>
        ),
    },
];

const services = [
    {
        title: 'Buy a Property',
        body: 'With thousands of homes for sale across South Africa, we help you find the one that fits.',
        action: 'Search properties',
        tone: 'bg-m243-cream',
        illustration: <BuyIllustration />,
    },
    {
        title: 'Rent a Property',
        body: 'Find a rental you will actually love — or advertise your own place to vetted tenants.',
        action: 'Search rentals',
        tone: 'bg-m243-sky',
        illustration: <RentIllustration />,
    },
    {
        title: 'Sell a Property',
        body: 'List with us and put your property in front of millions of South African buyers.',
        action: 'Get started',
        tone: 'bg-m243-blush',
        illustration: <SellIllustration />,
    },
];

const ownerBenefits = [
    'A free, data-backed valuation of your home in under two minutes',
    'Three vetted agents in your suburb, with their real sales records',
    'Enquiries, viewings and offers tracked in one dashboard',
];

const sectionHeading =
    'text-[29px] leading-[1.1] font-extrabold tracking-[-.025em] text-pretty text-m243-navy lg:text-[42px]';

const eyebrow = 'text-[13px] font-bold tracking-[.08em] uppercase';

function FeaturedListingCard({ listing }: { listing: ListingSummary }) {
    return (
        <article className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(5,41,79,.06),0_6px_18px_rgba(5,41,79,.06)] transition-shadow hover:shadow-[0_14px_36px_rgba(5,41,79,.14)]">
            <div className="relative h-[200px]">
                <img
                    src={listing.image}
                    alt={listing.title}
                    loading="lazy"
                    className="size-full object-cover"
                />
                {listing.badge && (
                    <span
                        className={cn(
                            'absolute top-3 left-3 rounded-[7px] px-[11px] py-1.5 text-[12.5px] font-bold tracking-[.03em] text-white uppercase',
                            listing.badge === 'Featured'
                                ? 'bg-m243-red'
                                : 'bg-m243-blue',
                        )}
                    >
                        {listing.badge}
                    </span>
                )}
                <SaveButton
                    initiallySaved={listing.id === 's2'}
                    className="absolute top-2.5 right-2.5"
                />
            </div>
            <div className="p-5">
                <div className="text-[21px] font-extrabold tracking-[-.02em] text-m243-navy">
                    {listing.price}
                    {listing.priceSuffix && (
                        <span className="text-[15px] font-semibold text-m243-muted">
                            {' '}
                            {listing.priceSuffix}
                        </span>
                    )}
                </div>
                <div className="mt-[5px] text-base font-semibold text-m243-ink">
                    {listing.title}
                </div>
                <div className="mt-0.5 text-[15px] font-medium text-m243-muted">
                    {listing.location}
                </div>
                <ListingStats
                    {...listing}
                    className="mt-4 border-t border-m243-hair pt-4 text-[14.5px] text-m243-muted"
                />
            </div>
        </article>
    );
}

export default function Home() {
    const [heroTab, setHeroTab] = useState('Buy');
    const [searchMode, setSearchMode] = useState<SearchMode>('buy');
    const [areas, setAreas] = useState(initialAreas);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [listingsTab, setListingsTab] = useState<'For Sale' | 'To Rent'>(
        'For Sale',
    );
    const carousel = useRef<HTMLDivElement>(null);
    const bond = useBondCalculator();

    const toggleArea = (area: string): void => {
        setAreas((current) =>
            current.includes(area)
                ? current.filter((item) => item !== area)
                : [...current, area],
        );
    };

    const selectHeroTab = (tab: string): void => {
        setHeroTab(tab);

        if (tab === 'Buy' || tab === 'Rent') {
            setSearchMode(tab === 'Rent' ? 'rent' : 'buy');
        }
    };

    const search = (): void => {
        setIsSearchOpen(false);
        router.visit(
            propertiesIndex.url(
                searchMode === 'rent' ? { query: { mode: 'rent' } } : undefined,
            ),
        );
    };

    const scrollDevelopments = (direction: 1 | -1): void => {
        carousel.current?.scrollBy({
            left: 360 * direction,
            behavior: 'smooth',
        });
    };

    const listings =
        listingsTab === 'For Sale' ? featuredForSale : featuredToRent;

    return (
        <>
            <Head title="Find your next home in Congo DRC" />

            <section className="relative overflow-hidden bg-m243-blue">
                <div className="absolute inset-x-0 top-0 h-[330px] lg:h-[365px]">
                    <img
                        src={heroImage}
                        alt=""
                        className="size-full object-cover"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,41,79,.62),rgba(5,41,79,.48)_55%,rgba(5,41,79,.66))]" />
                </div>
                <div className="relative mx-auto max-w-[1320px] px-5 pt-11 pb-10 lg:px-6 lg:pt-[110px] lg:pb-16">
                    <h1 className="m-0 text-center text-[34px] leading-[1.05] font-extrabold tracking-[-.03em] text-pretty text-white [text-shadow:0_2px_18px_rgba(5,41,79,.35)] lg:text-[58px]">
                        Find your next home in Congo DRC
                    </h1>
                    <p className="mt-3.5 text-center text-[16.5px] leading-normal font-medium text-white/90 lg:text-[19px]">
                        Verified listings from Pretoria to the Cape Winelands.
                    </p>
                    <div className="mt-7 scrollbar-none flex gap-[18px] overflow-x-auto lg:mt-11 lg:justify-center lg:gap-10">
                        {heroTabs.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                aria-pressed={heroTab === tab}
                                onClick={() => selectHeroTab(tab)}
                                className={cn(
                                    'cursor-pointer border-b-[3px] px-0.5 pt-2 pb-3 text-base font-bold whitespace-nowrap lg:text-[19px]',
                                    heroTab === tab
                                        ? 'border-m243-yellow text-white'
                                        : 'border-transparent text-white/82',
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Open search filters"
                        onClick={() => setIsSearchOpen(true)}
                        onKeyDown={(event) => {
                            if (
                                event.target === event.currentTarget &&
                                (event.key === 'Enter' || event.key === ' ')
                            ) {
                                event.preventDefault();
                                setIsSearchOpen(true);
                            }
                        }}
                        className="mt-5 flex cursor-pointer flex-wrap items-center gap-2.5 rounded-lg bg-white p-2.5 shadow-[0_10px_34px_rgba(5,41,79,.26)] lg:mt-[26px] lg:flex-nowrap"
                    >
                        <SearchIcon
                            size={20}
                            className="ml-2 flex-none text-m243-slate"
                        />
                        <div className="flex min-w-[160px] flex-1 flex-wrap items-center gap-2">
                            {areas.map((area) => (
                                <span
                                    key={area}
                                    className="flex items-center gap-2 rounded bg-m243-sky px-3 py-[9px] text-[15px] font-bold whitespace-nowrap text-m243-blue"
                                >
                                    {area}
                                    <button
                                        type="button"
                                        aria-label={`Remove ${area}`}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            toggleArea(area);
                                        }}
                                        className="flex cursor-pointer"
                                    >
                                        <CloseIcon
                                            size={14}
                                            strokeWidth={2.4}
                                        />
                                    </button>
                                </span>
                            ))}
                            <span className="text-[14.5px] font-bold whitespace-nowrap text-m243-slate">
                                +3
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={(event) => event.stopPropagation()}
                            className="hidden h-[52px] flex-none cursor-pointer items-center gap-2 rounded border border-m243-line-strong bg-white px-[18px] text-[15.5px] font-bold text-m243-navy hover:border-m243-blue hover:text-m243-blue lg:flex"
                        >
                            Map
                            <MapIcon size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                search();
                            }}
                            className="h-[52px] flex-[1_1_100%] cursor-pointer rounded bg-m243-red px-11 text-[16.5px] font-bold text-white hover:bg-m243-red-dark lg:flex-none"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-14 lg:px-6 lg:py-[88px]">
                <div className="mx-auto max-w-[1200px]">
                    <h2 className={cn(sectionHeading, 'max-w-[620px]')}>
                        Everything property, all in one place
                    </h2>
                    <p className="mt-3.5 max-w-[560px] text-[17px] leading-[1.55] font-medium text-m243-muted">
                        From your first viewing to the bond approval — and the
                        agent who gets you there.
                    </p>
                    <div className="mt-10 grid gap-6 lg:grid-cols-3">
                        {services.map((service) => (
                            <div
                                key={service.title}
                                className={cn(
                                    'overflow-hidden rounded-[18px] pb-7',
                                    service.tone,
                                )}
                            >
                                <div className="h-60">
                                    {service.illustration}
                                </div>
                                <div className="px-7 pt-7">
                                    <h3 className="text-[22px] font-extrabold tracking-[-.015em] text-m243-navy">
                                        {service.title}
                                    </h3>
                                    <p className="mt-3.5 text-[16.5px] leading-normal font-medium text-m243-body">
                                        {service.body}
                                    </p>
                                    <a
                                        href="#"
                                        className="mt-[18px] inline-block text-[16.5px] font-bold text-m243-blue hover:text-m243-red"
                                    >
                                        {service.action}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                        {quickLinks.map((link) => (
                            <a
                                key={link.label}
                                href="#"
                                className="flex items-center gap-3.5 rounded-[14px] border border-m243-line bg-white px-5 py-[18px] shadow-[0_1px_2px_rgba(5,41,79,.05)] hover:border-m243-blue hover:shadow-[0_8px_22px_rgba(5,41,79,.1)]"
                            >
                                <span className="flex size-[42px] flex-none items-center justify-center rounded-[11px] bg-m243-blush">
                                    <svg
                                        width="21"
                                        height="21"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#A60C1A"
                                        strokeWidth="1.9"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        {link.icon}
                                    </svg>
                                </span>
                                <span className="text-[16.5px] font-bold tracking-[-.01em] text-m243-blue">
                                    {link.label}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-m243-soft px-5 py-14 lg:px-6 lg:py-[88px]">
                <div className="mx-auto max-w-[1200px]">
                    <div className="flex flex-wrap items-end justify-between gap-5">
                        <div>
                            <h2 className={sectionHeading}>
                                Featured listings
                            </h2>
                            <p className="mt-3 text-[17px] font-medium text-m243-muted">
                                Hand-picked this week by our listing team.
                            </p>
                        </div>
                        <div className="flex gap-1 rounded-xl bg-m243-track p-1">
                            {(['For Sale', 'To Rent'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    aria-pressed={listingsTab === tab}
                                    onClick={() => setListingsTab(tab)}
                                    className={cn(
                                        'cursor-pointer rounded-full px-[18px] py-2.5 text-[15px] font-bold whitespace-nowrap transition-colors',
                                        listingsTab === tab
                                            ? 'bg-white text-m243-navy shadow-[0_1px_3px_rgba(5,41,79,.16)]'
                                            : 'text-m243-slate',
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {listings.map((listing) => (
                            <FeaturedListingCard
                                key={listing.id}
                                listing={listing}
                            />
                        ))}
                    </div>
                    <a
                        href={propertiesIndex.url()}
                        className="mt-7 inline-flex items-center gap-[7px] text-[16.5px] font-bold text-m243-blue"
                    >
                        View all listings
                        <ArrowRightIcon size={17} />
                    </a>
                </div>
            </section>

            <section className="overflow-hidden bg-white px-5 py-14 lg:px-6 lg:py-[88px]">
                <div className="mx-auto max-w-[1200px]">
                    <div className="flex items-end justify-between gap-5">
                        <div>
                            <span className={cn(eyebrow, 'text-m243-red')}>
                                Spotlight
                            </span>
                            <h2 className={cn(sectionHeading, 'mt-2.5')}>
                                New developments
                            </h2>
                            <p className="mt-3 max-w-[520px] text-[17px] font-medium text-m243-muted">
                                Buy off-plan and pay no transfer duty — launch
                                pricing while units last.
                            </p>
                        </div>
                        <div className="hidden flex-none gap-2 lg:flex">
                            {(
                                [
                                    [-1, 'Previous', ChevronLeftIcon],
                                    [1, 'Next', ChevronRightIcon],
                                ] as const
                            ).map(([direction, label, Icon]) => (
                                <button
                                    key={label}
                                    type="button"
                                    aria-label={label}
                                    onClick={() =>
                                        scrollDevelopments(direction)
                                    }
                                    className="flex size-[46px] cursor-pointer items-center justify-center rounded-full border border-m243-line-strong bg-white text-m243-navy hover:border-m243-blue hover:bg-m243-soft"
                                >
                                    <Icon size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div
                        ref={carousel}
                        className="mt-8 scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1"
                    >
                        {developments.map((development) => (
                            <article
                                key={development.name}
                                className="w-[300px] flex-none snap-start overflow-hidden rounded-2xl border border-m243-line bg-white lg:w-[340px]"
                            >
                                <img
                                    src={development.image}
                                    alt={development.name}
                                    loading="lazy"
                                    className="h-[210px] w-full object-cover"
                                />
                                <div className="p-5">
                                    <div className="text-[19px] font-bold tracking-[-.01em] text-m243-navy">
                                        {development.name}
                                    </div>
                                    <div className="mt-[3px] text-[15px] font-medium text-m243-muted">
                                        {development.location}
                                    </div>
                                    <div className="mt-[18px] flex items-center justify-between border-t border-m243-hair pt-4">
                                        <span className="text-[17px] font-extrabold text-m243-blue">
                                            From {development.priceFrom}
                                        </span>
                                        <span className="rounded-[7px] bg-m243-soft px-2.5 py-1.5 text-[13.5px] font-bold text-m243-muted">
                                            {development.units} units
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-m243-navy">
                <div className="mx-auto grid max-w-[1200px] items-stretch lg:grid-cols-2">
                    <div className="relative min-h-[260px] overflow-hidden lg:min-h-[520px]">
                        <img
                            src={sellImage}
                            alt="Owner handing over house keys"
                            loading="lazy"
                            className="absolute inset-0 size-full -translate-x-[10%] -translate-y-[12.5%] scale-[1.35] object-cover"
                        />
                        <a
                            href="https://www.pexels.com/@pavel-danilyuk/"
                            target="_blank"
                            rel="noreferrer"
                            className="absolute bottom-2 left-2 rounded bg-black/45 px-2 py-0.5 text-[11px] text-white/85"
                        >
                            Photo by Pavel Danilyuk on Pexels
                        </a>
                    </div>
                    <div className="flex flex-col justify-center px-5 pt-12 pb-14 lg:px-16 lg:py-20">
                        <span className={cn(eyebrow, 'text-m243-yellow')}>
                            For owners
                        </span>
                        <h2 className={cn(sectionHeading, 'mt-3 text-white')}>
                            Sell or rent out your property with confidence
                        </h2>
                        <ul className="mt-6 flex flex-col gap-3.5">
                            {ownerBenefits.map((benefit) => (
                                <li
                                    key={benefit}
                                    className="flex items-start gap-3"
                                >
                                    <CheckIcon
                                        size={22}
                                        className="mt-0.5 flex-none text-m243-yellow"
                                    />
                                    <span className="text-[17px] leading-[1.45] font-medium text-white/88">
                                        {benefit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href="#"
                                className="rounded-[11px] bg-m243-red px-6 py-[15px] text-[16.5px] font-bold text-white shadow-[0_6px_18px_rgba(206,16,33,.3)] hover:bg-m243-red-dark"
                            >
                                Get a free valuation
                            </a>
                            <a
                                href="#"
                                className="rounded-[11px] border border-white/40 px-6 py-[15px] text-[16.5px] font-bold text-white hover:bg-white/10"
                            >
                                List your property
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-m243-soft px-5 py-14 lg:px-6 lg:py-[88px]">
                <div className="mx-auto grid max-w-[1200px] items-start gap-8 lg:grid-cols-[1fr_1.25fr] lg:gap-14">
                    <div>
                        <span className={cn(eyebrow, 'text-m243-blue')}>
                            Affordability
                        </span>
                        <h2 className={cn(sectionHeading, 'mt-2.5')}>
                            What will the bond actually cost?
                        </h2>
                        <p className="mt-3.5 text-[17px] leading-[1.55] font-medium text-m243-muted">
                            Work out your monthly repayment before you fall in
                            love with a listing. Rates shown are the current
                            prime lending rate — your bank may offer prime less
                            a margin.
                        </p>
                        <a
                            href="#"
                            className="mt-5 inline-flex items-center gap-[7px] text-[16.5px] font-bold text-m243-blue"
                        >
                            Get pre-approved
                            <ArrowRightIcon size={17} />
                        </a>
                    </div>
                    <div className="rounded-[18px] bg-white p-[22px] shadow-[0_1px_2px_rgba(5,41,79,.06),0_12px_32px_rgba(5,41,79,.08)] lg:p-8">
                        <div className="grid grid-cols-2 gap-4">
                            {(
                                [
                                    [
                                        'Purchase price',
                                        bond.price,
                                        bond.setPrice,
                                        'R',
                                        null,
                                    ],
                                    [
                                        'Deposit',
                                        bond.deposit,
                                        bond.setDeposit,
                                        'R',
                                        null,
                                    ],
                                    [
                                        'Interest rate',
                                        bond.rate,
                                        bond.setRate,
                                        null,
                                        '%',
                                    ],
                                ] as const
                            ).map(
                                ([label, value, setValue, prefix, suffix]) => (
                                    <label
                                        key={label}
                                        className="flex flex-col gap-[7px]"
                                    >
                                        <span className="text-[12.5px] font-bold tracking-[.05em] text-m243-muted uppercase">
                                            {label}
                                        </span>
                                        <span className="flex h-[52px] items-center gap-1.5 rounded-[11px] border border-m243-line-strong px-3.5">
                                            {prefix && (
                                                <span className="text-base font-bold text-m243-muted">
                                                    {prefix}
                                                </span>
                                            )}
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={value}
                                                onChange={(event) =>
                                                    setValue(event.target.value)
                                                }
                                                className="w-full min-w-0 border-0 bg-transparent text-base font-semibold text-m243-ink outline-none"
                                            />
                                            {suffix && (
                                                <span className="text-base font-bold text-m243-muted">
                                                    {suffix}
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                ),
                            )}
                            <label className="flex flex-col gap-[7px]">
                                <span className="text-[12.5px] font-bold tracking-[.05em] text-m243-muted uppercase">
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
                                    className="h-[52px] cursor-pointer appearance-none rounded-[11px] border border-m243-line-strong bg-white px-3 text-base font-semibold text-m243-ink"
                                >
                                    {bondTerms.map((term) => (
                                        <option key={term} value={term}>
                                            {term} years
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-m243-blue p-[22px]">
                            <div>
                                <div className="text-[13px] font-bold tracking-[.06em] text-white/75 uppercase">
                                    Estimated monthly repayment
                                </div>
                                <div
                                    className="mt-1.5 text-[32px] font-extrabold tracking-[-.025em] text-white lg:text-[40px]"
                                    aria-live="polite"
                                >
                                    {bond.monthlyLabel}
                                </div>
                            </div>
                            <div className="max-w-[200px] text-[14.5px] leading-normal font-medium text-white/78">
                                Over {bond.term} years on a {bond.loanLabel}{' '}
                                bond
                            </div>
                        </div>
                        <p className="mt-3.5 text-[13.5px] leading-normal font-medium text-m243-slate">
                            Estimate only, excluding rates, levies and
                            insurance. Final terms depend on your credit
                            profile.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-14 lg:px-6 lg:py-[88px]">
                <div className="mx-auto max-w-[1200px]">
                    <h2 className={sectionHeading}>Popular areas</h2>
                    <p className="mt-3 text-[17px] font-medium text-m243-muted">
                        Where South Africans are searching most this month.
                    </p>
                    <div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-3">
                        {popularAreas.map((area) => (
                            <a
                                key={area.name}
                                href="#"
                                className="relative block h-[150px] overflow-hidden rounded-2xl lg:h-60"
                            >
                                <img
                                    src={area.image}
                                    alt=""
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,41,79,0)_35%,rgba(5,41,79,.82))]" />
                                <span className="pointer-events-none absolute bottom-4 left-[18px]">
                                    <span className="block text-[19px] font-bold tracking-[-.01em] text-white">
                                        {area.name}
                                    </span>
                                    <span className="mt-[3px] block text-[14.5px] font-semibold text-white/82">
                                        {area.listings} listings
                                    </span>
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-m243-soft px-5 py-14 lg:px-6 lg:py-[88px]">
                <div className="mx-auto max-w-[1200px]">
                    <div className="flex flex-wrap items-end justify-between gap-5">
                        <div>
                            <h2 className={sectionHeading}>Find an agent</h2>
                            <p className="mt-3 text-[17px] font-medium text-m243-muted">
                                Top performers by suburb, ranked on properties
                                actually sold.
                            </p>
                        </div>
                        <label className="flex h-[54px] w-full items-center gap-[9px] rounded-xl border border-m243-line-strong bg-white px-4 lg:w-[340px]">
                            <SearchIcon
                                size={18}
                                strokeWidth={1.9}
                                className="flex-none text-m243-muted"
                            />
                            <input
                                type="text"
                                placeholder="Agent name, agency or suburb"
                                aria-label="Agent name, agency or suburb"
                                className="w-full border-0 bg-transparent text-base font-medium text-m243-ink outline-none"
                            />
                        </label>
                    </div>
                    <div className="mt-8 grid gap-5 lg:grid-cols-3">
                        {agents.map((agent) => (
                            <div
                                key={agent.name}
                                className="flex flex-col items-start gap-3.5 rounded-2xl border border-m243-line bg-white p-6"
                            >
                                <img
                                    src={agent.image}
                                    alt={agent.name}
                                    loading="lazy"
                                    className="size-[76px] rounded-full object-cover"
                                />
                                <div>
                                    <div className="text-lg font-bold text-m243-navy">
                                        {agent.name}
                                    </div>
                                    <div className="mt-[3px] text-[15px] font-medium text-m243-muted">
                                        {agent.agency}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 text-[14.5px] font-bold text-m243-blue">
                                    {agent.listings} listings
                                    <span className="size-1 rounded-full bg-m243-line-strong" />
                                    <span className="font-semibold text-m243-muted">
                                        {agent.years} yrs
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-14 lg:px-6 lg:py-[88px]">
                <div className="mx-auto max-w-[1200px]">
                    <h2 className={sectionHeading}>
                        Property advice &amp; news
                    </h2>
                    <p className="mt-3 text-[17px] font-medium text-m243-muted">
                        Plain-language guides for the South African market.
                    </p>
                    <div className="mt-9 grid gap-5 lg:grid-cols-3">
                        {articles.map((article) => (
                            <article
                                key={article.title}
                                className="overflow-hidden rounded-2xl border border-m243-line bg-white"
                            >
                                <img
                                    src={article.image}
                                    alt=""
                                    loading="lazy"
                                    className="h-[190px] w-full object-cover"
                                />
                                <div className="p-[22px]">
                                    <span
                                        className={cn(
                                            'inline-block rounded-[7px] px-2.5 py-[5px] text-[12.5px] font-bold tracking-[.04em] uppercase',
                                            article.tone === 'red'
                                                ? 'bg-m243-blush text-m243-red-dark'
                                                : 'bg-m243-sky text-m243-blue',
                                        )}
                                    >
                                        {article.tag}
                                    </span>
                                    <h3 className="mt-3.5 text-[19px] leading-[1.3] font-bold tracking-[-.01em] text-pretty text-m243-navy">
                                        {article.title}
                                    </h3>
                                    <div className="mt-3.5 text-[14.5px] font-semibold text-m243-muted">
                                        {article.readTime}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <AppPromo />

            <SiteFooter />

            <SearchModal
                open={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                mode={searchMode}
                onModeChange={setSearchMode}
                areas={areas}
                onToggleArea={toggleArea}
                onSearch={search}
            />
        </>
    );
}

function AppPromo() {
    return (
        <section className="overflow-hidden bg-m243-sky px-5 py-14 lg:px-6 lg:py-20">
            <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-2">
                <div>
                    <h2 className={sectionHeading}>
                        Get alerts the moment a listing goes live
                    </h2>
                    <p className="mt-3.5 max-w-[440px] text-[17px] leading-[1.55] font-medium text-m243-body">
                        Save a search, and the Maison243 app pings you before
                        the show day queue forms.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <a
                            href="#"
                            className="flex items-center gap-[11px] rounded-xl bg-m243-navy px-5 py-[13px] text-white hover:bg-m243-navy-hover"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="#fff"
                                aria-hidden="true"
                            >
                                <path d="M12 3c.3 1.6-.8 3.2-2.3 3.4C9.5 4.8 10.7 3.2 12 3Zm4.6 13.2c-.5 1.2-1.6 2.9-2.8 2.9-1 0-1.3-.6-2.4-.6-1.1 0-1.5.6-2.4.6-1.3 0-2.6-2-3.2-3.5-.8-2.1-.5-4.7 1.3-5.8.8-.5 1.8-.5 2.5 0 .5.3.9.3 1.4 0 .8-.5 1.8-.5 2.6 0 .5.3.9.8 1.2 1.3-1.6 1-1.6 3.3.2 4.1-.1.3-.2.7-.4 1Z" />
                            </svg>
                            <span>
                                <span className="block text-[11.5px] font-semibold opacity-75">
                                    Download on the
                                </span>
                                <span className="block text-[16.5px] font-bold tracking-[-.01em]">
                                    App Store
                                </span>
                            </span>
                        </a>
                        <a
                            href="#"
                            className="flex items-center gap-[11px] rounded-xl bg-m243-navy px-5 py-[13px] text-white hover:bg-m243-navy-hover"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="#fff"
                                aria-hidden="true"
                            >
                                <path d="M4 3.5v17l9.3-8.5L4 3.5Zm10.8 7.2 2.6-2.4-11-6.3 8.4 8.7Zm0 2.6-8.4 8.7 11-6.3-2.6-2.4Zm3.9-1.3 2.3-2.1c.7-.4.7-1.4 0-1.8l-2.3-2.1-2.9 2.6 2.9 3.4Z" />
                            </svg>
                            <span>
                                <span className="block text-[11.5px] font-semibold opacity-75">
                                    Get it on
                                </span>
                                <span className="block text-[16.5px] font-bold tracking-[-.01em]">
                                    Google Play
                                </span>
                            </span>
                        </a>
                    </div>
                </div>
                <div
                    className="flex justify-center lg:justify-end"
                    aria-hidden="true"
                >
                    <div className="h-[480px] w-60 flex-none rounded-[38px] bg-m243-navy p-2.5 shadow-[0_24px_60px_rgba(5,41,79,.26)] lg:h-[600px] lg:w-[300px]">
                        <div className="relative size-full overflow-hidden rounded-[30px] bg-white">
                            <div className="absolute inset-0 flex flex-col bg-m243-soft">
                                <div className="bg-m243-navy px-4 pt-[26px] pb-3.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-extrabold tracking-[-.01em] text-white">
                                            Maison
                                            <span className="text-m243-yellow">
                                                243
                                            </span>
                                        </span>
                                        <span className="size-[22px] rounded-full bg-white/18" />
                                    </div>
                                    <div className="mt-3 flex h-[34px] items-center gap-[7px] rounded-[9px] bg-white px-2.5 text-m243-slate">
                                        <SearchIcon
                                            size={13}
                                            strokeWidth={2.2}
                                        />
                                        <span className="text-[11.5px] font-semibold">
                                            Pretoria East
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col gap-2.5 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-extrabold tracking-[.06em] text-m243-slate uppercase">
                                            New today
                                        </span>
                                        <span className="rounded-[5px] bg-m243-red px-[7px] py-[3px] text-[9.5px] font-extrabold tracking-[.04em] text-white">
                                            3 ALERTS
                                        </span>
                                    </div>
                                    {[
                                        [
                                            'R 1 450 000',
                                            '3 bed · Garsfontein',
                                            'bg-[linear-gradient(135deg,#0A5FC2,#05294F)]',
                                        ],
                                        [
                                            'R 2 180 000',
                                            '3 bed · Waterkloof',
                                            'bg-[linear-gradient(135deg,#E3EFFC,#0A5FC2)]',
                                        ],
                                    ].map(([price, summary, gradient]) => (
                                        <div
                                            key={price}
                                            className="overflow-hidden rounded-[11px] bg-white shadow-[0_1px_3px_rgba(5,41,79,.1)]"
                                        >
                                            <div
                                                className={cn(
                                                    'h-[62px]',
                                                    gradient,
                                                )}
                                            />
                                            <div className="px-2.5 py-[9px]">
                                                <div className="text-[12.5px] font-extrabold text-m243-navy">
                                                    {price}
                                                </div>
                                                <div className="mt-0.5 text-[10px] font-semibold text-m243-slate">
                                                    {summary}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between rounded-[11px] bg-m243-sky px-2.5 py-[9px]">
                                        <span className="text-[10.5px] font-bold text-m243-navy">
                                            Saved search · Waterkloof
                                        </span>
                                        <span className="text-[10px] font-bold text-m243-blue">
                                            12 new
                                        </span>
                                    </div>
                                </div>
                                <div className="flex h-[46px] items-center justify-around border-t border-m243-line bg-white">
                                    {[
                                        'bg-m243-blue',
                                        'bg-m243-line-strong',
                                        'bg-m243-line-strong',
                                        'bg-m243-line-strong',
                                    ].map((tone, index) => (
                                        <span
                                            key={index}
                                            className={cn(
                                                'h-[3px] w-[18px] rounded-sm',
                                                tone,
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className="pointer-events-none absolute top-2.5 left-1/2 h-5 w-[78px] -translate-x-1/2 rounded-full bg-m243-navy" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
