import { Logo } from '@/components/site/icons';

const columns = [
    {
        title: 'Buy & Rent',
        links: [
            'Houses for sale',
            'Apartments to rent',
            'Commercial property',
            'Bond calculator',
        ],
    },
    {
        title: 'Sell',
        links: [
            'Free valuation',
            'List your property',
            'Compare agents',
            "Seller's guide",
        ],
    },
    {
        title: 'Developments',
        links: [
            'New developments',
            'Off-plan buying',
            'For developers',
            'Retirement estates',
        ],
    },
    {
        title: 'Company',
        links: ['About', 'Contact', 'Careers', 'Privacy', 'Terms'],
    },
];

const socialLinks = [
    {
        label: 'Instagram',
        icon: (
            <>
                <rect x="4" y="4" width="16" height="16" rx="5" />
                <circle cx="12" cy="12" r="3.6" />
                <circle cx="17" cy="7" r="1" />
            </>
        ),
    },
    {
        label: 'LinkedIn',
        icon: (
            <>
                <path d="M4 20V9m0-3.5v.01" />
                <path d="M10 20v-6a3 3 0 0 1 6 0v6" />
                <path d="M10 20v-7" />
            </>
        ),
    },
    {
        label: 'X',
        icon: (
            <path d="M21 5.5a9 9 0 0 1-2.6.9A4 4 0 0 0 12 9.5v1A11 11 0 0 1 4 6s-3 7 4 10a9 9 0 0 1-5 1.5c7 4 15 0 15-10.5a4 4 0 0 0 3-4.5Z" />
        ),
    },
];

export default function SiteFooter() {
    return (
        <footer className="bg-m243-navy px-5 pt-14 pb-10 lg:px-6 lg:pt-20 lg:pb-12">
            <div className="mx-auto max-w-[1200px]">
                <div className="grid grid-cols-1 gap-9 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] lg:gap-8">
                    <div>
                        <Logo inverted />
                        <p className="mt-4 max-w-[260px] text-base leading-[1.55] font-medium text-white/66">
                            South Africa's property platform — buy, rent, sell
                            and build, suburb by suburb.
                        </p>
                        <div className="mt-[22px] flex gap-2.5">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href="#"
                                    aria-label={social.label}
                                    className="flex size-10 items-center justify-center rounded-full border border-white/22 hover:bg-white/12"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#fff"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        aria-hidden="true"
                                    >
                                        {social.icon}
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>
                    {columns.map((column) => (
                        <div key={column.title}>
                            <div className="text-[13px] font-bold tracking-[.08em] text-m243-yellow uppercase">
                                {column.title}
                            </div>
                            <div className="mt-[18px] flex flex-col gap-3">
                                {column.links.map((link) => (
                                    <a
                                        key={link}
                                        href="#"
                                        className="text-base font-medium text-white/78 hover:text-white"
                                    >
                                        {link}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-11 grid items-center gap-5 rounded-2xl bg-white/6 p-6 lg:grid-cols-2 lg:px-8 lg:py-7">
                    <div>
                        <div className="text-[19px] font-bold tracking-[-.01em] text-white">
                            Weekly market letter
                        </div>
                        <div className="mt-1.5 text-[15.5px] font-medium text-white/68">
                            Price movements, new launches and rate news. Every
                            Thursday.
                        </div>
                    </div>
                    <form
                        className="flex flex-wrap gap-2.5"
                        onSubmit={(event) => event.preventDefault()}
                    >
                        <input
                            type="email"
                            placeholder="you@email.co.za"
                            aria-label="Email address"
                            className="h-[52px] min-w-[180px] flex-1 rounded-[11px] border border-white/28 bg-white/7 px-4 text-base font-medium text-white outline-none placeholder:text-white/50"
                        />
                        <button
                            type="submit"
                            className="h-[52px] cursor-pointer rounded-[11px] bg-m243-red px-6 text-[16.5px] font-bold text-white hover:bg-m243-red-dark"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>

                <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-white/14 pt-6">
                    <div className="text-[14.5px] font-medium text-white/55">
                        © 2026 Maison243 (Pty) Ltd. All rights reserved.
                    </div>
                    <div className="flex flex-wrap gap-5">
                        {['PAIA manual', 'POPIA', 'Sitemap'].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-[14.5px] font-medium text-white/55 hover:text-white"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
