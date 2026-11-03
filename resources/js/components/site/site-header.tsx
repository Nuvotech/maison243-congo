import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Logo, MenuIcon, CloseIcon } from '@/components/site/icons';
import { dashboard, home, login } from '@/routes';
import { index as propertiesIndex } from '@/routes/properties';

const navigation = [
    { label: 'Buy', href: propertiesIndex.url() },
    { label: 'Rent', href: propertiesIndex.url({ query: { mode: 'rent' } }) },
    { label: 'Sell', href: '#' },
    { label: 'New Developments', href: '#' },
    { label: 'Commercial', href: '#' },
    { label: 'Advice', href: '#' },
];

export default function SiteHeader() {
    const { auth } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const account = auth.user
        ? { label: 'Dashboard', href: dashboard.url() }
        : { label: 'Sign in', href: login.url() };

    return (
        <header className="sticky top-0 z-50 border-b border-m243-line bg-white">
            <div className="mx-auto flex max-w-[1320px] items-center gap-6 px-5 py-3.5 lg:px-6 lg:py-4">
                <Link href={home()} aria-label="Maison243 home">
                    <Logo />
                </Link>
                <nav className="hidden flex-1 items-center justify-center gap-[30px] xl:flex">
                    {navigation.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-base font-semibold whitespace-nowrap text-m243-navy hover:text-m243-red"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="ml-auto hidden flex-none items-center gap-2.5 xl:ml-0 xl:flex">
                    <a
                        href="#"
                        className="rounded border border-m243-line-strong px-5 py-3 text-[15.5px] font-bold whitespace-nowrap text-m243-navy hover:border-m243-blue hover:text-m243-blue"
                    >
                        List privately
                    </a>
                    <Link
                        href={account.href}
                        className="rounded border border-m243-red px-6 py-3 text-[15.5px] font-bold whitespace-nowrap text-m243-red hover:bg-m243-red hover:text-white"
                    >
                        {account.label}
                    </Link>
                </div>
                <button
                    type="button"
                    onClick={() => setIsMenuOpen((open) => !open)}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                    className="ml-auto flex size-11 flex-none cursor-pointer items-center justify-center rounded-lg border border-m243-line bg-white text-m243-navy xl:hidden"
                >
                    {isMenuOpen ? (
                        <CloseIcon size={22} />
                    ) : (
                        <MenuIcon size={22} />
                    )}
                </button>
            </div>
            {isMenuOpen && (
                <div className="flex flex-col gap-0.5 border-t border-m243-line bg-white px-5 pt-2 pb-5 xl:hidden">
                    {[...navigation, { label: 'Find an Agent', href: '#' }].map(
                        (item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="border-b border-[#F0F3F6] px-1 py-3.5 text-[17px] font-semibold text-m243-navy"
                            >
                                {item.label}
                            </Link>
                        ),
                    )}
                    <div className="mt-3.5 flex gap-2">
                        <a
                            href="#"
                            className="flex-1 rounded border border-m243-line-strong p-3.5 text-center text-base font-bold text-m243-navy"
                        >
                            List privately
                        </a>
                        <Link
                            href={account.href}
                            className="flex-1 rounded border border-m243-red p-3.5 text-center text-base font-bold text-m243-red"
                        >
                            {account.label}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
