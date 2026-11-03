import { Head, Link } from '@inertiajs/react';
import { MapIcon } from '@/components/site/icons';
import { ListingStats, SaveButton } from '@/components/site/listing-parts';
import {
    centurionSuburbs,
    searchResults,
    showcaseReference,
} from '@/lib/listings';
import type { SearchMode } from '@/lib/listings';
import { home } from '@/routes';
import { show } from '@/routes/properties';

type PropertiesIndexProps = {
    mode: SearchMode;
};

export default function PropertiesIndex({ mode }: PropertiesIndexProps) {
    const isRent = mode === 'rent';
    const modeLabel = isRent ? 'Rent' : 'Buy';
    const detailUrl = show.url(
        { reference: showcaseReference },
        isRent ? { query: { mode: 'rent' } } : undefined,
    );

    return (
        <>
            <Head title={`Property to ${modeLabel} in Centurion`} />
            <section className="bg-m243-soft px-5 pt-8 pb-14 lg:px-6 lg:pt-12 lg:pb-20">
                <div className="mx-auto max-w-[1320px]">
                    <h1 className="text-[30px] leading-[1.1] font-extrabold tracking-[-.03em] text-pretty text-m243-navy lg:text-[46px]">
                        Property to {modeLabel} in Centurion
                    </h1>
                    <nav
                        aria-label="Breadcrumb"
                        className="mt-3.5 flex flex-wrap items-center gap-2.5 text-[15px] font-semibold"
                    >
                        <Link
                            href={home()}
                            className="font-bold text-m243-blue"
                        >
                            Property to {modeLabel}
                        </Link>
                        <span className="text-m243-mist">&gt;</span>
                        <a href="#" className="text-m243-blue">
                            Gauteng
                        </a>
                        <span className="text-m243-mist">&gt;</span>
                        <span className="text-m243-steel" aria-current="page">
                            Centurion
                        </span>
                    </nav>

                    <div className="mt-[34px] grid grid-flow-row grid-cols-2 gap-x-7 gap-y-2.5 lg:grid-flow-col lg:grid-cols-5 lg:grid-rows-3">
                        {centurionSuburbs.map((suburb) => (
                            <a
                                key={suburb}
                                href="#"
                                className="text-[15.5px] font-semibold text-m243-navy hover:text-m243-red"
                            >
                                {suburb}
                            </a>
                        ))}
                    </div>
                    <a
                        href="#"
                        className="mt-[26px] inline-block text-base font-bold text-m243-blue hover:text-m243-red"
                    >
                        All areas in Centurion
                    </a>

                    <div className="mt-[30px] grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="flex min-w-0 flex-col gap-[18px]">
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-m243-line bg-white px-[22px] py-[18px]">
                                <div className="text-[16.5px] font-medium text-m243-slate">
                                    <strong className="font-extrabold text-m243-navy">
                                        53
                                    </strong>{' '}
                                    results
                                </div>
                                <label className="flex items-center gap-2.5 text-[15.5px] font-bold text-m243-navy">
                                    Sort by
                                    <select
                                        defaultValue="Default"
                                        className="h-11 cursor-pointer appearance-none rounded-md border border-m243-line-strong bg-white px-3 text-[15.5px] font-semibold text-m243-ink"
                                    >
                                        <option>Default</option>
                                        <option>Newest first</option>
                                        <option>Price: low to high</option>
                                        <option>Price: high to low</option>
                                    </select>
                                </label>
                            </div>

                            {searchResults.map((result, index) => (
                                <article
                                    key={result.address}
                                    className="relative grid overflow-hidden rounded-lg border border-m243-line bg-white lg:grid-cols-[320px_minmax(0,1fr)]"
                                >
                                    <div className="relative min-h-[200px] lg:min-h-60">
                                        <img
                                            src={result.image}
                                            alt=""
                                            loading="lazy"
                                            className="absolute inset-0 size-full object-cover"
                                        />
                                        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-m243-blue px-[11px] py-1.5 text-[11.5px] font-extrabold tracking-[.06em] text-white uppercase">
                                            {isRent
                                                ? 'Available now'
                                                : 'New listing'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-[7px] px-[22px] py-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="text-[23px] font-extrabold tracking-[-.02em] text-m243-blue">
                                                {result.prices[mode]}
                                            </div>
                                            <div className="text-right text-[11.5px] leading-[1.35] font-extrabold tracking-[.06em] text-m243-slate uppercase">
                                                {result.agency}
                                            </div>
                                        </div>
                                        <div className="text-base font-semibold text-m243-slate">
                                            {result.type}
                                        </div>
                                        <h2 className="text-[16.5px] font-bold text-m243-navy">
                                            <Link
                                                href={detailUrl}
                                                className="after:absolute after:inset-0 after:content-['']"
                                            >
                                                {result.suburb}
                                            </Link>
                                        </h2>
                                        <div className="text-[15.5px] font-medium text-m243-slate">
                                            {result.address}
                                        </div>
                                        <p className="mt-1 text-[15.5px] leading-normal font-medium text-m243-slate">
                                            {result.description[mode]}
                                        </p>
                                        <div className="mt-auto flex items-center gap-4 pt-3.5">
                                            <ListingStats
                                                {...result}
                                                iconSize={18}
                                                className="gap-4 text-[15px] text-m243-slate"
                                            />
                                            <SaveButton
                                                variant="outlined"
                                                initiallySaved={index === 1}
                                                className="relative z-10 ml-auto"
                                            />
                                        </div>
                                    </div>
                                </article>
                            ))}

                            <button
                                type="button"
                                className="h-14 cursor-pointer rounded-md border border-m243-blue bg-white text-[16.5px] font-bold text-m243-blue hover:bg-m243-sky"
                            >
                                Load more listings
                            </button>
                        </div>

                        <aside className="flex min-w-0 flex-col gap-[18px]">
                            <div className="rounded-lg border border-m243-line bg-white p-4">
                                <div className="h-60 overflow-hidden rounded-md bg-[#F2EEE3]">
                                    <iframe
                                        src="/maps/centurion.html"
                                        title="Map of Centurion"
                                        loading="lazy"
                                        className="block h-60 w-full border-0"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="mt-4 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border border-m243-blue bg-white text-[16.5px] font-bold text-m243-blue hover:bg-m243-sky"
                                >
                                    View map
                                    <MapIcon size={18} />
                                </button>
                            </div>

                            <div className="rounded-lg border border-m243-line bg-white p-[22px]">
                                <div className="text-lg font-extrabold tracking-[-.01em] text-m243-navy">
                                    Centurion trends
                                </div>
                                <div className="mt-1 text-[15px] font-semibold text-m243-steel">
                                    Average property price
                                </div>
                                <svg
                                    viewBox="0 0 280 120"
                                    width="100%"
                                    height="120"
                                    className="mt-[18px] block"
                                    role="img"
                                    aria-label="Average price trending up to R 1.6 million"
                                >
                                    <text
                                        x="0"
                                        y="14"
                                        fontSize="11"
                                        fontWeight="800"
                                        fill="#7A8B99"
                                    >
                                        2M
                                    </text>
                                    <text
                                        x="0"
                                        y="112"
                                        fontSize="11"
                                        fontWeight="800"
                                        fill="#7A8B99"
                                    >
                                        1M
                                    </text>
                                    <path
                                        d="M30 12h250M30 106h250"
                                        stroke="#EEF2F5"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M34 72c40 6 70 4 104-3s74-10 138-14"
                                        stroke="#0A5FC2"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeLinecap="round"
                                    />
                                    <rect
                                        x="186"
                                        y="34"
                                        width="86"
                                        height="26"
                                        rx="13"
                                        fill="#0A5FC2"
                                    />
                                    <text
                                        x="200"
                                        y="51"
                                        fontSize="12.5"
                                        fontWeight="800"
                                        fill="#fff"
                                    >
                                        R 1.6 million
                                    </text>
                                </svg>
                                <div className="mt-3.5 text-[14.5px] leading-normal font-medium text-m243-slate">
                                    Median asking price over the last 12 months,
                                    based on 1 284 Centurion listings.
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
